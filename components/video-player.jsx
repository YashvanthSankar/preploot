"use client";
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { toast } from 'sonner';

export function VideoPlayer({ videoId, title, exam, subject, topic }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressSaved, setProgressSaved] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState(null);
  const iframeRef = useRef(null);
  const progressSaveInterval = useRef(null);

  useEffect(() => {
    // Set loading to false after a brief delay to allow iframe to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Start tracking watch time when component mounts
    if (session?.user?.id && videoId) {
      setWatchStartTime(Date.now());
      
      // Save progress every 30 seconds
      progressSaveInterval.current = setInterval(() => {
        saveVideoProgress(false);
      }, 30000);
    }

    return () => {
      clearTimeout(timer);
      if (progressSaveInterval.current) {
        clearInterval(progressSaveInterval.current);
      }
      // Save final progress when component unmounts
      if (watchStartTime) {
        saveVideoProgress(false);
      }
    };
  }, [videoId, session]);

  const saveVideoProgress = async (completed = false) => {
    if (!session?.user?.id || !videoId || !watchStartTime) return;

    const watchDuration = Math.floor((Date.now() - watchStartTime) / 1000); // in seconds
    
    try {
      // Save progress first
      const progressResponse = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'video_progress',
          data: {
            videoId,
            videoTitle: title,
            exam,
            subject,
            topic,
            watchDuration,
            totalDuration: 0, // YouTube doesn't provide this easily
            completed
          }
        })
      });

      if (progressResponse.ok) {
        setProgressSaved(true);
        setTimeout(() => setProgressSaved(false), 2000);
        
        // Award XP for video completion using the new XP system
        if (completed) {
          const xpResponse = await fetch('/api/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'video_completion',
              data: {
                videoId,
                videoTitle: title,
                exam,
                subject,
                topic
              }
            })
          });
          
          if (xpResponse.ok) {
            const xpData = await xpResponse.json();
            
            // Update navbar XP
            if (typeof window !== 'undefined' && window.updateNavbarXP) {
              window.updateNavbarXP(xpData.totalXP, xpData.currentStreak);
            }
            
            // Show XP notification
            toast.success(`📺 Video completed! +${xpData.xpAwarded} XP earned!`, {
              description: `Watched: ${title}`,
              duration: 3000,
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to save video progress:', error);
    }
  };

  const handleVideoComplete = () => {
    saveVideoProgress(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setError('Failed to load video. Please try again.');
    setIsLoading(false);
  };

  if (!videoId) {
    return (
      <Card className="aspect-video flex items-center justify-center bg-muted">
        <div className="text-center">
          <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No video selected</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Play className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Video Unavailable</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
                variant="outline"
              >
                Watch on YouTube
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* YouTube Embed */}
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&showinfo=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              title={title || 'YouTube Video'}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />

            {/* Custom Overlay Controls (Optional) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium truncate max-w-xs">
                    {title || 'YouTube Video'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Video Actions */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
            >
              <Play className="h-4 w-4 mr-2" />
              Open in YouTube
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleVideoComplete}
              disabled={!session?.user?.id}
            >
              Mark Complete
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            {progressSaved && (
              <span className="text-green-600 font-medium">Progress Saved!</span>
            )}
            <span>Video ID: {videoId}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}