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
    const searchQuery = `${exam} ${subject} preparation tutorial exam`;
    
    // Using YouTube Data API v3 (you'll need to get an API key)
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!YOUTUBE_API_KEY) {
      // Fallback: Return mock data if no API key
      return NextResponse.json({
        videos: generateMockVideos(exam, subject)
      });
    }

    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=10&order=relevance&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(youtubeUrl);
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error:', data.error);
      return NextResponse.json({
        videos: generateMockVideos(exam, subject)
      });
    }

    const videos = data.items?.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    })) || [];

    return NextResponse.json({ videos });

  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// Mock data generator for development/fallback
function generateMockVideos(exam, subject) {
  const mockVideos = [
    {
      id: 'mock1',
      title: `${exam} ${subject} - Complete Tutorial Series`,
      description: `Comprehensive ${subject} preparation for ${exam} exam. Covers all important topics with examples.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'EduPrep Channel',
      publishedAt: '2024-01-15T10:00:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock2',
      title: `${subject} Fundamentals for ${exam}`,
      description: `Master the fundamentals of ${subject} with this comprehensive guide for ${exam} preparation.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'StudyMaster',
      publishedAt: '2024-02-10T14:30:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock3',
      title: `${exam} ${subject} - Important Questions & Solutions`,
      description: `Previous year questions and solutions for ${subject} in ${exam}. Must watch for exam preparation.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'ExamAce',
      publishedAt: '2024-03-05T09:15:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock4',
      title: `${subject} Quick Revision - ${exam} Special`,
      description: `Quick revision notes and formulas for ${subject}. Perfect for last-minute ${exam} preparation.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'QuickLearn',
      publishedAt: '2024-03-20T16:45:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock5',
      title: `Advanced ${subject} Concepts for ${exam}`,
      description: `Deep dive into advanced ${subject} concepts specifically designed for ${exam} aspirants.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'AdvancedStudy',
      publishedAt: '2024-04-01T11:20:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock6',
      title: `${exam} ${subject} - Complete Syllabus Coverage`,
      description: `Full syllabus coverage of ${subject} for ${exam} with detailed explanations and examples.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'CompleteCourse',
      publishedAt: '2024-04-15T13:00:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock7',
      title: `${subject} Problem Solving for ${exam}`,
      description: `Step-by-step problem solving techniques for ${subject} in ${exam}. Boost your problem-solving skills.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'ProblemSolver',
      publishedAt: '2024-05-01T08:30:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock8',
      title: `${exam} ${subject} - Tips & Tricks`,
      description: `Expert tips and tricks for scoring high in ${subject} for ${exam}. Time-saving techniques included.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'ExpertTips',
      publishedAt: '2024-05-15T12:45:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock9',
      title: `${subject} Mock Tests for ${exam}`,
      description: `Practice mock tests and quizzes for ${subject} in ${exam}. Test your preparation level.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'MockTestPro',
      publishedAt: '2024-06-01T15:20:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'mock10',
      title: `${exam} ${subject} - Success Strategy`,
      description: `Proven success strategies for ${subject} in ${exam}. Learn from toppers and experts.`,
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channelTitle: 'SuccessGuru',
      publishedAt: '2024-06-15T10:10:00Z',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    }
  ];

  return mockVideos;
}