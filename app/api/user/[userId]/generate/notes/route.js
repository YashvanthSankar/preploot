import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdfProcessor';
import { NotesGenerator } from '@/lib/notesGenerator';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      similarity_threshold = 0.85,
      batch_size = 5,
      include_summary = true,
      include_key_terms = true
    } = body;

    // Get user's vector database
    const pdfProcessor = new PDFProcessor(userId);
    
    // Check if vector store exists
    try {
      await pdfProcessor.initializeVectorStore();
    } catch (error) {
      return NextResponse.json({ 
        error: 'No documents found. Please upload some documents first.' 
      }, { status: 400 });
    }

    // Get all documents from the vector database
    const results = await pdfProcessor.getAllDocuments();

    if (!results.documents || results.documents.length === 0) {
      return NextResponse.json({ 
        error: 'No content available for notes generation. Please upload documents first.' 
      }, { status: 400 });
    }

    // Extract text chunks from the vector database
    const textChunks = results.documents;

    // Generate notes
    const notesGenerator = new NotesGenerator();
    const notes = await notesGenerator.generateDetailedNotes(textChunks, {
      similarity_threshold: parseFloat(similarity_threshold),
      batch_size: parseInt(batch_size),
      include_summary,
      include_key_terms
    });

    if (!notes.sections || notes.sections.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to generate notes. Please try again with different parameters.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      notes_id: `notes_${userId}_${Date.now()}`,
      user_id: userId,
      ...notes,
      metadata: {
        source_chunks: textChunks.length,
        generated_at: new Date().toISOString(),
        processing_params: {
          similarity_threshold,
          batch_size,
          include_summary,
          include_key_terms
        }
      }
    });

  } catch (error) {
    console.error('Error generating notes:', error);
    return NextResponse.json({
      error: 'Failed to generate notes',
      details: error.message
    }, { status: 500 });
  }
}