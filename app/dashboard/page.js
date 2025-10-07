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
  TrendingUp, 
  Zap, 
  Brain, 
  Trophy,
  Clock,
  ArrowRight,
  Sparkles,
  Flame
} from 'lucide-react';

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
            weeklyProgress: data.weeklyProgress || Math.floor(Math.random() * 100),
            studyTime: data.studyTime || Math.floor(Math.random() * 120),
            rank: data.rank || (data.totalXP > 1000 ? 'Advanced' : data.totalXP > 500 ? 'Intermediate' : 'Beginner')
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Enhanced default values
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Simple Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your learning progress and achievements</p>
        </div>

        {/* Stats Grid - Enhanced with Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total XP Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Points</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Target className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">{stats.totalXP}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                Total points earned
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-orange-500/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <Flame className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500 mb-1">{stats.currentStreak}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarDays className="w-3 h-3 mr-1" />
                Days in a row
              </div>
            </CardContent>
          </Card>

          {/* Videos Watched Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-green-500/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos Watched</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Video className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500 mb-1">{stats.videosWatched}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                {stats.studyTime} mins study time
              </div>
            </CardContent>
          </Card>

          {/* Quizzes Completed Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-500/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[400ms]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <Award className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500 mb-1">{stats.quizzesCompleted}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Brain className="w-3 h-3 mr-1" />
                Practice sessions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Exam Prep - Takes 2 columns */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300 border-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Current Exam Preparation</CardTitle>
                    <CardDescription className="mt-1">
                      You're preparing for <span className="font-semibold text-primary">{preferences.exam}</span>
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="hidden sm:flex">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subjects */}
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Selected Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.subjects && preferences.subjects.length > 0 ? (
                    preferences.subjects.map((subject, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                      >
                        {subject}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No subjects selected yet</p>
                  )}
                </div>
              </div>

              {/* Weekly Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Weekly Progress
                  </h4>
                  <span className="text-sm text-muted-foreground">{stats.weeklyProgress}%</span>
                </div>
                <Progress value={stats.weeklyProgress} className="h-2" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/dashboard/exam-selection" className="flex-1 min-w-[200px]">
                  <Button variant="default" className="w-full group">
                    Change Exam
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href={`/subject?exam=${encodeURIComponent(preferences.exam)}`} className="flex-1 min-w-[200px]">
                  <Button variant="default" className="w-full group">
                    View Subjects
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Sidebar */}
          <Card className="hover:shadow-lg transition-all duration-300 border-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[600ms]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-sm font-medium">Study streak</span>
                  </div>
                  <Badge variant={stats.currentStreak > 0 ? "default" : "secondary"} className="font-bold">
                    {stats.currentStreak} days
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Total points</span>
                  </div>
                  <Badge variant="secondary" className="font-bold">{stats.totalXP} XP</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    </div>
                    <span className="text-sm font-medium">Current rank</span>
                  </div>
                  <Badge className="font-bold">{stats.rank}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium">Current exam</span>
                  </div>
                  <Badge variant="outline" className="font-bold">{preferences.exam}</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Link href={`/subject?exam=${encodeURIComponent(preferences.exam)}`}>
                  <Button variant="default" className="w-full group">
                    <Zap className="w-4 h-4 mr-2" />
                    Continue Learning
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/50 rounded-xl shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Quick Start Learning</CardTitle>
                  <CardDescription>Jump into your study session</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/subject?exam=${encodeURIComponent(preferences.exam)}`}>
                <Button variant="default" className="w-full justify-between group">
                  Browse Subjects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard/exam-selection">
                <Button variant="default" className="w-full justify-between group">
                  Select Different Exam
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-500/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[800ms]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-500/50 rounded-xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Today's Goal</CardTitle>
                  <CardDescription>Keep your streak alive!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Daily Target</span>
                  <span className="font-medium">{stats.videosWatched}/3 videos</span>
                </div>
                <Progress value={(stats.videosWatched / 3) * 100} className="h-2" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <p className="text-sm">
                  {stats.videosWatched >= 3 
                    ? "🎉 Goal achieved! Keep it up!" 
                    : `Watch ${3 - stats.videosWatched} more video${3 - stats.videosWatched > 1 ? 's' : ''} to complete your daily goal`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
