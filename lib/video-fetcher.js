import { getCuratedVideos, searchCuratedVideos } from './curated-videos';

// Smart video fetching with multiple fallbacks
export class VideoFetcher {
  constructor() {
    this.quotaExceeded = false;
    this.lastQuotaReset = Date.now();
  }

  async getVideos(searchQuery, exam = null, subject = null) {
    const strategies = [
      () => this.tryYouTubeAPI(searchQuery),
      () => this.getCuratedContent(exam, subject, searchQuery),
      () => this.getOfflineContent(searchQuery),
      () => this.generateMockVideos(searchQuery)
    ];

    for (const strategy of strategies) {
      try {
        const results = await strategy();
        if (results && results.length > 0) {
          return {
            videos: results,
            source: strategy.name,
            success: true
          };
        }
      } catch (error) {
        console.warn(`Strategy ${strategy.name} failed:`, error);
        continue;
      }
    }

    return {
      videos: [],
      source: 'none',
      success: false,
      error: 'All video sources unavailable'
    };
  }

  async tryYouTubeAPI(searchQuery) {
    // Check if quota was exceeded recently (reset daily)
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (this.quotaExceeded && (now - this.lastQuotaReset) < dayInMs) {
      throw new Error('YouTube API quota exceeded');
    }

    if ((now - this.lastQuotaReset) >= dayInMs) {
      this.quotaExceeded = false;
      this.lastQuotaReset = now;
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
      throw new Error('No valid YouTube API key');
    }

    const enhancedQuery = `${searchQuery} -shorts -short -"#shorts" -"60 seconds" -"1 minute" -funny -meme -viral`;
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(enhancedQuery)}&key=${YOUTUBE_API_KEY}&type=video&videoDuration=medium&order=relevance`;
    
    const response = await fetch(youtubeUrl);
    const data = await response.json();

    if (!response.ok) {
      if (data.error?.errors?.[0]?.reason === 'quotaExceeded') {
        this.quotaExceeded = true;
        throw new Error('YouTube API quota exceeded');
      }
      throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('No videos found');
    }

    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      duration: 'N/A', // Would need additional API call to get duration
      views: 'N/A', // Would need additional API call to get view count
      mock: false
    }));

    // Cache successful results
    try {
      localStorage.setItem(`youtube_cache_${searchQuery}`, JSON.stringify({
        data: videos,
        timestamp: Date.now()
      }));
    } catch (e) {
      // localStorage might be full or unavailable
      console.warn('Failed to cache YouTube results:', e);
    }

    return videos;
  }

  getCuratedContent(exam, subject, searchQuery) {
    if (exam && subject) {
      return getCuratedVideos(exam, subject);
    }
    return searchCuratedVideos(searchQuery, exam);
  }

  getOfflineContent(searchQuery) {
    // Server-side doesn't have localStorage, skip caching
    throw new Error('No offline content available');
  }

  generateMockVideos(searchQuery) {
    // Generate educational mock videos as last resort
    const mockVideos = [];
    const topics = searchQuery.split(' ');
    
    for (let i = 1; i <= 10; i++) {
      mockVideos.push({
        id: `mock_${Date.now()}_${i}`,
        title: `${searchQuery} - Lecture ${i}`,
        channel: 'Educational Content',
        duration: `${Math.floor(Math.random() * 40) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        description: `Comprehensive ${searchQuery} tutorial covering key concepts and examples.`,
        thumbnail: `https://via.placeholder.com/480x360/0066cc/ffffff?text=${encodeURIComponent(searchQuery + ' ' + i)}`,
        views: `${Math.floor(Math.random() * 900 + 100)}K`,
        uploadDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        url: `https://youtube.com/watch?v=mock_${Date.now()}_${i}`,
        mock: true
      });
    }
    
    return mockVideos;
  }
}

// Singleton instance
export const videoFetcher = new VideoFetcher();