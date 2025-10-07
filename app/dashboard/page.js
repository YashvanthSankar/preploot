'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, CalendarDays, Video, Award } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    totalXP: 0,
    currentStreak: 0,
    videosWatched: 0,
    quizzesCompleted: 0
  });
  const [preferences, setPreferences] = useState({
    exam: 'Select an exam',
    subjects: []
  });

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
            quizzesCompleted: data.quizzesCompleted || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep default values on error
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

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="gamified-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Points</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalXP}</div>
            <p className="text-xs text-muted-foreground">Total points earned</p>
          </CardContent>
        </Card>

        <Card className="gamified-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <CalendarDays className="h-4 w-4 text-streak" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-streak streak-effect">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        <Card className="gamified-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos Watched</CardTitle>
            <Video className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.videosWatched}</div>
            <p className="text-xs text-muted-foreground">Educational content</p>
          </CardContent>
        </Card>

        <Card className="gamified-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completed</CardTitle>
            <Award className="h-4 w-4 text-level" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-level">{stats.quizzesCompleted}</div>
            <p className="text-xs text-muted-foreground">Practice sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Exam Prep */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Current Exam Preparation
          </CardTitle>
          <CardDescription>
            You're currently preparing for {preferences.exam}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.subjects && preferences.subjects.length > 0 ? (
              preferences.subjects.map((subject, index) => (
                <Badge key={index} variant="secondary">
                  {subject}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No subjects selected yet</p>
            )}
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/exam-selection">
              <Button className="gamified-button">Change Exam</Button>
            </Link>
            <Link href={`/subject?exam=${preferences.exam}`}>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">View Subjects</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Learning</CardTitle>
            <CardDescription>Jump into your study session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={`/subject?exam=${preferences.exam}`}>
              <Button className="w-full gamified-button">Browse Subjects</Button>
            </Link>
            <Link href="/dashboard/exam-selection">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                Select Different Exam
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your learning progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Study streak</span>
                <Badge variant={stats.currentStreak > 0 ? "default" : "secondary"}>
                  {stats.currentStreak} days
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total points</span>
                <Badge variant="secondary">{stats.totalXP} XP</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Current exam</span>
                <Badge>{preferences.exam}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
