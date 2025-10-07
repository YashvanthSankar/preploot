"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { YouTubeVideos } from "@/components/youtube-videos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Target, Trophy } from "lucide-react";

export default function SubjectLearning() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [examData, setExamData] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);

  useEffect(() => {
    // Get exam and subject from URL parameters
    const exam = searchParams.get('exam');
    const subject = searchParams.get('subject');
    
    if (!exam || !subject) {
      router.push('/dashboard');
      return;
    }

    setCurrentSubject(subject);

    // Load selected exam from localStorage
    const storedExam = localStorage.getItem('selectedExam');
    if (storedExam) {
      const parsedExam = JSON.parse(storedExam);
      if (parsedExam.name === exam) {
        setExamData(parsedExam);
      } else {
        // If exam doesn't match, redirect to dashboard
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  if (!examData || !currentSubject) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading subject...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation and Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{currentSubject}</h1>
            <p className="text-lg text-muted-foreground">
              {examData.name} - {examData.fullName}
            </p>
            <p className="text-sm text-muted-foreground">
              {examData.description}
            </p>
          </div>
        </div>

        {/* Subject Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Subject completion</p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos Watched</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Out of 10 videos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Score</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">XP earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Button size="lg">
            Start Practice Test
          </Button>
          <Button size="lg" variant="outline">
            Download Notes
          </Button>
          <Button size="lg" variant="outline">
            Previous Year Questions
          </Button>
        </div>

        {/* YouTube Videos Section */}
        <YouTubeVideos 
          exam={examData.name}
          subject={currentSubject}
          isVisible={true}
        />
      </div>
      <Footer />
    </div>
  );
}