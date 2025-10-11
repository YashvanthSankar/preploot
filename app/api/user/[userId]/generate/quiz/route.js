import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdfProcessor';
import { QuizGenerator } from '@/lib/quizGenerator';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      num_questions = 10,
      difficulty = 'mixed',
      similarity_threshold = 0.85,
      batch_size = 7
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
        error: 'No content available for quiz generation. Please upload documents first.' 
      }, { status: 400 });
    }

    // Extract text chunks from the vector database
    const textChunks = results.documents;

    // Generate quiz
    const quizGenerator = new QuizGenerator();
    const questions = await quizGenerator.generateQuiz(textChunks, {
      num_questions: parseInt(num_questions),
      difficulty,
      similarity_threshold: parseFloat(similarity_threshold),
      batch_size: parseInt(batch_size)
    });

    if (questions.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to generate quiz questions. Please try again with different parameters.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      quiz_id: `quiz_${userId}_${Date.now()}`,
      user_id: userId,
      questions,
      metadata: {
        total_questions: questions.length,
        difficulty,
        generated_at: new Date().toISOString(),
        source_chunks: textChunks.length
      }
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({
      error: 'Failed to generate quiz',
      details: error.message
    }, { status: 500 });
  }
}