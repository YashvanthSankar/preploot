"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Target, Trophy, Play } from "lucide-react";

export default function SubjectLearning() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [examData, setExamData] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [topics, setTopics] = useState([]);

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
      if (parsedExam.name === exam && parsedExam.subjects[subject]) {
        setExamData(parsedExam);
        setTopics(parsedExam.subjects[subject] || []);
      } else {
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
              {topics.length} topics available for study
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
              <CardTitle className="text-sm font-medium">Topics Completed</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Out of {topics.length} topics</p>
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

        {/* Topics Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select a Topic to Study</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic, index) => (
                <Card key={topic} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{topic}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded">#{index + 1}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1">
                        <div className="bg-primary h-1 rounded-full" style={{ width: "0%" }}></div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => {
                          router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(topic)}`);
                        }}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Study Topic
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" onClick={() => {
            // Navigate to first topic
            if (topics.length > 0) {
              router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(topics[0])}`);
            }
          }}>
            Start from First Topic
          </Button>
          <Button size="lg" variant="outline" onClick={() => {
            // Download notes functionality - make it functional
            const element = document.createElement('a');
            const content = `${examData.name} - ${currentSubject} Study Notes\n\nTopics:\n${topics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}`;
            const file = new Blob([content], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = `${examData.name}_${currentSubject}_Notes.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}>
            Download Notes
          </Button>
          <Button size="lg" variant="outline" onClick={() => {
            // Practice test - navigate to a practice page
            router.push(`/practice?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}`);
          }}>
            Practice Test
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}