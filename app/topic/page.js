"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Footer } from "@/components/footer";
import { YouTubeVideos } from "@/components/youtube-videos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Target, Trophy, CheckCircle } from "lucide-react";

function TopicLearningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [examData, setExamData] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [isTopicCompleted, setIsTopicCompleted] = useState(false);

  useEffect(() => {
    // Get exam, subject, and topic from URL parameters
    const exam = searchParams.get('exam');
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    
    if (!exam || !subject || !topic) {
      router.push('/dashboard');
      return;
    }

    setCurrentSubject(subject);
    setCurrentTopic(topic);

    // Load selected exam from localStorage
    const storedExam = localStorage.getItem('selectedExam');
    if (storedExam) {
      const parsedExam = JSON.parse(storedExam);
      if (parsedExam.name === exam && parsedExam.subjects[subject]) {
        setExamData(parsedExam);
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  const markTopicComplete = () => {
    setIsTopicCompleted(true);
    // Here you could save progress to localStorage or database
  };

  const getNextTopic = () => {
    if (examData && currentSubject && currentTopic) {
      const topics = examData.subjects[currentSubject];
      const currentIndex = topics.indexOf(currentTopic);
      return currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null;
    }
    return null;
  };

  const getPreviousTopic = () => {
    if (examData && currentSubject && currentTopic) {
      const topics = examData.subjects[currentSubject];
      const currentIndex = topics.indexOf(currentTopic);
      return currentIndex > 0 ? topics[currentIndex - 1] : null;
    }
    return null;
  };

  if (!examData || !currentSubject || !currentTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Preparing your learning adventure...</p>
                <p className="text-sm text-muted-foreground">Loading topic resources</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const nextTopic = getNextTopic();
  const previousTopic = getPreviousTopic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Navigation and Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/subject?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}`)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {currentSubject}
            </Button>
            
            {isTopicCompleted && (
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Topic Mastered!</span>
              </div>
            )}
          </div>
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-full shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                {currentTopic}
              </h1>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                {examData.name}
              </span>
              <span>→</span>
              <span className="px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                {currentSubject}
              </span>
            </div>
            
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Master this topic with curated videos and interactive learning resources
            </p>
          </div>
        </div>

        {/* Gamified Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all border-2 hover:border-primary/50 bg-gradient-to-br from-card to-primary/5 dark:from-card dark:to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={isTopicCompleted ? "default" : "secondary"} className="font-bold">
                  {isTopicCompleted ? 'Mastered' : 'Learning'}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {isTopicCompleted ? '100%' : '0%'}
              </div>
              <p className="text-sm text-muted-foreground mb-3">Progress</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: isTopicCompleted ? "100%" : "0%" }}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all border-2 hover:border-blue-500/50 bg-gradient-to-br from-card to-blue-50/20 dark:from-card dark:to-blue-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <Badge variant="outline" className="font-bold">Active</Badge>
              </div>
              <div className="text-3xl font-bold text-blue-500 mb-2">∞</div>
              <p className="text-sm text-muted-foreground mb-3">Videos Available</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Unlimited learning resources
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all border-2 hover:border-yellow-500/50 bg-gradient-to-br from-card to-yellow-50/20 dark:from-card dark:to-yellow-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <Badge variant="secondary" className="font-bold">+{isTopicCompleted ? '100' : '0'} XP</Badge>
              </div>
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {isTopicCompleted ? '100' : '0'}
              </div>
              <p className="text-sm text-muted-foreground mb-3">XP Earned</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      isTopicCompleted && i < 5 
                        ? 'bg-yellow-500' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Action Button */}
        <div className="flex justify-center mb-8">
          {!isTopicCompleted && (
            <Button 
              size="lg" 
              variant="default"
              onClick={markTopicComplete}
              className="px-8 py-3"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Complete Topic
            </Button>
          )}
        </div>

        {/* YouTube Videos Section for this specific topic */}
        <YouTubeVideos 
          exam={examData.name}
          subject={`${currentSubject} ${currentTopic}`}
          isVisible={true}
        />

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center mt-8 gap-4">
          <div className="flex-1">
            {previousTopic && (
              <Button 
                variant="outline"
                onClick={() => {
                  router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(previousTopic)}`);
                }}
                className="group hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground group-hover:text-primary-foreground/80">Previous</div>
                  <div className="font-medium">{previousTopic}</div>
                </div>
              </Button>
            )}
          </div>
          
          <div className="flex-1 text-right">
            {nextTopic && (
              <Button 
                variant="default"
                onClick={() => {
                  router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(nextTopic)}`);
                }}
                className="group"
              >
                <div className="text-right mr-2">
                  <div className="text-xs opacity-80">Next</div>
                  <div className="font-medium">{nextTopic}</div>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function TopicLearning() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Initializing learning quest...</p>
                <p className="text-sm text-muted-foreground">Preparing your study materials</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <TopicLearningContent />
    </Suspense>
  );
}