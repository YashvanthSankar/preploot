import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdfProcessor';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Debug: Checking user data for:', userId);

    // Get user's vector database
    const pdfProcessor = new PDFProcessor(userId);
    
    try {
      await pdfProcessor.initializeVectorStore();
      const results = await pdfProcessor.getAllDocuments();
      
      return NextResponse.json({
        userId,
        documentsFound: results.documents.length,
        documents: results.documents.slice(0, 3), // First 3 documents for preview
        metadataCount: results.metadatas.length,
        vectorStoreFile: pdfProcessor.vectorStoreFile,
        metadataFile: pdfProcessor.metadataFile
      });
    } catch (error) {
      return NextResponse.json({
        userId,
        error: error.message,
        vectorStoreFile: pdfProcessor.vectorStoreFile,
        metadataFile: pdfProcessor.metadataFile
      });
    }

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      details: error.message
    }, { status: 500 });
  }
}