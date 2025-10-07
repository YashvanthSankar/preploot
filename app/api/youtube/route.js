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

    // Create highly specific search query for educational content with view count priority
    const baseQuery = `${exam} ${subject}`;
    const educationalTerms = ['complete course', 'full tutorial', 'lecture series', 'comprehensive guide', 'detailed explanation'];
    const excludeTerms = ['-shorts', '-short', '-"#shorts"', '-"60 seconds"', '-"1 minute"', '-funny', '-meme', '-viral'];
    
    // Try multiple search strategies for better results
    const searchQueries = [
      `${baseQuery} ${educationalTerms[0]} ${excludeTerms.join(' ')}`,
      `${baseQuery} preparation tutorial ${excludeTerms.join(' ')}`,
      `"${exam}" "${subject}" complete course ${excludeTerms.join(' ')}`
    ];
    
    // Using YouTube Data API v3
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
      console.log('YouTube API key not configured, using mock data');
      return NextResponse.json({
        videos: generateMockVideos(exam, subject),
        source: 'mock'
      });
    }

    console.log('YouTube API Key found:', YOUTUBE_API_KEY ? 'Yes' : 'No');
    console.log('Using real YouTube API for search');

    // Try multiple search approaches prioritizing view count
    let allVideos = [];
    
    for (let i = 0; i < Math.min(2, searchQueries.length); i++) {
      const searchQuery = searchQueries[i];
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=15&order=viewCount&regionCode=IN&relevanceLanguage=en&videoDuration=medium&key=${YOUTUBE_API_KEY}`;
      
      console.log(`Fetching from YouTube API (attempt ${i + 1}):`, searchQuery);
      
      try {
        const response = await fetch(youtubeUrl);
        const data = await response.json();
        
        console.log(`YouTube API Response for attempt ${i + 1}:`, {
          status: response.status,
          hasItems: data.items ? data.items.length : 0,
          error: data.error ? data.error.message : 'None'
        });
        
        if (data.error) {
          console.error(`YouTube API Error (attempt ${i + 1}):`, data.error);
          
          // Check if it's a quota exceeded error
          if (data.error.errors && data.error.errors[0]?.reason === 'quotaExceeded') {
            console.log('YouTube API quota exceeded, falling back to mock videos');
            return NextResponse.json({
              videos: generateMockVideos(exam, subject),
              source: 'quota_exceeded',
              message: 'YouTube API quota exceeded, showing sample videos'
            });
          }
        }
        
        if (data.items && data.items.length > 0) {
          allVideos.push(...data.items);
          console.log(`Added ${data.items.length} videos from attempt ${i + 1}`);
        }
      } catch (error) {
        console.log(`Search attempt ${i + 1} failed:`, error.message);
      }
    }
    
    // If no results from multiple searches, fall back to basic search
    if (allVideos.length === 0) {
      const fallbackQuery = `${exam} ${subject} tutorial -shorts`;
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(fallbackQuery)}&type=video&maxResults=20&order=viewCount&regionCode=IN&relevanceLanguage=en&key=${YOUTUBE_API_KEY}`;
      
      console.log('Using fallback search:', fallbackQuery);
      
      const response = await fetch(youtubeUrl);
      const data = await response.json();

      if (data.error) {
        console.error('YouTube API Error:', data.error);
        
        // Check if it's a quota exceeded error
        if (data.error.errors && data.error.errors[0]?.reason === 'quotaExceeded') {
          console.log('YouTube API quota exceeded, falling back to mock videos');
          return NextResponse.json({
            videos: generateMockVideos(exam, subject),
            source: 'quota_exceeded',
            message: 'YouTube API quota exceeded, showing sample videos'
          });
        }
        
        return NextResponse.json({
          videos: generateMockVideos(exam, subject),
          source: 'fallback'
        });
      }
      
      if (data.items && data.items.length > 0) {
        allVideos.push(...data.items);
      }
    }

    if (allVideos.length === 0) {
      console.log('No videos found, using mock data');
      return NextResponse.json({
        videos: generateMockVideos(exam, subject),
        source: 'fallback'
      });
    }
    
    // Remove duplicates based on video ID
    const uniqueVideos = [];
    const seenIds = new Set();
    
    for (const item of allVideos) {
      const videoId = item.id?.videoId || item.id;
      if (videoId && !seenIds.has(videoId)) {
        seenIds.add(videoId);
        uniqueVideos.push(item);
      }
    }

    // Advanced filtering for high-quality educational content with view count consideration
    const filteredVideos = uniqueVideos.filter(item => {
      const title = item.snippet.title.toLowerCase();
      const description = item.snippet.description.toLowerCase();
      const channelTitle = item.snippet.channelTitle.toLowerCase();
      
      // Keywords that indicate shorts or irrelevant content
      const shortIndicators = [
        'short', 'shorts', '#shorts', '60 seconds', '1 minute', 'quick tip',
        'in 30 seconds', 'funny', 'meme', 'tiktok', 'viral', 'subscribe now',
        'like and share', 'comment below', 'trending', 'clickbait'
      ];
      
      // High-quality educational keywords (weighted by importance)
      const highValueKeywords = [
        'complete course', 'full tutorial', 'lecture series', 'comprehensive',
        'detailed explanation', 'step by step', 'previous year', 'solved examples',
        'important questions', 'exam preparation', 'concept clarity'
      ];
      
      const educationalKeywords = [
        'tutorial', 'lecture', 'explanation', 'solved', 'solution', 'concept',
        'complete', 'full', 'course', 'chapter', 'lesson', 'learn', 'study',
        'preparation', 'exam', 'notes', 'important', 'practice', 'theory',
        'problems', 'questions', 'syllabus', 'revision', 'analysis'
      ];
      
      // Trusted educational channels (bonus scoring)  
      const trustedChannels = [
        'unacademy', 'physics wallah', 'vedantu', 'byjus', 'khan academy',
        'examfear', 'doubtnut', 'toppr', 'embibe', 'ncert', 'aakash'
      ];
      
      // Calculate relevance score
      let relevanceScore = 0;
      
      // Check for shorts (immediate rejection)
      const isShort = shortIndicators.some(indicator => 
        title.includes(indicator) || description.includes(indicator)
      );
      if (isShort) return false;
      
      // High-value content bonus
      const hasHighValueContent = highValueKeywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword)
      );
      if (hasHighValueContent) relevanceScore += 10;
      
      // Educational content check
      const educationalMatches = educationalKeywords.filter(keyword => 
        title.includes(keyword) || description.includes(keyword)
      ).length;
      relevanceScore += educationalMatches * 2;
      
      // Trusted channel bonus
      const isTrustedChannel = trustedChannels.some(channel => 
        channelTitle.includes(channel)
      );
      if (isTrustedChannel) relevanceScore += 5;
      
      // Subject relevance check
      const subjectRelevance = [
        title.includes(exam.toLowerCase()),
        title.includes(subject.toLowerCase()),
        description.includes(exam.toLowerCase()),
        description.includes(subject.toLowerCase())
      ].filter(Boolean).length;
      relevanceScore += subjectRelevance * 3;
      
      // Minimum relevance threshold
      return relevanceScore >= 5;
    });
    
    // Sort by relevance score for better ordering
    const scoredVideos = filteredVideos.map(item => {
      const title = item.snippet.title.toLowerCase();
      const description = item.snippet.description.toLowerCase();
      const channelTitle = item.snippet.channelTitle.toLowerCase();
      
      let score = 0;
      
      // High-value keywords
      if (title.includes('complete') || title.includes('full')) score += 8;
      if (title.includes('course') || title.includes('tutorial')) score += 6;
      if (title.includes('lecture') || title.includes('explanation')) score += 5;
      if (title.includes('previous year') || title.includes('important')) score += 7;
      
      // Exact subject/exam match bonus
      if (title.includes(exam.toLowerCase()) && title.includes(subject.toLowerCase())) score += 10;
      
      // Channel trust score
      const trustedChannels = ['unacademy', 'physics wallah', 'vedantu', 'byjus', 'khan academy'];
      if (trustedChannels.some(channel => channelTitle.includes(channel))) score += 6;
      
      return { ...item, relevanceScore: score };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Get detailed video information including duration and view count
    const videoIds = scoredVideos.map(item => {
      if (item.id && typeof item.id === 'object' && item.id.videoId) {
        return item.id.videoId;
      } else if (item.id && typeof item.id === 'string') {
        return item.id;
      }
      return null;
    }).filter(Boolean);

    let videoDetails = {};
    
    if (videoIds.length > 0) {
      const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`;
      
      try {
        const videoDetailsResponse = await fetch(videoDetailsUrl);
        const videoDetailsData = await videoDetailsResponse.json();
        
        if (videoDetailsData.items) {
          videoDetailsData.items.forEach(video => {
            videoDetails[video.id] = {
              duration: video.contentDetails?.duration,
              viewCount: parseInt(video.statistics?.viewCount || '0'),
              likeCount: parseInt(video.statistics?.likeCount || '0'),
              commentCount: parseInt(video.statistics?.commentCount || '0')
            };
          });
        }
      } catch (error) {
        console.log('Could not fetch video details, proceeding without detailed stats');
      }
    }

    // Process videos with view count and duration filtering
    const processedVideos = scoredVideos.map(item => {
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
      
      const details = videoDetails[videoId] || {};
      
      // Check duration (skip shorts)
      if (details.duration) {
        const match = details.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = parseInt(match[1] || 0);
          const minutes = parseInt(match[2] || 0);
          const seconds = parseInt(match[3] || 0);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          
          // Skip videos under 3 minutes (likely shorts or low-quality content)
          if (totalSeconds < 180) {
            console.log(`⏭️ Skipping short video (${Math.floor(totalSeconds/60)}:${totalSeconds%60}): ${item.snippet.title.slice(0, 50)}...`);
            return null;
          }
        }
      }
      
      // Calculate final score including view count
      let finalScore = item.relevanceScore || 0;
      
      // View count bonus (logarithmic scale to prevent single viral video dominance)
      if (details.viewCount > 0) {
        const viewBonus = Math.log10(details.viewCount) * 2;
        finalScore += viewBonus;
      }
      
      // Engagement ratio bonus
      if (details.viewCount > 0 && details.likeCount > 0) {
        const engagementRatio = details.likeCount / details.viewCount;
        if (engagementRatio > 0.01) finalScore += 3; // Good engagement
      }
      
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

      console.log(`✅ High-Quality Video (Score: ${finalScore.toFixed(1)}): ${item.snippet.title.slice(0, 60)}...`);
      console.log(`📺 Channel: ${item.snippet.channelTitle}`);
      console.log(`👀 Views: ${details.viewCount?.toLocaleString() || 'N/A'}`);
      console.log('---');

      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: thumbnailUrl,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        viewCount: details.viewCount || 0,
        finalScore: finalScore
      };
    }).filter(Boolean);
    
    // Sort by final score (relevance + views + engagement) and limit results
    const videos = processedVideos
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 10);

    console.log(`Found ${videos.length} high-quality YouTube videos for ${exam} ${subject}`);

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
  // Real educational YouTube video IDs for better thumbnails (actual educational content)
  const mockVideoIds = [
    'b1t41Q3xRM8', // Khan Academy Physics - Forces and Newton's laws
    '0jbRlkAtRnw', // Physics - Kinematics
    'VKkcTpCur7g', // Physics - Energy and Work
    'MiUQAGZnbZ8', // Physics - Momentum
    'F_YdIfOjnh0', // Physics - Waves
    'Xwcz7Q3YJ3Y', // Physics - Thermodynamics
    'IXof65rUdKw', // Khan Academy - Circular Motion
    'YlGpe42jKtA', // Physics - Electric Fields
    'eKWQhkG0g1E', // Physics - Magnetic Fields
    'OoO5d5P0Jn4'  // Physics - Optics
  ];

  // Generate more specific educational titles based on exam and subject
  const getSubjectSpecificTitles = (exam, subject) => {
    const baseTemplates = [
      `Complete ${subject} Course for ${exam} | Full Syllabus Covered`,
      `${subject} Fundamentals | ${exam} Preparation Strategy`,
      `${exam} ${subject} Previous Year Analysis | Important Questions`,
      `Master ${subject} in 30 Days | ${exam} Success Formula`,
      `${subject} Problem Solving Techniques | ${exam} Expert Tips`,
      `${exam} ${subject} | Chapter-wise Important Topics`,
      `Advanced ${subject} Concepts | ${exam} Level Questions`,
      `${subject} Complete Revision | ${exam} Last Minute Preparation`,
      `${exam} ${subject} Mock Test Discussion | Detailed Solutions`,
      `${subject} Formula Derivations | ${exam} Theory + Numericals`
    ];

    // Add subject-specific variations
    if (subject.toLowerCase().includes('physics')) {
      return [
        ...baseTemplates,
        `${exam} Physics Mechanics | Complete Chapter`,
        `Thermodynamics for ${exam} | Detailed Explanation`,
        `${exam} Physics Waves & Optics | Important Concepts`
      ];
    } else if (subject.toLowerCase().includes('chemistry')) {
      return [
        ...baseTemplates,
        `${exam} Organic Chemistry | Reaction Mechanisms`,
        `Physical Chemistry for ${exam} | Numerical Problems`,
        `${exam} Inorganic Chemistry | Important Compounds`
      ];
    } else if (subject.toLowerCase().includes('math')) {
      return [
        ...baseTemplates,
        `${exam} Calculus | Differentiation & Integration`,
        `Algebra for ${exam} | Quadratic Equations`,
        `${exam} Coordinate Geometry | Important Formulas`
      ];
    }
    
    return baseTemplates;
  };

  const titleTemplates = getSubjectSpecificTitles(exam, subject);

  // More realistic educational channels
  const educationalChannels = [
    'Unacademy JEE',
    'Physics Wallah - Alakh Pandey',
    'BYJU\'S Classes',
    'Vedantu JEE',
    'Khan Academy',
    'ExamFear Education',
    'NCERT Official',
    'Doubtnut',
    'Toppr',
    'Study IQ Education',
    'Embibe',
    'Aakash Digital'
  ];

  const mockVideos = titleTemplates.slice(0, 10).map((title, index) => {
    const videoId = mockVideoIds[index];
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    // Create more detailed, subject-specific descriptions
    const descriptions = [
      `Complete ${subject} tutorial for ${exam} aspirants. This comprehensive lecture covers fundamental concepts, important formulas, and previous year question patterns. Duration: 45+ minutes of in-depth explanation with solved examples.`,
      `Detailed ${subject} explanation specifically designed for ${exam} preparation. Covers theory, numerical problems, and exam strategies. Includes chapter-wise breakdown and important topics analysis.`,
      `Expert-level ${subject} content for ${exam} students. Features step-by-step problem solving, concept clarity, and exam-focused approach. Perfect for revision and concept building.`,
      `Comprehensive ${subject} course for ${exam} preparation. Includes theoretical concepts, practical applications, and previous year question analysis. Taught by experienced faculty.`,
      `In-depth ${subject} tutorial covering complete syllabus for ${exam}. Features detailed explanations, solved examples, and exam preparation strategies. Essential for competitive exam success.`,
      `Complete ${subject} revision for ${exam} candidates. Covers all important topics, formulas, and concepts. Includes previous year questions and expert tips for exam success.`,
      `Advanced ${subject} concepts for ${exam} preparation. Features detailed theory, numerical problems, and application-based questions. Perfect for building strong foundation.`,
      `Comprehensive ${subject} study material for ${exam} aspirants. Includes complete syllabus coverage, important questions, and exam preparation strategies.`,
      `Expert ${subject} tutorial for ${exam} students. Features detailed explanations, solved examples, and previous year question patterns. Essential for exam preparation.`,
      `Complete ${subject} course with exam-focused approach for ${exam}. Covers theory, numericals, and important topics with detailed explanations and practice questions.`
    ];
    
    console.log(`Mock video ${index + 1}: ${title.slice(0, 50)}...`);
    
    return {
      id: videoId,
      title: title,
      description: descriptions[index] || descriptions[0],
      thumbnail: thumbnailUrl,
      channelTitle: educationalChannels[index] || educationalChannels[0],
      publishedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 6 months
      url: `https://www.youtube.com/watch?v=${videoId}`,
      viewCount: Math.floor(Math.random() * 1000000) + 50000, // Random view count between 50k-1M
      finalScore: Math.random() * 50 + 20 // Random score for sorting
    };
  });

  console.log(`Generated ${mockVideos.length} educational mock videos for ${exam} ${subject}`);
  return mockVideos;
}