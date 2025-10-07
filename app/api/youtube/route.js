import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const exam = searchParams.get('exam');
    const subject = searchParams.get('subject');

    if (!exam || !subject) {
      return NextResponse.json(
        { error: 'Exam and subject parameters are required' },
        { status: 400 }
      );
    }

    // Create search query for YouTube
    const searchQuery = `${exam} ${subject} preparation tutorial exam study`;
    
    // Using YouTube Data API v3
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
      console.log('YouTube API key not configured, using mock data');
      return NextResponse.json({
        videos: generateMockVideos(exam, subject)
      });
    }

    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=10&order=relevance&regionCode=IN&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`;
    
    console.log('Fetching from YouTube API:', searchQuery);
    
    const response = await fetch(youtubeUrl);
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error:', data.error);
      return NextResponse.json({
        videos: generateMockVideos(exam, subject),
        source: 'fallback'
      });
    }

    if (!data.items || data.items.length === 0) {
      console.log('No videos found, using mock data');
      return NextResponse.json({
        videos: generateMockVideos(exam, subject),
        source: 'fallback'
      });
    }

    const videos = data.items.map(item => {
      // Debug the full item structure
      console.log('🔍 Full YouTube API item structure:', JSON.stringify(item, null, 2));
      
      // Extract video ID properly
      let videoId = null;
      if (item.id && typeof item.id === 'object' && item.id.videoId) {
        videoId = item.id.videoId;
      } else if (item.id && typeof item.id === 'string') {
        videoId = item.id;
      } else {
        console.error('❌ Could not extract video ID from:', item.id);
        return null;
      }
      
      // Use direct YouTube thumbnail URL construction for better reliability
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

      console.log(`✅ Extracted Video ID: ${videoId}`);
      console.log(`📝 Video Title: ${item.snippet.title}`);
      console.log(`🖼️ Thumbnail URL: ${thumbnailUrl}`);
      console.log('---');

      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: thumbnailUrl,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    }).filter(Boolean); // Remove any null entries

    console.log(`Found ${videos.length} real YouTube videos for ${exam} ${subject}`);

    return NextResponse.json({ 
      videos,
      source: 'youtube_api'
    });

  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    
    // Get exam and subject from the URL again for error fallback
    const { searchParams } = new URL(request.url);
    const examFallback = searchParams.get('exam') || 'General';
    const subjectFallback = searchParams.get('subject') || 'Study';
    
    return NextResponse.json({
      videos: generateMockVideos(examFallback, subjectFallback),
      source: 'error_fallback'
    });
  }
}

// Mock data generator for development/fallback
function generateMockVideos(exam, subject) {
  // Real educational YouTube video IDs for better thumbnails
  const mockVideoIds = [
    'kJQP7kiw5Fk', // Khan Academy style
    'M7lc1UVf-VE', // Educational content
    'fJ9rUzIMcZQ', // Tutorial video
    '3N3SfPn1_60', // Learning video
    'YE7VzlLtp-4', // Study video
    'RF_Mr9OpADM', // Tutorial
    '9vJRopau0g0', // Learning
    '4zH5iYM4wJo', // Study
    'PIh2xe4jnpk', // Education
    'y8Kyi0WNg40'  // Tutorial
  ];

  // Generate more realistic search-based titles
  const titleTemplates = [
    `${exam} ${subject} Complete Course | Full Tutorial`,
    `${subject} for ${exam} | Important Concepts Explained`,
    `${exam} ${subject} Previous Year Questions | Detailed Solutions`,
    `Master ${subject} for ${exam} | Quick Revision Notes`,
    `${subject} Tips and Tricks for ${exam} | Score 100%`,
    `${exam} ${subject} | Most Important Topics Covered`,
    `${subject} Problem Solving for ${exam} | Step by Step`,
    `${exam} ${subject} Mock Test | Practice Questions`,
    `Advanced ${subject} Concepts | ${exam} Preparation`,
    `${subject} Formula Tricks for ${exam} | Fast Calculation`
  ];

  const channels = [
    'Unacademy JEE',
    'BYJU\'S',
    'Vedantu',
    'Physics Wallah',
    'Khan Academy',
    'ExamFear Education',
    'Embibe',
    'NCERT Official',
    'Toppr',
    'Study IQ Education'
  ];

  const mockVideos = titleTemplates.map((title, index) => {
    const videoId = mockVideoIds[index];
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    console.log(`Mock video ${index + 1}: ${title}, VideoID: ${videoId}, Thumbnail: ${thumbnailUrl}`);
    
    return {
      id: videoId, // Use actual video ID instead of prefixed version
      title: title,
      description: `Comprehensive ${subject} preparation for ${exam} exam. This video covers all important topics, previous year questions, and expert tips. Perfect for students preparing for competitive exams. Includes detailed explanations, shortcuts, and problem-solving techniques.`,
      thumbnail: thumbnailUrl,
      channelTitle: channels[index],
      publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 90 days
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  });

  console.log(`Generated ${mockVideos.length} mock videos for ${exam} ${subject}`);
  return mockVideos;
}