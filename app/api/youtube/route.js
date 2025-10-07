import { NextResponse } from 'next/server';
import YouTubeScraper from '@/lib/youtube-scraper';

const scraper = new YouTubeScraper();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const exam = searchParams.get('exam') || '';
    const subject = searchParams.get('subject') || '';
    const topic = searchParams.get('topic') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    let searchQuery = '';
    if (topic) {
      searchQuery = topic;
    } else if (subject) {
      searchQuery = subject;
    } else if (exam) {
      searchQuery = exam;
    } else {
      searchQuery = 'educational content';
    }

    console.log('YouTube scraping request:', exam, subject, topic);
    console.log('Search query:', searchQuery);

    const videos = await scraper.getTopLongFormVideos(searchQuery, exam, subject);

    const transformedVideos = videos.map(video => ({
      id: {
        videoId: video.id || 'unknown'
      },
      snippet: {
        title: video.title || 'Untitled Video',
        description: video.description || 'Educational content for competitive exam preparation.',
        thumbnails: {
          medium: {
            url: video.thumbnail || 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
          },
          high: {
            url: video.thumbnail || 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
          }
        },
        channelTitle: video.channelTitle || 'Educational Channel',
        publishedAt: video.publishedAt || 'Recently'
      },
      duration: video.duration || '0:00',
      durationSeconds: video.durationSeconds || 0,
      viewCount: video.viewCount,
      url: video.url,
      isLongForm: video.durationSeconds > 600,
      source: video.isBackup ? 'backup' : 'youtube'
    }));

    console.log('Successfully found', transformedVideos.length, 'long-form videos');

    return NextResponse.json({
      success: true,
      videos: transformedVideos,
      totalResults: transformedVideos.length,
      searchQuery,
      source: 'youtube-scraper'
    });

  } catch (error) {
    console.error('YouTube scraping error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch videos',
      videos: [],
      message: 'YouTube scraping temporarily unavailable.'
    }, { status: 500 });
  }
}