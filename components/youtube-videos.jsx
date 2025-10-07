"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, Calendar, User, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

// List of fallback qualities, from highest to lowest quality/reliability
const THUMBNAIL_QUALITIES = [
  'maxresdefault', // Highest quality, often fails
  'sddefault',
  'hqdefault',
  'mqdefault',
  'default',     // Lowest quality, most reliable
];

export function YouTubeVideos({ exam, subject, isVisible }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [imageLoadStates, setImageLoadStates] = useState({});
  // NEW STATE: To control the current src for each video's thumbnail
  const [thumbnailSrcs, setThumbnailSrcs] = useState({}); 
  const router = useRouter();

  // Helper to get the next fallback URL
  const getNextThumbnailUrl = useCallback((videoId, currentQuality) => {
    const currentIndex = THUMBNAIL_QUALITIES.indexOf(currentQuality);
    
    if (currentIndex < THUMBNAIL_QUALITIES.length - 1) {
      const nextQuality = THUMBNAIL_QUALITIES[currentIndex + 1];
      return `https://img.youtube.com/vi/${videoId}/${nextQuality}.jpg`;
    }
    // Return null when all qualities are exhausted
    return null; 
  }, []);

  const handleImageLoad = (videoId) => {
    setImageLoadStates(prev => ({ ...prev, [videoId]: 'loaded' }));
  };

  // REFACTORED: Now updates state to trigger a re-render with a new src
  const handleImageError = useCallback((videoId, currentSrc) => {
    const currentQuality = currentSrc.split('/').pop()?.replace('.jpg', '');
    const nextUrl = getNextThumbnailUrl(videoId, currentQuality);
    
    if (nextUrl) {
      // 1. Set new state for the thumbnail URL
      setThumbnailSrcs(prev => ({ ...prev, [videoId]: nextUrl }));
      // 2. Clear imageLoadStates to restart the loading cycle
      setImageLoadStates(prev => ({ ...prev, [videoId]: 'loading' }));
      console.log(`🔄 Retrying ${videoId} with quality: ${nextUrl.split('/').pop()}`);
    } else {
      // 3. All retries failed - set final error state for fallback UI
      setImageLoadStates(prev => ({ ...prev, [videoId]: 'error' }));
      console.log(`💥 All retries failed for ${videoId}. Switching to fallback UI.`);
    }
  }, [getNextThumbnailUrl]);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    setImageLoadStates({});
    setThumbnailSrcs({}); // Reset thumbnail sources

    try {
      const response = await fetch(`/api/youtube?exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(subject)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        const videoList = data.videos || [];
        setVideos(videoList);
        setDataSource(data.source);
        
        // Initialize state with the highest quality thumbnail
        const initialSrcs = videoList.reduce((acc, video) => {
          acc[video.id] = `https://img.youtube.com/vi/${video.id}/${THUMBNAIL_QUALITIES[0]}.jpg`;
          return acc;
        }, {});
        setThumbnailSrcs(initialSrcs);
        setImageLoadStates(videoList.reduce((acc, video) => {
             acc[video.id] = 'loading'; // Explicitly set initial loading state
             return acc;
        }, {}));
        
        console.log('🎬 Loaded videos:', videoList.length);
      }
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Existing helper functions (truncateText, formatDate, handleWatchVideo) remain the same...
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || typeof text !== 'string') return 'No description available';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const handleWatchVideo = (video) => {
    const title = video.snippet?.title || video.title || 'Untitled Video';
    const channelTitle = video.snippet?.channelTitle || video.channelTitle || 'Unknown Channel';
    const videoId = video.id?.videoId || video.id || 'unknown';
    
    const params = new URLSearchParams({
      title: encodeURIComponent(title),
      channel: encodeURIComponent(channelTitle),
      exam: exam || '',
      subject: subject || '',
      topic: ''
    });
    
    router.push(`/video/${videoId}?${params.toString()}`);
  };


  if (!isVisible) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-red-500" />
            <span>Top YouTube Videos for {exam} - {subject}</span>
          </div>
          {dataSource && (
            <div className="text-xs px-2 py-1 rounded-full bg-muted">
              {dataSource === 'youtube_api' ? (
                <span className="text-green-600">🔴 Live YouTube Data</span>
              ) : (
                <span className="text-amber-600">📋 Demo Data</span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading videos...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchVideos} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, index) => {
              const currentThumbnailSrc = thumbnailSrcs[video.id];

              return (
              <Card key={video.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="relative group cursor-pointer" onClick={() => handleWatchVideo(video)}>
                  {imageLoadStates[video.id] === 'error' ? (
                    // Fallback UI when all retries have failed
                    <div className="w-full h-48 bg-gradient-to-br from-red-600 via-red-500 to-red-700 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12"></div>
                      </div>
                      <div className="relative z-10 text-white text-center p-4 max-w-full">
                        <div className="bg-red-600 rounded-full p-3 mx-auto mb-3 w-16 h-16 flex items-center justify-center shadow-lg">
                          <Play className="h-8 w-8 text-white fill-current" />
                        </div>
                        <h4 className="text-sm font-semibold leading-tight line-clamp-2 mb-2">
                          {truncateText(video.snippet?.title || video.title, 60)}
                        </h4>
                        <p className="text-xs opacity-90">{video.snippet?.channelTitle || video.channelTitle || 'Unknown Channel'}</p>
                        <div className="mt-2 text-xs opacity-75 bg-black bg-opacity-30 rounded px-2 py-1 inline-block">
                          Click to Watch
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Thumbnail attempt block
                    <>
                      {/* Loading placeholder */}
                      {imageLoadStates[video.id] !== 'loaded' && (
                        <div className="absolute inset-0 w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center z-20">
                          <div className="text-center">
                            <div className="animate-pulse">
                              <Play className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                            </div>
                            <p className="text-gray-600 text-sm">Loading thumbnail...</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Actual image */}
                      <img 
                        // CRITICAL FIX: Use state for the src
                        src={currentThumbnailSrc || `https://img.youtube.com/vi/${video.id}/default.jpg`} 
                        alt={video.title}
                        className={`w-full h-48 object-cover rounded-t-lg transition-opacity duration-500 ${
                          imageLoadStates[video.id] === 'loaded' ? 'opacity-100' : 'opacity-0'
                        } ${currentThumbnailSrc ? '' : 'hidden'}`} // Hide if src hasn't been initialized yet
                        loading="eager"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer-when-downgrade"
                        decoding="async"
                        style={{ 
                          backgroundColor: '#1a1a1a',
                          minHeight: '192px'
                        }}
                        onLoad={() => handleImageLoad(video.id)}
                        // CRITICAL FIX: Pass the current src to the handler
                        onError={(e) => handleImageError(video.id, e.target.src)} 
                      />

                      {/* Overlay and Badge */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs font-semibold z-30">
                        #{index + 1}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center rounded-t-lg z-30">
                        <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">
                    {truncateText(video.snippet?.title || video.title, 80)}
                  </h3>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <User className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="mr-3 truncate">{video.snippet?.channelTitle || video.channelTitle || 'Unknown Channel'}</span>
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{formatDate(video.snippet?.publishedAt || video.publishedAt)}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {truncateText(video.snippet?.description || video.description, 100)}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWatchVideo(video);
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Watch
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(video.url, '_blank');
                      }}
                      title="Open on YouTube"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No videos found for this subject.</p>
            <Button onClick={fetchVideos} variant="outline" className="mt-4">
              Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}