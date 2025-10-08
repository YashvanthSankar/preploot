'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  CalendarDays, 
  Video, 
  Award, 
  Zap, 
  Brain, 
  Trophy,
  Clock,
  ArrowRight,
  Sparkles,
  Flame,
  Crown,
  Gamepad2,
  Map,
  Sword
} from 'lucide-react';
import { DailyCheckin } from '@/components/daily-checkin';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalXP: 0,
    currentStreak: 0,
    videosWatched: 0,
    quizzesCompleted: 0,
    weeklyProgress: 0,
    studyTime: 0,
    rank: 'Beginner'
  });
  const [preferences, setPreferences] = useState({
    exam: 'Select an exam',
    subjects: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      redirect('/');
      return;
    }

    // Fetch user stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalXP: data.totalXP || 0,
            currentStreak: data.currentStreak || 0,
            videosWatched: data.videosWatched || 0,
            quizzesCompleted: data.quizzesCompleted || 0,
            weeklyProgress: data.weeklyProgress || 0,
            studyTime: data.studyTime || 0,
            rank: data.rank || (data.totalXP > 1000 ? 'Advanced' : data.totalXP > 500 ? 'Intermediate' : 'Beginner')
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Default values
        setStats({
          totalXP: 0,
          currentStreak: 0,
          videosWatched: 0,
          quizzesCompleted: 0,
          weeklyProgress: 0,
          studyTime: 0,
          rank: 'Beginner'
        });
      }
    };

    // Fetch user preferences
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setPreferences({
            exam: data.exam || 'Select an exam',
            subjects: data.subjects || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
        // Set default values on error
        setPreferences({
          exam: 'Select an exam',
          subjects: []
        });
      }
    };

    fetchStats();
    fetchPreferences();
  }, [session, status]);

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Calculate level based on XP
  const level = Math.floor(stats.totalXP / 100) + 1;
  const xpForNextLevel = level * 100;
  const xpProgress = ((stats.totalXP % 100) / 100) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Gamified Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-full shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Command Center
            </h1>
          </div>
          <p className="text-muted-foreground">Your learning kingdom awaits, {session?.user?.name || 'Champion'}!</p>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 dark:from-card dark:to-card/80">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stats.totalXP}</div>
              <div className="text-xs text-muted-foreground">XP Points</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all border-2 hover:border-orange-500/50 bg-gradient-to-br from-card to-orange-50/20 dark:from-card dark:to-orange-900/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-500 mb-1">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all border-2 hover:border-green-500/50 bg-gradient-to-br from-card to-green-50/20 dark:from-card dark:to-green-900/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Video className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-500 mb-1">{stats.videosWatched}</div>
              <div className="text-xs text-muted-foreground">Videos</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all border-2 hover:border-purple-500/50 bg-gradient-to-br from-card to-purple-50/20 dark:from-card dark:to-purple-900/10">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Award className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-500 mb-1">{stats.quizzesCompleted}</div>
              <div className="text-xs text-muted-foreground">Quizzes</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Check-in */}
        <div className="flex justify-center mb-6">
          <DailyCheckin />
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Game Map Card */}
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all border-2 hover:border-purple-500/50 bg-gradient-to-br from-card via-purple-50/30 to-pink-50/30 dark:from-card dark:via-purple-900/20 dark:to-pink-900/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Learning Map
                  </CardTitle>
                  <CardDescription>Navigate your learning journey</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/map">
                <Button variant="default" className="w-full group">
                  <Map className="w-4 h-4 mr-2" />
                  Enter Learning Map
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Games Portal */}
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all border-2 hover:border-blue-500/50 bg-gradient-to-br from-card via-blue-50/30 to-cyan-50/30 dark:from-card dark:via-blue-900/20 dark:to-cyan-900/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Learning Games
                  </CardTitle>
                  <CardDescription>Fun ways to learn and practice</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/games">
                <Button variant="default" className="w-full group">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Play Games
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Exam Selection */}
          <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all border-2 hover:border-primary/50 bg-gradient-to-br from-card via-primary/5 to-primary/10 dark:from-card dark:via-primary/10 dark:to-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Current Quest</CardTitle>
                  <CardDescription>
                    {preferences.exam !== 'Select an exam' ? preferences.exam : 'Choose your adventure'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {preferences.subjects && preferences.subjects.length > 0 ? (
                  preferences.subjects.slice(0, 3).map((subject, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">No subjects selected</Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <Link href="/dashboard/exam-selection">
                  <Button variant="default" className="w-full group">
                    <Target className="w-4 h-4 mr-2" />
                    {preferences.exam !== 'Select an exam' ? 'Change Quest' : 'Start Quest'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                {preferences.exam !== 'Select an exam' && (
                  <Link href={`/subject?exam=${encodeURIComponent(preferences.exam)}`}>
                    <Button variant="outline" className="w-full group">
                      <Zap className="w-4 h-4 mr-2" />
                      Continue Learning
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <Card className="bg-gradient-to-r from-card via-primary/5 to-purple-500/5 dark:from-card dark:via-primary/10 dark:to-purple-900/20 border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Your Progress Kingdom</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Rank: {stats.rank}
                  </span>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    Level {level}
                  </Badge>
                </div>
                <Progress value={xpProgress} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {stats.totalXP % 100} / {100} XP to next level
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/5 dark:from-orange-500/20 dark:to-red-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Streak Power
                  </span>
                  <Badge variant={stats.currentStreak > 0 ? "default" : "secondary"}>
                    {stats.currentStreak} days
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i < stats.currentStreak 
                          ? 'bg-orange-500' 
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.currentStreak > 0 
                    ? `${7 - stats.currentStreak} more days for weekly streak!` 
                    : 'Start your learning streak today!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
