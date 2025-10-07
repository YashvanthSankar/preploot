"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";

const EXAMS = [
  { 
    name: "JEE", 
    fullName: "Joint Entrance Examination",
    subjects: {
      "Physics": [
        "Mechanics", "Thermodynamics", "Waves and Oscillations", 
        "Electrostatics", "Current Electricity", "Magnetic Effects", 
        "Electromagnetic Induction", "Optics", "Modern Physics"
      ],
      "Chemistry": [
        "Physical Chemistry", "Atomic Structure", "Chemical Bonding", 
        "States of Matter", "Thermodynamics", "Chemical Equilibrium", 
        "Organic Chemistry", "Inorganic Chemistry"
      ],
      "Mathematics": [
        "Algebra", "Trigonometry", "Coordinate Geometry", 
        "Calculus", "Vectors", "3D Geometry", "Probability", 
        "Statistics", "Complex Numbers", "Matrices"
      ]
    },
    description: "For engineering colleges admission"
  },
  { 
    name: "NEET", 
    fullName: "National Eligibility Entrance Test",
    subjects: {
      "Physics": [
        "Mechanics", "Thermodynamics", "Waves and Sound", 
        "Electricity and Magnetism", "Optics", "Modern Physics"
      ],
      "Chemistry": [
        "Some Basic Concepts", "Atomic Structure", "Chemical Bonding", 
        "States of Matter", "Solutions", "Equilibrium", "Organic Chemistry"
      ],
      "Biology": [
        "Diversity of Living World", "Cell Structure", "Plant Physiology", 
        "Human Physiology", "Reproduction", "Genetics", "Ecology"
      ]
    },
    description: "For medical colleges admission"
  },
  { 
    name: "GATE", 
    fullName: "Graduate Aptitude Test in Engineering",
    subjects: {
      "Engineering Mathematics": [
        "Linear Algebra", "Calculus", "Differential Equations", 
        "Probability", "Numerical Methods"
      ],
      "General Aptitude": [
        "Verbal Ability", "Numerical Ability", "Reasoning", "Data Interpretation"
      ],
      "Subject Paper": [
        "Core Concepts", "Applied Mathematics", "Problem Solving"
      ]
    },
    description: "For M.Tech and PSU recruitment"
  },
  { 
    name: "UPSC", 
    fullName: "Union Public Service Commission",
    subjects: {
      "General Studies": [
        "History", "Geography", "Polity", "Economics", 
        "Environment", "Science & Technology", "Current Affairs"
      ],
      "CSAT": [
        "Comprehension", "Logical Reasoning", "Data Interpretation", 
        "Decision Making", "Problem Solving"
      ],
      "Optional Subject": [
        "Paper I Topics", "Paper II Topics", "Advanced Concepts"
      ],
      "Essay": [
        "Essay Writing", "Current Issues", "Social Issues", "Analysis"
      ]
    },
    description: "For civil services recruitment"
  },
  { 
    name: "CAT", 
    fullName: "Common Admission Test",
    subjects: {
      "Quantitative Aptitude": [
        "Number System", "Algebra", "Geometry", "Arithmetic", 
        "Trigonometry", "Permutation", "Probability"
      ],
      "Data Interpretation": [
        "Tables", "Bar Charts", "Line Charts", "Pie Charts", 
        "Data Sufficiency", "Caselets"
      ],
      "Verbal Ability": [
        "Reading Comprehension", "Para Jumbles", "Sentence Correction", 
        "Vocabulary", "Grammar"
      ],
      "Logical Reasoning": [
        "Arrangements", "Puzzles", "Series", "Coding", "Blood Relations"
      ]
    },
    description: "For MBA programs admission"
  },
  { 
    name: "SSC CGL", 
    fullName: "Staff Selection Commission",
    subjects: {
      "General Intelligence": [
        "Analogies", "Space Visualization", "Problem Solving", 
        "Analysis", "Decision Making"
      ],
      "General Awareness": [
        "History", "Geography", "Economics", "Current Affairs", 
        "Sports", "Science"
      ],
      "Quantitative Aptitude": [
        "Number Systems", "Ratio Proportion", "Percentage", 
        "Profit Loss", "Time and Work"
      ],
      "English Comprehension": [
        "Grammar", "Vocabulary", "Reading Comprehension", 
        "Synonyms", "Error Detection"
      ]
    },
    description: "For government job recruitment"
  },
  { 
    name: "Others / Custom Exam", 
    fullName: "Custom Examination",
    subjects: {
      "Custom Subject 1": ["Topic 1", "Topic 2", "Topic 3"],
      "Custom Subject 2": ["Topic A", "Topic B", "Topic C"],
      "Custom Subject 3": ["Topic X", "Topic Y", "Topic Z"]
    },
    description: "Create your own exam pattern"
  },
];

export default function ExamSelection() {
  const [selectedExam, setSelectedExam] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Function to save exam selection to both localStorage and database
  const saveExamSelection = async (examData) => {
    // Save to localStorage for immediate access
    localStorage.setItem('selectedExam', JSON.stringify(examData));
    
    // Save to database if user is authenticated
    if (session?.user?.id) {
      try {
        await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedExam: examData.name,
            selectedSubjects: Object.keys(examData.subjects)
          })
        });
      } catch (error) {
        console.error('Failed to save exam selection to database:', error);
      }
    }
  };

  if (!selectedExam) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{selectedExam.name} Subjects</h1>
            <p className="text-muted-foreground">{selectedExam.fullName}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(selectedExam.subjects).map(([subject, topics]) => (
              <Card key={subject} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader>
                  <h3 className="text-lg font-semibold">{subject}</h3>
                  <p className="text-sm text-muted-foreground">{topics.length} topics</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Progress: 0%</p>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }}></div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const examData = {
                          name: selectedExam.name,
                          fullName: selectedExam.fullName,
                          subjects: selectedExam.subjects,
                          description: selectedExam.description
                        };
                        saveExamSelection(examData);
                        router.push(`/subject?exam=${encodeURIComponent(selectedExam.name)}&subject=${encodeURIComponent(subject)}`);
                      }}
                    >
                      Study {subject}
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
              const examData = {
                name: selectedExam.name,
                fullName: selectedExam.fullName,
                subjects: selectedExam.subjects,
                description: selectedExam.description
              };
              saveExamSelection(examData);
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
