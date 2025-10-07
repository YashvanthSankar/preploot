"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BookOpen, Trophy, Zap, Target, Edit } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [selectedExam, setSelectedExam] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Load selected exam from localStorage
    const storedExam = localStorage.getItem('selectedExam');
    if (storedExam) {
      setSelectedExam(JSON.parse(storedExam));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session?.user?.name || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground">Ready to continue your exam preparation?</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Completed today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">XP Points</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Total earned</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Streak</CardTitle>
                <Trophy className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-%</div>
                <p className="text-xs text-muted-foreground">Overall</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Action */}
          {selectedExam ? (
            // Show selected exam and subjects
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Your Selected Exam</CardTitle>
                    <p className="text-muted-foreground mt-1">{selectedExam.fullName}</p>
                  </div>
                  <Link href="/dashboard/exam-selection">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Change Exam
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedExam.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedExam.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{selectedExam.subjects.length} Subjects</p>
                      <p className="text-xs text-muted-foreground">Ready to start</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Available Subjects:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(selectedExam.subjects).map(([subject, topics]) => (
                        <Card 
                          key={subject} 
                          className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            router.push(`/subject?exam=${encodeURIComponent(selectedExam.name)}&subject=${encodeURIComponent(subject)}`);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium">{subject}</h5>
                              <p className="text-xs text-muted-foreground">{Array.isArray(topics) ? topics.length : 0} topics • Progress: 0%</p>
                              <div className="w-full bg-muted rounded-full h-1 mt-1">
                                <div className="bg-primary h-1 rounded-full" style={{ width: "0%" }}></div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/subject?exam=${encodeURIComponent(selectedExam.name)}&subject=${encodeURIComponent(subject)}`);
                              }}
                            >
                              Start Learning
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">
                      Start Practice Test
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Study Materials
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Show exam selection CTA if no exam selected
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Start Your Journey</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center space-y-4">
                <Target className="h-16 w-16 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Choose Your Competitive Exam</h3>
                  <p className="text-muted-foreground mb-4">
                    Select from JEE, NEET, GATE, UPSC, CAT and more to begin your preparation
                  </p>
                </div>
                <Link href="/dashboard/exam-selection">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Select Your Exam
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedExam ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Selected {selectedExam.name} exam</p>
                        <p className="text-xs text-muted-foreground">Ready to start preparation</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Start practicing to see more activity here!
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No recent activity. Start by selecting your exam to begin your preparation journey!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
