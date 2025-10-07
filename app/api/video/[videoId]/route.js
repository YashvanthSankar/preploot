import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { videoId } = params;
    const { searchParams } = new URL(request.url);
    const exam = searchParams.get('exam');
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');

    // For now, return mock data
    // TODO: Integrate with YouTube Data API v3 to get more detailed video information
    // TODO: Integrate with AI service to generate quiz and notes based on video content
    
    const videoData = {
      id: videoId,
      metadata: {
        exam,
        subject,
        topic,
        lastUpdated: new Date().toISOString()
      },
      quiz: {
        generated: true,
        questions: 4,
        difficulty: 'medium',
        topics: [subject, topic].filter(Boolean)
      },
      notes: {
        generated: true,
        sections: 4,
        keyPoints: 12,
        tips: 4
      },
      recommendations: [
        `Additional ${subject} practice problems`,
        `Related ${exam} preparation videos`,
        `Previous year questions on ${topic}`,
        `Advanced concepts in ${subject}`
      ]
    };

    return NextResponse.json({
      success: true,
      data: videoData
    });

  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch video metadata' 
      },
      { status: 500 }
    );
  }
}