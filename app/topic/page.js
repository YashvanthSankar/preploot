"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { YouTubeVideos } from "@/components/youtube-videos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Target, Trophy, CheckCircle } from "lucide-react";

export default function TopicLearning() {
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading topic...</p>
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation and Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push(`/subject?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {currentSubject}
            </Button>
            
            {isTopicCompleted && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Topic Completed!</span>
              </div>
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{currentTopic}</h1>
            <p className="text-lg text-muted-foreground">
              {examData.name} → {currentSubject}
            </p>
            <p className="text-sm text-muted-foreground">
              Study resources and practice materials for this topic
            </p>
          </div>
        </div>

        {/* Topic Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topic Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isTopicCompleted ? '100%' : '0%'}</div>
              <p className="text-xs text-muted-foreground">
                {isTopicCompleted ? 'Completed' : 'In Progress'}
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: isTopicCompleted ? "100%" : "0%" }}></div>
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
              <CardTitle className="text-sm font-medium">XP Earned</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isTopicCompleted ? '100' : '0'}</div>
              <p className="text-xs text-muted-foreground">Points for this topic</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {!isTopicCompleted && (
            <Button size="lg" onClick={markTopicComplete}>
              Mark as Complete
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={() => {
            // Practice quiz for this specific topic
            router.push(`/quiz?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(currentTopic)}`);
          }}>
            Practice Quiz
          </Button>
          <Button size="lg" variant="outline" onClick={() => {
            // Download topic notes
            const element = document.createElement('a');
            const content = `${examData.name} - ${currentSubject} - ${currentTopic}\n\nStudy Notes:\n\n1. Key Concepts\n2. Important Formulas\n3. Practice Problems\n4. Tips and Tricks\n\nStatus: ${isTopicCompleted ? 'Completed' : 'In Progress'}`;
            const file = new Blob([content], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = `${examData.name}_${currentSubject}_${currentTopic}_Notes.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}>
            Download Notes
          </Button>
        </div>

        {/* YouTube Videos Section for this specific topic */}
        <YouTubeVideos 
          exam={examData.name}
          subject={`${currentSubject} ${currentTopic}`}
          isVisible={true}
        />

        {/* Navigation to Next/Previous Topics */}
        <div className="flex justify-between mt-8">
          <div>
            {previousTopic && (
              <Button 
                variant="outline"
                onClick={() => {
                  router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(previousTopic)}`);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous: {previousTopic}
              </Button>
            )}
          </div>
          <div>
            {nextTopic && (
              <Button 
                onClick={() => {
                  router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(nextTopic)}`);
                }}
              >
                Next: {nextTopic}
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}