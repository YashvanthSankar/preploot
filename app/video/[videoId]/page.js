"use client";
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { VideoSidebar } from '@/components/video-sidebar';
import { ProgressTracker } from '@/components/progress-tracker';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, BookOpen, Play } from 'lucide-react';
import Link from 'next/link';

export default function VideoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = params.videoId;
  
  // Get video metadata from URL parameters
  const title = searchParams.get('title') || 'Loading...';
  const channelTitle = searchParams.get('channel') || '';
  const exam = searchParams.get('exam') || '';
  const subject = searchParams.get('subject') || '';
  const topic = searchParams.get('topic') || '';
  
  const [videoData, setVideoData] = useState({
    id: videoId,
    title: decodeURIComponent(title),
    channelTitle: decodeURIComponent(channelTitle),
    exam,
    subject,
    topic
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch additional video details if needed
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        // You can implement additional API call here to get more video details
        // For now, we'll use the data from URL parameters
        setVideoData(prev => ({
          ...prev,
          description: `${exam} ${subject} ${topic} - Educational content to help you master the concepts.`
        }));
      } catch (err) {
        setError('Failed to load video details');
        console.error('Error fetching video details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoDetails();
    }
  }, [videoId, exam, subject, topic]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoData.title,
          text: `Check out this ${exam} ${subject} video!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!videoId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Invalid Video</h1>
          <p className="text-muted-foreground mt-2">Video ID not found</p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="hidden md:block">
              <h1 className="font-semibold text-lg">PrepLoot Video Player</h1>
              {exam && subject && (
                <p className="text-sm text-muted-foreground">{exam} • {subject}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Link href={`https://youtube.com/watch?v=${videoId}`} target="_blank">
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                YouTube
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading video...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Video Player Section */}
            <div className="xl:col-span-2 space-y-4">
              <VideoPlayer videoId={videoId} title={videoData.title} />
              
              {/* Video Info */}
              <div className="space-y-3">
                <h1 className="text-2xl font-bold leading-tight">{videoData.title}</h1>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-muted-foreground">
                    by <span className="font-medium">{videoData.channelTitle}</span>
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {exam && <span className="px-2 py-1 bg-primary/10 rounded-full">{exam}</span>}
                    {subject && <span className="px-2 py-1 bg-secondary/50 rounded-full">{subject}</span>}
                    {topic && <span className="px-2 py-1 bg-accent/50 rounded-full">{topic}</span>}
                  </div>
                </div>
                {videoData.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {videoData.description}
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              <VideoSidebar 
                videoId={videoId} 
                videoTitle={videoData.title}
                exam={exam}
                subject={subject}
                topic={topic}
              />
              
              {/* Progress Tracker */}
              <ProgressTracker 
                exam={exam}
                subject={subject}
                topic={topic}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}