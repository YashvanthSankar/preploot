"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ExternalLink, Calendar, User } from 'lucide-react';

export function YouTubeVideos({ exam, subject, isVisible }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null);

  useEffect(() => {
    if (isVisible && exam && subject) {
      fetchVideos();
    }
  }, [exam, subject, isVisible]);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/youtube?exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(subject)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setVideos(data.videos || []);
        setDataSource(data.source);
      }
    } catch (err) {
      setError('Failed to load videos');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
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
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    loading="lazy"
                    onError={(e) => {
                      // Try different thumbnail sizes if the first one fails
                      if (e.target.src.includes('mqdefault')) {
                        e.target.src = video.thumbnail.replace('mqdefault', 'hqdefault');
                      } else if (e.target.src.includes('hqdefault')) {
                        e.target.src = video.thumbnail.replace('hqdefault', 'maxresdefault');
                      } else {
                        // Final fallback to a styled placeholder
                        e.target.src = `https://via.placeholder.com/480x360/6366f1/ffffff?text=${encodeURIComponent(video.title.substring(0, 20))}`;
                      }
                    }}
                  />
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
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Watch
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(video.url, '_blank')}
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