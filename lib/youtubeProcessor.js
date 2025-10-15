import { Innertube } from 'youtubei.js';

export class YouTubeProcessor {
  static extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  static async getTranscript(videoId) {
    try {
      console.log('Attempting to fetch transcript for video:', videoId);
      
      // Create Innertube client
      const youtube = await Innertube.create();
      console.log('Innertube client created');
      
      // Get video info
      const info = await youtube.getInfo(videoId);
      console.log('Video info fetched:', info.basic_info.title);
      
      // Try to get transcript
      let fullText = '';
      let transcriptSource = 'none';
      
      try {
        const transcriptData = await info.getTranscript();
        console.log('Transcript fetched successfully');
        
        // Extract text from transcript
        if (transcriptData && transcriptData.transcript && transcriptData.transcript.content) {
          const segments = transcriptData.transcript.content.body.initial_segments;
          fullText = segments.map(segment => segment.snippet.text).join(' ');
          transcriptSource = 'captions';
        } else if (Array.isArray(transcriptData)) {
          fullText = transcriptData.map(item => item.text || item.snippet?.text || '').join(' ');
          transcriptSource = 'captions';
        }
      } catch (transcriptError) {
        console.warn('Captions not available, trying alternative methods:', transcriptError.message);
        transcriptSource = 'none';
      }
      
      // If no captions available, build content from video metadata
      if (!fullText || fullText.trim().length === 0) {
        console.log('📝 Building content from video metadata (no captions available)');
        
        const title = info.basic_info.title || 'Untitled Video';
        const description = info.basic_info.short_description || info.secondary_info?.description?.toString() || 'No description available';
        const channel = info.basic_info.channel?.name || info.basic_info.author || 'Unknown Channel';
        const category = info.basic_info.category || 'Education';
        const duration = info.basic_info.duration || 0;
        const viewCount = info.basic_info.view_count || 0;
        
        // Extract hashtags and keywords from description
        const hashtags = (description.match(/#\w+/g) || []).join(', ');
        const keywords = info.basic_info.keywords || [];
        
        // Build comprehensive content from metadata
        fullText = `
VIDEO CONTENT ANALYSIS
=====================

Title: ${title}

Channel: ${channel}
Category: ${category}
Duration: ${Math.floor(duration / 60)} minutes
Views: ${viewCount.toLocaleString()}

DESCRIPTION:
${description}

${keywords.length > 0 ? `KEYWORDS: ${keywords.join(', ')}` : ''}
${hashtags ? `TAGS: ${hashtags}` : ''}

CONTENT CONTEXT:
This is an educational video about "${title}" presented by ${channel}. Based on the title, description, and metadata, this video covers important concepts related to ${category.toLowerCase()}.

The video's description provides the following context and learning objectives:
${description.length > 500 ? description.substring(0, 500) + '...\n\n[See full description above for complete details]' : description}

KEY LEARNING POINTS (inferred from title and description):
${this.extractKeyPoints(title, description, keywords)}

EDUCATIONAL VALUE:
Students engaging with this video content should focus on understanding the main concepts presented in the title and description. The video "${title}" from ${channel} is designed to educate viewers about topics in ${category}.

Use the description and context provided above to understand what key concepts, principles, and ideas are being taught in this video. Generate quiz questions that test comprehension of the topics mentioned in the title and elaborated in the description.

Video URL: https://www.youtube.com/watch?v=${videoId}

Note: This content is derived from video metadata (title, description, keywords) as captions are not available. Quiz questions should focus on the concepts and topics explicitly mentioned in the description and title.
        `.trim();
        
        transcriptSource = 'metadata';
        console.log('✅ Built content from metadata, length:', fullText.length);
      }
      
      console.log(`📊 Content source: ${transcriptSource}, length: ${fullText.length}`);
      
      // Check if we actually have meaningful content
      if (fullText.trim().length < 100) {
        console.log('Content too short, throwing error');
        throw new Error('Insufficient content available');
      }
      
      return fullText.trim();
    } catch (error) {
      console.error(`❌ Failed to get any content for video ${videoId}:`, error.message);
      throw new Error(`Unable to extract content from video: ${error.message}`);
    }
  }

  // Helper method to extract key learning points from title/description
  static extractKeyPoints(title, description, keywords = []) {
    const points = [];
    
    // Extract from title (split by common separators)
    const titleParts = title.split(/[:|–—-]/);
    if (titleParts.length > 1) {
      points.push(`- Understanding ${titleParts[0].trim()}`);
      points.push(`- Exploring ${titleParts[1].trim()}`);
    } else {
      points.push(`- Core concepts of ${title}`);
    }
    
    // Extract from keywords
    if (keywords.length > 0) {
      const keywordStr = keywords.slice(0, 5).join(', ');
      points.push(`- Key topics: ${keywordStr}`);
    }
    
    // Extract sentences from description that look like learning objectives
    const sentences = description.split(/[.!?]+/);
    const objectiveSentences = sentences.filter(s => 
      s.toLowerCase().includes('learn') || 
      s.toLowerCase().includes('understand') || 
      s.toLowerCase().includes('discover') ||
      s.toLowerCase().includes('explore')
    ).slice(0, 2);
    
    objectiveSentences.forEach(sentence => {
      if (sentence.trim().length > 20) {
        points.push(`- ${sentence.trim()}`);
      }
    });
    
    return points.length > 0 ? points.join('\n') : '- Main concepts presented in the video\n- Practical applications of the topic\n- Key terminology and definitions';
  }

  static async processYouTubeUrl(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    const transcript = await this.getTranscript(videoId);
    return {
      videoId,
      transcript,
      url
    };
  }
}
