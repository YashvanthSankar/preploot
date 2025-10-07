"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, Calendar, User, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function YouTubeVideos({ exam, subject, isVisible }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (isVisible && exam && subject) {
      fetchVideos();
    }
  }, [exam, subject, isVisible]);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    setImageLoadStates({});
    
    try {
      const response = await fetch(`/api/youtube?exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(subject)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setVideos(data.videos || []);
        setDataSource(data.source);
        console.log('🎬 Loaded videos:', data.videos?.length);
      }
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (videoId) => {
    console.log('✅ Thumbnail loaded successfully for:', videoId);
    setImageLoadStates(prev => ({ ...prev, [videoId]: 'loaded' }));
  };

  const handleImageError = (videoId, currentAttempt = 0) => {
    console.log('❌ Thumbnail failed for:', videoId, 'Attempt:', currentAttempt);
    
    // Mark as error after all attempts
    if (currentAttempt >= 3) {
      setImageLoadStates(prev => ({ ...prev, [videoId]: 'error' }));
      return;
    }
    
    // Try different thumbnail URLs
    const thumbnailUrls = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, 
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/sddefault.jpg`
    ];
    
    // Update the src for retry
    setTimeout(() => {
      const imgElement = document.querySelector(`[data-video-id="${videoId}"]`);
      if (imgElement && currentAttempt < thumbnailUrls.length - 1) {
        imgElement.src = thumbnailUrls[currentAttempt + 1];
      }
    }, 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  const handleWatchVideo = (video) => {
    const params = new URLSearchParams({
      title: encodeURIComponent(video.title),
      channel: encodeURIComponent(video.channelTitle),
      exam: exam || '',
      subject: subject || '',
      topic: ''
    });
    
    router.push(`/video/${video.id}?${params.toString()}`);
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
            {videos.map((video, index) => (
              <Card key={video.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="relative group cursor-pointer" onClick={() => handleWatchVideo(video)}>
                  {/* Always show fallback first, then try to load thumbnail */}
                  {imageLoadStates[video.id] === 'loaded' ? (
                    // Successfully loaded thumbnail
                    <div className="relative">
                      <img 
                        data-video-id={video.id}
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                        style={{ 
                          backgroundColor: '#000',
                          minHeight: '192px'
                        }}
                        onLoad={() => handleImageLoad(video.id)}
                        onError={() => handleImageError(video.id)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center rounded-t-lg">
                        <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ) : (
                    // Custom thumbnail with YouTube-style design
                    <div className="w-full h-48 bg-gradient-to-br from-red-600 via-red-500 to-red-700 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      {/* YouTube-style background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12"></div>
                      </div>
                      
                      {/* Content overlay */}
                      <div className="relative z-10 text-white text-center p-4 max-w-full">
                        <div className="bg-red-600 rounded-full p-3 mx-auto mb-3 w-16 h-16 flex items-center justify-center shadow-lg">
                          <Play className="h-8 w-8 text-white fill-current" />
                        </div>
                        <h4 className="text-sm font-semibold leading-tight line-clamp-2 mb-2">
                          {truncateText(video.title, 60)}
                        </h4>
                        <p className="text-xs opacity-90">{video.channelTitle}</p>
                        <div className="mt-2 text-xs opacity-75 bg-black bg-opacity-30 rounded px-2 py-1 inline-block">
                          Click to Watch
                        </div>
                      </div>
                      
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                      
                      {/* Hidden image to attempt loading */}
                      <img 
                        data-video-id={video.id}
                        src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                        alt=""
                        className="hidden"
                        onLoad={() => handleImageLoad(video.id)}
                        onError={() => handleImageError(video.id)}
                      />
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs font-semibold">
                    #{index + 1}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">
                    {truncateText(video.title, 80)}
                  </h3>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <User className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="mr-3 truncate">{video.channelTitle}</span>
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span>{formatDate(video.publishedAt)}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {truncateText(video.description, 100)}
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
            ))}
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