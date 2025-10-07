"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  PlayCircle, 
  Award,
  TrendingUp,
  Calendar,
  Flame,
  Star,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export function ProgressTracker({ exam, subject, topic }) {
  const { data: session } = useSession();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProgressData();
    }
  }, [session, exam, subject, topic]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (exam) params.set('exam', exam);
      if (subject) params.set('subject', subject);
      if (topic) params.set('topic', topic);

      const response = await fetch(`/api/progress?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setProgressData(data.data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Please sign in to track your progress</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading progress...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Your Progress</span>
            {exam && subject && (
              <Badge variant="outline">{exam} - {subject}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {progressData?.user?.xp || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-2xl font-bold text-orange-500">
                <Flame className="h-5 w-5 mr-1" />
                {progressData?.user?.streak || 0}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {progressData?.stats?.videosWatched || 0}
              </div>
              <div className="text-sm text-muted-foreground">Videos Watched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {progressData?.stats?.quizzesTaken || 0}
              </div>
              <div className="text-sm text-muted-foreground">Quizzes Taken</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goals */}
      {progressData?.dailyGoal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Today's Goals</span>
              <Badge variant={progressData.dailyGoal.completed ? "default" : "secondary"}>
                {progressData.dailyGoal.completed ? "Completed" : "In Progress"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Videos ({progressData.dailyGoal.videosWatched}/{progressData.dailyGoal.videosTarget})</span>
                <span>{Math.round((progressData.dailyGoal.videosWatched / progressData.dailyGoal.videosTarget) * 100)}%</span>
              </div>
              <Progress 
                value={(progressData.dailyGoal.videosWatched / progressData.dailyGoal.videosTarget) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quizzes ({progressData.dailyGoal.quizzesTaken}/{progressData.dailyGoal.quizzesTarget})</span>
                <span>{Math.round((progressData.dailyGoal.quizzesTaken / progressData.dailyGoal.quizzesTarget) * 100)}%</span>
              </div>
              <Progress 
                value={(progressData.dailyGoal.quizzesTaken / progressData.dailyGoal.quizzesTarget) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Study Time ({progressData.dailyGoal.studyTimeActual}/{progressData.dailyGoal.studyTimeTarget} min)</span>
                <span>{Math.round((progressData.dailyGoal.studyTimeActual / progressData.dailyGoal.studyTimeTarget) * 100)}%</span>
              </div>
              <Progress 
                value={(progressData.dailyGoal.studyTimeActual / progressData.dailyGoal.studyTimeTarget) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject/Topic Progress */}
      {progressData?.subjectProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Subject Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Topics Completed</span>
                  <span>{progressData.subjectProgress.topicsCompleted}/{progressData.subjectProgress.totalTopics}</span>
                </div>
                <Progress 
                  value={(progressData.subjectProgress.topicsCompleted / progressData.subjectProgress.totalTopics) * 100} 
                  className="h-3"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{progressData.subjectProgress.averageScore.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Avg Score</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{Math.floor(progressData.subjectProgress.timeSpent / 60)}h</div>
                  <div className="text-xs text-muted-foreground">Time Spent</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">L{progressData.subjectProgress.level}</div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {progressData?.recentAchievements?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressData.recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">+{achievement.xpReward} XP</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/analytics'}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/achievements'}>
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/goals'}>
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => window.location.href = '/history'}>
              <Clock className="h-4 w-4 mr-2" />
              Study History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}