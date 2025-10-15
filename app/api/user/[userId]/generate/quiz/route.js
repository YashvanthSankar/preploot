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
      cache_id,
      num_questions = 5,
      difficulty = 'mixed'
    } = body;

    console.log(`🚀 Generating ${num_questions} quiz questions for user ${userId}`);
    console.log(`Cache ID: ${cache_id}, Difficulty: ${difficulty}`);

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

    // Get documents from the vector database
    let results;
    if (cache_id) {
      // If cache_id is provided, extract video ID from it and filter by source
      const videoId = cache_id.split('_').pop(); 
      const sourceFilter = `youtube_${videoId}`;
      
      results = await pdfProcessor.getDocumentsBySource(sourceFilter);
      console.log(`Found ${results.documents?.length || 0} documents for video ${videoId}`);
    } else {
      results = await pdfProcessor.getAllDocuments();
    }

    if (!results.documents || results.documents.length === 0) {
      const errorMsg = cache_id 
        ? 'No content available for this video. Please process the video first.'
        : 'No content available for quiz generation. Please upload documents first.';
      
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Extract text chunks from the vector database
    const textChunks = results.documents;
    console.log(`📚 Processing ${textChunks.length} text chunks`);

    // Generate quiz using Google AI
    const quizGenerator = new QuizGenerator();
    const questions = await quizGenerator.generateQuiz(textChunks, {
      num_questions: parseInt(num_questions),
      difficulty,
      similarity_threshold: 0.85,
      batch_size: 7
    });

    if (questions.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to generate quiz questions. Please try again with different parameters.' 
      }, { status: 500 });
    }

    console.log(`✅ Successfully generated ${questions.length} quiz questions`);

    return NextResponse.json({
      quiz_id: `quiz_${userId}_${Date.now()}`,
      user_id: userId,
      questions,
      metadata: {
        total_questions: questions.length,
        difficulty,
        generated_at: new Date().toISOString(),
        source: cache_id || 'general',
        generator: 'google_ai',
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