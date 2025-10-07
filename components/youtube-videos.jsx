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
        console.log('🎬 Loaded videos with thumbnails:', data.videos?.map(v => ({
          title: v.title.substring(0, 50) + '...',
          id: v.id,
          thumbnail: v.thumbnail
        })));
        
        // Test thumbnail accessibility
        if (data.videos?.length > 0) {
          const testVideo = data.videos[0];
          console.log('🧪 Testing first thumbnail accessibility...');
          console.log('📝 Test Video ID:', testVideo.id);
          console.log('📝 Test Video ID type:', typeof testVideo.id);
          console.log('📝 Test Video ID length:', testVideo.id?.length);
          console.log('📝 Test URL:', `https://img.youtube.com/vi/${testVideo.id}/mqdefault.jpg`);
          
          // Validate video ID format (YouTube video IDs are typically 11 characters)
          if (!testVideo.id || testVideo.id.length !== 11) {
            console.warn('⚠️ Suspicious video ID format:', testVideo.id);
          }
          
          // Create a test image to check CORS/accessibility
          const testImg = new Image();
          testImg.crossOrigin = 'anonymous';
          testImg.onload = () => {
            console.log('✅ Test thumbnail loaded successfully!');
            console.log('📏 Dimensions:', testImg.naturalWidth, 'x', testImg.naturalHeight);
          };
          testImg.onerror = (e) => {
            console.log('❌ Test thumbnail failed:', e);
            console.log('🔍 This indicates a CORS or accessibility issue');
            console.log('🔗 Failed URL:', testImg.src);
          };
          testImg.src = `https://img.youtube.com/vi/${testVideo.id}/mqdefault.jpg`;
        }
      }
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (videoId) => {
    setImageLoadStates(prev => ({ ...prev, [videoId]: 'loaded' }));
  };

  const handleImageError = (videoId) => {
    setImageLoadStates(prev => ({ ...prev, [videoId]: 'error' }));
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
    // Navigate to internal video page with all necessary parameters
    const params = new URLSearchParams({
      title: encodeURIComponent(video.title),
      channel: encodeURIComponent(video.channelTitle),
      exam: exam || '',
      subject: subject || '',
      topic: '' // You can add topic parameter if available
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
          <>
            {/* Debug Panel (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">🔧 Debug Info:</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <p>• Found {videos.length} videos</p>
                  <p>• Data source: {dataSource}</p>
                  <p>• Test first thumbnail: 
                    <a 
                      href={`https://img.youtube.com/vi/${videos[0]?.id}/mqdefault.jpg`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline ml-1"
                    >
                      Open in new tab
                    </a>
                  </p>
                  <p>• Image load states: {Object.keys(imageLoadStates).length} tracked</p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="relative">
                    {/* Thumbnail with enhanced debugging */}
                    {imageLoadStates[video.id] === 'error' ? (
                      // Enhanced fallback UI
                      <div className="w-full h-48 bg-gradient-to-br from-red-500 to-red-600 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        <div className="text-white text-center p-4 relative z-10">
                          <Play className="h-16 w-16 mx-auto mb-3 opacity-90" />
                          <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                          <p className="text-xs opacity-80 mt-2">Click to Watch on YouTube</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Loading placeholder */}
                        {imageLoadStates[video.id] !== 'loaded' && (
                          <div className="absolute inset-0 w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center z-10">
                            <div className="text-center">
                              <div className="animate-pulse">
                                <Play className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                              </div>
                              <p className="text-gray-600 text-sm">Loading thumbnail...</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Actual image with comprehensive cross-origin fixes */}
                        <img 
                          src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                          alt={video.title}
                          className={`w-full h-48 object-cover rounded-t-lg transition-opacity duration-500 ${
                            imageLoadStates[video.id] === 'loaded' ? 'opacity-100' : 'opacity-0'
                          }`}
                          loading="eager"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer-when-downgrade"
                          style={{ 
                            backgroundColor: '#1a1a1a',
                            minHeight: '192px'
                          }}
                          onLoad={(e) => {
                            console.log('✅ SUCCESS: Thumbnail loaded for:', video.title);
                            console.log('🆔 Video ID used:', video.id);
                            console.log('📊 Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                            console.log('🔗 Working URL:', e.target.src);
                            handleImageLoad(video.id);
                          }}
                          onError={(e) => {
                            console.log('❌ FAILED: Thumbnail error for:', video.title);
                            console.log('🆔 Video ID used:', video.id);
                            console.log('🚫 Failed URL:', e.target.src);
                            console.log('🔍 Error details:', e.target.error);
                            
                            // Validate video ID before trying fallbacks
                            if (!video.id || video.id.length !== 11) {
                              console.error('🚨 INVALID VIDEO ID FORMAT:', video.id);
                              handleImageError(video.id);
                              return;
                            }
                            
                            const videoId = video.id;
                            const currentSrc = e.target.src;
                            
                            // Comprehensive fallback strategy
                            if (currentSrc.includes('mqdefault.jpg')) {
                              console.log('🔄 Trying hqdefault.jpg...');
                              e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            } else if (currentSrc.includes('hqdefault.jpg')) {
                              console.log('🔄 Trying sddefault.jpg...');
                              e.target.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
                            } else if (currentSrc.includes('sddefault.jpg')) {
                              console.log('🔄 Trying maxresdefault.jpg...');
                              e.target.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                            } else if (currentSrc.includes('maxresdefault.jpg')) {
                              console.log('🔄 Trying default.jpg...');
                              e.target.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
                            } else if (currentSrc.includes('default.jpg')) {
                              console.log('🔄 Trying alternative CDN (i.ytimg.com)...');
                              e.target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                            } else if (currentSrc.includes('i.ytimg.com')) {
                              console.log('🔄 Trying YouTube web URL...');
                              e.target.src = `https://img.youtube.com/vi_webp/${videoId}/mqdefault.webp`;
                            } else {
                              console.log('💥 ALL ATTEMPTS FAILED - Using fallback UI');
                              handleImageError(video.id);
                            }
                          }}
                        />
                      </>
                    )}
                    
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      #{index + 1}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center rounded-t-lg">
                      <Play className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {truncateText(video.title, 80)}
                    </h3>
                    
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <User className="h-3 w-3 mr-1" />
                      <span className="mr-3">{video.channelTitle}</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(video.publishedAt)}</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {truncateText(video.description, 100)}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleWatchVideo(video)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Watch
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(video.url, '_blank')}
                        title="Open on YouTube"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
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