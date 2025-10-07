'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Target, TrendingUp, Award, BookOpen, Video, Clock, Zap, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalXP: 0,
    currentStreak: 0,
    videosWatched: 0,
    quizzesCompleted: 0,
    studyTime: 0,
    level: 1,
    xpToNextLevel: 100
  });
  const [preferences, setPreferences] = useState({
    exam: 'JEE',
    subjects: []
  });
  const [loading, setLoading] = useState(true);

  // Load user stats and preferences
  const loadUserStats = async () => {
    try {
      const [xpResponse, preferencesResponse] = await Promise.all([
        fetch('/api/xp'),
        fetch('/api/user/preferences')
      ]);

      if (xpResponse.ok) {
        const xpData = await xpResponse.json();
        setStats(prev => ({
          ...prev,
          totalXP: xpData.xp || 0,
          currentStreak: xpData.streak || 0,
          level: xpData.level || 1,
          xpToNextLevel: xpData.xpToNextLevel || 100
        }));
      }

      if (preferencesResponse.ok) {
        const prefData = await preferencesResponse.json();
        setPreferences(prefData);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadUserStats();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-center text-gray-600">Please sign in to access your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = ((stats.totalXP % 100) / 100) * 100;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome back, {session.user.name?.split(' ')[0]}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Continue your learning journey and unlock new achievements
        </p>
      </div>

      {/* Gamified Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Level Badge - Prominent */}
        <Card className="relative overflow-hidden border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"></div>
          <CardContent className="relative p-6 text-center">
            <div className="mb-3">
              <Trophy className="h-10 w-10 mx-auto text-primary" />
            </div>
            <div className="level-text text-4xl font-black mb-2 text-primary">
              {stats.level}
            </div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">
              Level
            </p>
            <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border-primary/20">
              Learning Champion
            </Badge>
          </CardContent>
        </Card>

        {/* XP Counter - Electric */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="xp-text text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {stats.totalXP.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
              Experience Points
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Next Level</span>
                <span className="font-medium">{stats.xpToNextLevel} XP</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Counter - Fire */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Target className="h-6 w-6 text-orange-500" />
              </div>
              {stats.currentStreak > 3 && (
                <span className="text-2xl">🔥</span>
              )}
            </div>
            <div className="streak-text text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {stats.currentStreak}
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
              Day Streak
            </p>
            {stats.currentStreak > 0 && (
              <div className="mt-3">
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30"
                >
                  {stats.currentStreak >= 7 ? '🚀 Unstoppable!' : 
                   stats.currentStreak >= 3 ? '🔥 On Fire!' : 
                   '💪 Getting Started!'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Videos Watched */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"></div>
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Video className="h-6 w-6 text-green-500" />
              </div>
              <Award className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {stats.videosWatched}
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
              Videos Completed
            </p>
            {stats.videosWatched > 0 && (
              <div className="mt-3">
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30">
                  📚 Learner
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Start Learning
            </CardTitle>
            <CardDescription>
              Jump into your {preferences.exam} preparation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/exam-selection">
              <Button className="w-full bg-primary hover:bg-primary/90">
                Choose Subject
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Track Progress
            </CardTitle>
            <CardDescription>
              View your learning analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/progress">
              <Button variant="outline" className="w-full">
                View Progress
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              See how you rank among peers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/leaderboard">
              <Button variant="outline" className="w-full">
                View Rankings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Showcase */}
      {stats.level > 1 && (
        <Card className="border-2 border-yellow-500/20 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Trophy className="h-6 w-6" />
              Recent Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏆</div>
              <div>
                <h3 className="font-bold text-lg">Level {stats.level} Reached!</h3>
                <p className="text-muted-foreground">
                  You&apos;ve earned {stats.totalXP} XP and unlocked new learning challenges!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}