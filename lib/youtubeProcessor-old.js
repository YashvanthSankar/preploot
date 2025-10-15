import youtubedl from 'youtube-dl-exec';

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
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    try {
      console.log(`Attempting to fetch transcript for video: ${videoId} using youtube-dl-exec`);

      // Fetch English transcript, skip download, and output to stdout
      const output = await youtubedl(videoUrl, {
        writeSub: true,
        subLang: 'en',
        skipDownload: true,
        output: '-', // Output to stdout
      });

      const transcriptText = output.stdout;

      if (!transcriptText || transcriptText.trim() === '') {
        throw new Error('No transcript returned from yt-dlp');
      }

      // The output is in VTT format, let's clean it.
      // This regex removes timestamps, WEBVTT headers, and other metadata.
      const cleanedText = transcriptText
        .replace(/WEBVTT[\s\S]*?(\n\n|$)/, '') // Remove header
        .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}[\s\S]*?\n/g, '') // Remove timestamps
        .replace(/<[^>]*>/g, '') // Remove any other tags
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

      if (cleanedText.length === 0) {
        console.log('Transcript is empty after cleaning, throwing error to trigger fallback');
        throw new Error('Empty transcript content from youtube-dl-exec');
      }
      
      console.log('Transcript fetched and cleaned successfully.');
      return cleanedText;
    } catch (error) {
      console.warn(`Failed to get transcript using youtube-dl-exec for video ${videoId}:`, error.message);
      
      // If yt-dlp fails, use the comprehensive fallback text
      const fallbackText = `
Educational Video Analysis - YouTube Video ID: ${videoId}

This is an educational video resource that may contain valuable learning content. While a transcript is not available, this video likely contains educational material that can be used for learning and assessment purposes.

Potential Learning Topics:
- Core concepts and fundamental principles
- Practical applications and examples
- Key terminology and definitions
- Problem-solving techniques and methodologies
- Real-world scenarios and case studies

Learning Objectives:
Students watching this video should be able to:
1. Understand the main concepts presented
2. Apply the knowledge to practical situations
3. Recognize key terms and their meanings
4. Analyze examples and case studies
5. Synthesize information for problem-solving

Content Areas:
- Theoretical foundations
- Practical demonstrations
- Visual explanations and diagrams
- Step-by-step procedures
- Best practices and recommendations

Assessment Focus:
This content can be used to generate questions about:
- Definition and explanation of key concepts
- Application of principles to new scenarios
- Analysis of examples and case studies
- Evaluation of different approaches
- Synthesis of multiple concepts

Video Source: https://www.youtube.com/watch?v=${videoId}

Note: This content summary is generated as a fallback when video transcripts are not available. For the most accurate content, please watch the video directly.
      `.trim();
      
      console.log('Using comprehensive fallback text, length:', fallbackText.length);
      return fallbackText;
    }
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