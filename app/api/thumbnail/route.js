import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const quality = searchParams.get('quality') || 'mqdefault';
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // List of YouTube thumbnail CDNs to try
    const thumbnailUrls = [
      `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`,
      `https://img.youtube.com/vi/${videoId}/${quality}.jpg`,
      `https://i1.ytimg.com/vi/${videoId}/${quality}.jpg`,
      `https://i2.ytimg.com/vi/${videoId}/${quality}.jpg`,
      `https://i3.ytimg.com/vi/${videoId}/${quality}.jpg`,
      `https://i4.ytimg.com/vi/${videoId}/${quality}.jpg`,
    ];

    // Try different qualities if the requested one fails
    const qualityFallbacks = ['mqdefault', 'hqdefault', 'sddefault', 'maxresdefault', 'default'];
    
    for (const url of thumbnailUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          
          return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          });
        }
      } catch (error) {
        console.log(`Failed to fetch from ${url}:`, error.message);
        continue;
      }
    }

    // If all direct URLs fail, try different qualities
    for (const fallbackQuality of qualityFallbacks) {
      if (fallbackQuality === quality) continue; // Skip the already tried quality
      
      for (const baseUrl of [`https://i.ytimg.com/vi/${videoId}/`, `https://img.youtube.com/vi/${videoId}/`]) {
        try {
          const response = await fetch(`${baseUrl}${fallbackQuality}.jpg`);
          if (response.ok) {
            const imageBuffer = await response.arrayBuffer();
            
            return new NextResponse(imageBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
              },
            });
          }
        } catch (error) {
          continue;
        }
      }
    }

    // If everything fails, return a placeholder
    return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 });

  } catch (error) {
    console.error('Error proxying thumbnail:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}