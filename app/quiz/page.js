"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy } from "lucide-react";

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [examData, setExamData] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Sample quiz questions - in a real app, these would come from a database
  const quizQuestions = [
    {
      question: "What is the fundamental principle in this topic?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: 1
    },
    {
      question: "Which of the following is most important for understanding this concept?",
      options: ["Basic theory", "Practical application", "Mathematical formulation", "All of the above"],
      correct: 3
    },
    {
      question: "How would you apply this knowledge in real scenarios?",
      options: ["Method 1", "Method 2", "Method 3", "Depends on context"],
      correct: 3
    },
    {
      question: "What are the key challenges in mastering this topic?",
      options: ["Complexity", "Time management", "Practice requirements", "All factors"],
      correct: 3
    },
    {
      question: "Which approach is most effective for learning this topic?",
      options: ["Reading only", "Video tutorials", "Practice problems", "Combined approach"],
      correct: 3
    }
  ];

  const [userAnswers, setUserAnswers] = useState(new Array(quizQuestions.length).fill(null));

  useEffect(() => {
    // Get exam, subject, and topic from URL parameters
    const exam = searchParams.get('exam');
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    
    if (!exam || !subject) {
      router.push('/dashboard');
      return;
    }

    setCurrentSubject(subject);
    setCurrentTopic(topic);

    // Load selected exam from localStorage
    const storedExam = localStorage.getItem('selectedExam');
    if (storedExam) {
      const parsedExam = JSON.parse(storedExam);
      if (parsedExam.name === exam) {
        setExamData(parsedExam);
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }

    // Timer countdown
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1]);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(userAnswers[currentQuestion - 1]);
    }
  };

  const handleSubmitQuiz = () => {
    let correctAnswers = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === quizQuestions[index].correct) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setQuizCompleted(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!examData || !currentSubject) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading quiz...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                  {passed ? (
                    <Trophy className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {passed ? 'Congratulations!' : 'Keep Practicing!'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Quiz Results</h3>
                  <p className="text-muted-foreground">
                    {examData.name} - {currentSubject}
                    {currentTopic && ` - ${currentTopic}`}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-3xl font-bold">{score}/{quizQuestions.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Percentage</p>
                    <p className="text-3xl font-bold">{percentage}%</p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-medium ${passed ? 'text-green-800' : 'text-red-800'}`}>
                    {passed ? 'Great job! You passed the quiz.' : 'You need 60% to pass. Review the material and try again.'}
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => {
                    // Reset quiz
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setUserAnswers(new Array(quizQuestions.length).fill(null));
                    setScore(0);
                    setTimeRemaining(300);
                    setQuizCompleted(false);
                  }}>
                    Retake Quiz
                  </Button>
                  
                  {currentTopic ? (
                    <Button variant="outline" onClick={() => {
                      router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(currentTopic)}`);
                    }}>
                      Back to Topic
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => {
                      router.push(`/subject?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}`);
                    }}>
                      Back to Subject
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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
          {/* Quiz Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  if (currentTopic) {
                    router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(currentTopic)}`);
                  } else {
                    router.push(`/subject?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}`);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center text-orange-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Practice Quiz</h1>
              <p className="text-lg text-muted-foreground">
                {examData.name} - {currentSubject}
                {currentTopic && ` - ${currentTopic}`}
              </p>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">
                {quizQuestions[currentQuestion].question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quizQuestions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedAnswer === index ? 'border-primary-foreground bg-primary-foreground' : 'border-muted-foreground'
                    }`}>
                      {selectedAnswer === index && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleSubmitQuiz}>
                Submit Quiz
              </Button>
              
              <Button 
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
              >
                {currentQuestion === quizQuestions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}