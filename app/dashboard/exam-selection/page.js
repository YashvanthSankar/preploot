"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const EXAMS = [
  { 
    name: "JEE", 
    fullName: "Joint Entrance Examination",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    description: "For engineering colleges admission"
  },
  { 
    name: "NEET", 
    fullName: "National Eligibility Entrance Test",
    subjects: ["Physics", "Chemistry", "Biology"],
    description: "For medical colleges admission"
  },
  { 
    name: "GATE", 
    fullName: "Graduate Aptitude Test in Engineering",
    subjects: ["Engineering Mathematics", "General Aptitude", "Subject Paper"],
    description: "For M.Tech and PSU recruitment"
  },
  { 
    name: "UPSC", 
    fullName: "Union Public Service Commission",
    subjects: ["General Studies", "CSAT", "Optional Subject", "Essay"],
    description: "For civil services recruitment"
  },
  { 
    name: "CAT", 
    fullName: "Common Admission Test",
    subjects: ["Quantitative Aptitude", "Data Interpretation", "Verbal Ability", "Logical Reasoning"],
    description: "For MBA programs admission"
  },
  { 
    name: "SSC CGL", 
    fullName: "Staff Selection Commission",
    subjects: ["General Intelligence", "General Awareness", "Quantitative Aptitude", "English Comprehension"],
    description: "For government job recruitment"
  },
  { 
    name: "Others / Custom Exam", 
    fullName: "Custom Examination",
    subjects: ["Custom Subject 1", "Custom Subject 2", "Custom Subject 3"],
    description: "Create your own exam pattern"
  },
];

export default function ExamSelection() {
  const [selectedExam, setSelectedExam] = useState(null);
  const router = useRouter();

  if (!selectedExam) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Choose Your Competitive Exam</h1>
              <p className="text-muted-foreground">Select an exam to start your preparation journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXAMS.map((exam) => (
                <Card key={exam.name} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <h3 className="text-xl font-bold">{exam.name}</h3>
                    <p className="text-sm text-muted-foreground">{exam.fullName}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{exam.description}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {exam.subjects.length} subjects included
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedExam(exam)}
                    >
                      Select {exam.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{selectedExam.name} Subjects</h1>
            <p className="text-muted-foreground">{selectedExam.fullName}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {selectedExam.subjects.map((subject, index) => (
              <Card key={subject} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader>
                  <h3 className="text-lg font-semibold">{subject}</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress: 0%</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="secondary" onClick={() => setSelectedExam(null)} className="mr-4">
              ← Back to Exam Selection
            </Button>
            <Button onClick={() => {
              // Store selected exam and subjects in localStorage
              localStorage.setItem('selectedExam', JSON.stringify({
                name: selectedExam.name,
                fullName: selectedExam.fullName,
                subjects: selectedExam.subjects,
                description: selectedExam.description
              }));
              router.push('/dashboard');
            }}>
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
