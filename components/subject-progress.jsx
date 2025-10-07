'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Target,
  TrendingUp,
  PlayCircle,
  Brain
} from 'lucide-react';

export function SubjectProgress({ exam, subject }) {
  const { data: session } = useSession();
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id && exam && subject) {
      fetchSubjectProgress();
    }
  }, [session, exam, subject]);

  const fetchSubjectProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/progress?exam=${exam}&subject=${subject}`);
      const result = await response.json();
      
      if (result.success) {
        setSubjectData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch subject progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Subject Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subjectData?.subjectProgress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>{subject} Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Start learning to see your progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { subjectProgress, stats } = subjectData;
  const completionPercentage = Math.round((subjectProgress.topicsCompleted / subjectProgress.totalTopics) * 100);
  const videoProgress = Math.round((subjectProgress.videosWatched / subjectProgress.totalVideos) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>{subject}</span>
          </div>
          <Badge variant="secondary">{exam}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Completion</span>
            <span className="text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{subjectProgress.topicsCompleted} of {subjectProgress.totalTopics} topics</span>
            <span>{subjectProgress.videosWatched} videos watched</span>
          </div>
        </div>

        {/* Video Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-4 w-4" />
              <span>Video Progress</span>
            </div>
            <span className="text-muted-foreground">{videoProgress}%</span>
          </div>
          <Progress value={videoProgress} className="h-2" />
        </div>

        {/* Quiz Performance */}
        {subjectProgress.quizzesTaken > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>Quiz Average</span>
              </div>
              <span className="text-muted-foreground">{Math.round(subjectProgress.averageScore)}%</span>
            </div>
            <Progress value={subjectProgress.averageScore} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {subjectProgress.quizzesTaken} quizzes completed
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-semibold">{Math.round((subjectProgress.studyTime || 0) / 60)}</div>
            <div className="text-xs text-muted-foreground">Hours Studied</div>
          </div>
          
          <div className="text-center p-3 bg-green-500/5 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-lg font-semibold">{subjectProgress.topicsCompleted}</div>
            <div className="text-xs text-muted-foreground">Topics Done</div>
          </div>
        </div>

        {/* Performance Insights */}
        {subjectProgress.quizzesTaken > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Performance Insight</span>
            </div>
            <p className="text-xs text-blue-700">
              {subjectProgress.averageScore >= 80 
                ? "Excellent performance! Keep up the great work." 
                : subjectProgress.averageScore >= 60
                ? "Good progress. Try to focus on weak areas."
                : "Consider revisiting the fundamentals and practicing more."}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Set Goal
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Trophy className="h-4 w-4 mr-2" />
            View Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}