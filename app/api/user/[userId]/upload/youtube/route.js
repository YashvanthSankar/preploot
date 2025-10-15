import { NextRequest, NextResponse } from 'next/server';
import { YouTubeProcessor } from '@/lib/youtubeProcessor';
import { PDFProcessor } from '@/lib/pdfProcessor';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function POST(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Extract video ID and get transcript (or fallback text)
    const youtubeData = await YouTubeProcessor.processYouTubeUrl(url);
    
    // Detect content type
    const isMetadataContent = youtubeData.transcript.includes('VIDEO CONTENT ANALYSIS') && 
                              youtubeData.transcript.includes('Note: This content is derived from video metadata');
    const isFallbackContent = 
      youtubeData.transcript.includes('does not have an available transcript') ||
      youtubeData.transcript.includes('transcript is not available') ||
      youtubeData.transcript.includes('fallback when video transcripts are not available') ||
      youtubeData.transcript.includes('Educational Video Analysis - YouTube Video ID');
    
    let contentType = 'transcript';
    let contentMessage = 'YouTube transcript processed successfully';
    
    if (isMetadataContent) {
      contentType = 'metadata';
      contentMessage = 'YouTube video processed using title and description (captions not available)';
      console.log('📋 Using video metadata (title, description, keywords)');
    } else if (isFallbackContent) {
      contentType = 'fallback';
      contentMessage = 'YouTube video processed (no content available - using fallback)';
      console.warn('⚠️  Using fallback content');
    } else {
      console.log('✅ Real transcript found!');
    }
    
    console.log(`📺 Processing YouTube video ${youtubeData.videoId}:`);
    console.log(`📊 Content type: ${contentType}`);
    console.log('📏 Content length:', youtubeData.transcript.length);
    console.log('📄 Content preview:', youtubeData.transcript.substring(0, 200) + '...');

    // Create PDF processor for this user to handle vector storage
    const pdfProcessor = new PDFProcessor(userId);
    
    // Create document from transcript
    const doc = new Document({
      pageContent: youtubeData.transcript,
      metadata: {
        source: `youtube_${youtubeData.videoId}`,
        url: youtubeData.url,
        videoId: youtubeData.videoId,
        userId: userId,
        type: 'youtube_transcript'
      }
    });

    console.log('Document pageContent length:', doc.pageContent.length);

    // Split transcript into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 100
    });
    
    const chunks = await textSplitter.splitDocuments([doc]);
    console.log('Number of chunks created:', chunks.length);

    // Initialize embeddings for PDFProcessor
    await pdfProcessor.initializeEmbeddings();

    // Prepare texts and metadata for storage
    const texts = chunks.map(chunk => chunk.pageContent);
    const metadatas = chunks.map((chunk, i) => ({
      ...chunk.metadata,
      chunk_index: i,
      timestamp: Date.now()
    }));

    // Store in file-based vector storage
    await pdfProcessor.addTextsToVectorstore(texts, metadatas);

    return NextResponse.json({
      message: contentMessage,
      video_id: youtubeData.videoId,
      url: youtubeData.url,
      chunks_processed: chunks.length,
      user_id: userId,
      cache_id: `yt_${userId}_${youtubeData.videoId}`,
      content_type: contentType,
      has_transcript: contentType === 'transcript',
      has_metadata: contentType === 'metadata'
    });

  } catch (error) {
    console.error('Error processing YouTube URL:', error);
    return NextResponse.json({
      error: 'Failed to process YouTube URL',
      details: error.message
    }, { status: 500 });
  }
}