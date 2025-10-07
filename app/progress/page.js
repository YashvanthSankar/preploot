'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { GamingNavigation } from '@/components/gaming-navigation';
import { GamingButton } from '@/components/gaming-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressTracker } from '@/components/progress-tracker';
import { SubjectProgress } from '@/components/subject-progress';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp,
  Clock,
  PlayCircle,
  Brain,
  Award,
  Flame
} from 'lucide-react';

export default function ProgressDashboard() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(searchParams.get('exam') || 'NEET');

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session, selectedExam]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/progress?exam=${selectedExam}`);
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { user, dailyGoal, stats, recentAchievements } = dashboardData || {};

  return (
    <div>
      <GamingNavigation />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Progress Dashboard</h1>
            <p className="text-muted-foreground">Track your learning journey</p>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedExam} 
              onChange={(e) => setSelectedExam(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="NEET">NEET</option>
              <option value="JEE">JEE</option>
              <option value="CBSE">CBSE</option>
            </select>
          </div>
        </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user?.xp || 0}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user?.streak || 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlayCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.videosWatched || 0}</p>
                <p className="text-sm text-muted-foreground">Videos Watched</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.quizzesTaken || 0}</p>
                <p className="text-sm text-muted-foreground">Quizzes Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goals */}
      {dailyGoal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Today&apos;s Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Videos</span>
                  <span>{dailyGoal.videosWatched || 0}/{dailyGoal.videosTarget}</span>
                </div>
                <Progress 
                  value={Math.min(((dailyGoal.videosWatched || 0) / dailyGoal.videosTarget) * 100, 100)} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quizzes</span>
                  <span>{dailyGoal.quizzesTaken || 0}/{dailyGoal.quizzesTarget}</span>
                </div>
                <Progress 
                  value={Math.min(((dailyGoal.quizzesTaken || 0) / dailyGoal.quizzesTarget) * 100, 100)} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Study Time</span>
                  <span>{Math.round((dailyGoal.studyTimeActual || 0) / 60)}/{Math.round(dailyGoal.studyTimeTarget / 60)}h</span>
                </div>
                <Progress 
                  value={Math.min(((dailyGoal.studyTimeActual || 0) / dailyGoal.studyTimeTarget) * 100, 100)} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XP</span>
                  <span>{dailyGoal.xpEarned || 0}/{dailyGoal.xpTarget}</span>
                </div>
                <Progress 
                  value={Math.min(((dailyGoal.xpEarned || 0) / dailyGoal.xpTarget) * 100, 100)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressTracker exam={selectedExam} />
            <SubjectProgress exam={selectedExam} subject="Physics" />
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SubjectProgress exam={selectedExam} subject="Physics" />
            <SubjectProgress exam={selectedExam} subject="Chemistry" />
            <SubjectProgress exam={selectedExam} subject="Biology" />
            {selectedExam === 'JEE' && (
              <SubjectProgress exam={selectedExam} subject="Mathematics" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Recent Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentAchievements && recentAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {recentAchievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Complete activities to unlock achievements</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievement Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>First Video</span>
                      <Badge variant={stats?.videosWatched > 0 ? "default" : "secondary"}>
                        {stats?.videosWatched > 0 ? "Unlocked" : "Locked"}
                      </Badge>
                    </div>
                    <Progress value={stats?.videosWatched > 0 ? 100 : 0} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quiz Master (10 quizzes)</span>
                      <Badge variant={stats?.quizzesTaken >= 10 ? "default" : "secondary"}>
                        {stats?.quizzesTaken >= 10 ? "Unlocked" : `${stats?.quizzesTaken || 0}/10`}
                      </Badge>
                    </div>
                    <Progress value={Math.min(((stats?.quizzesTaken || 0) / 10) * 100, 100)} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Video Enthusiast (50 videos)</span>
                      <Badge variant={stats?.videosWatched >= 50 ? "default" : "secondary"}>
                        {stats?.videosWatched >= 50 ? "Unlocked" : `${stats?.videosWatched || 0}/50`}
                      </Badge>
                    </div>
                    <Progress value={Math.min(((stats?.videosWatched || 0) / 50) * 100, 100)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Learning Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and insights will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}