"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Footer } from "@/components/footer";
import { GamingNavigation } from "@/components/gaming-navigation";
import { GamingButton } from "@/components/gaming-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, AlertCircle } from "lucide-react";

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [examData, setExamData] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    // Get exam, subject, topic, and video ID from URL parameters
    const exam = searchParams.get('exam');
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const videoId = searchParams.get('videoId');
    
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
        return;
      }
    } else {
      router.push('/dashboard');
      return;
    }

    // Fetch quiz questions from backend
    fetchQuizQuestions(videoId);
  }, [searchParams, router]);

  const fetchQuizQuestions = async (videoId) => {
    if (!session?.user?.email || !videoId) {
      setError('Missing required information to generate quiz');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = session.user.email.replace('@', '_').replace(/\./g, '_');
      const cacheId = `yt_${userId}_${videoId}`;

      const response = await fetch(`http://localhost:5000/api/user/${userId}/generate/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cache_id: cacheId,
          num_questions: 10,
          difficulty: 'mixed',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('DEBUG: Raw response from backend:', data);
      console.log('DEBUG: Quiz array:', data.quiz);
      console.log('DEBUG: Quiz length:', data.quiz?.length);
      
      if (data.quiz && data.quiz.length > 0) {
        console.log('DEBUG: First question from backend:', data.quiz[0]);
        
        // Convert backend format to frontend format
        const formattedQuestions = data.quiz.map(q => ({
          question: q.question,
          options: q.options,
          correct: q.options.indexOf(q.answer),
          difficulty: q.difficulty,
          explanation: q.explanation
        }));
        
        console.log('DEBUG: First formatted question:', formattedQuestions[0]);
        console.log('DEBUG: Formatted questions length:', formattedQuestions.length);
        
        setQuizQuestions(formattedQuestions);
        setUserAnswers(new Array(formattedQuestions.length).fill(null));
        
        // Start timer after questions are loaded
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
      } else {
        throw new Error('No quiz questions generated');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError(error.message || 'Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

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

  if (!examData || !currentSubject || loading) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              {error ? (
                <Card className="max-w-md">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle>Failed to Load Quiz</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{error}</p>
                    <div className="flex gap-4 justify-center">
                      <GamingButton type="primary" type="outline" onClick={() => router.back()}>
                        Go Back
                      </GamingButton>
                      <GamingButton type="primary" onClick={() => window.location.reload()}>
                        Try Again
                      </GamingButton>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading quiz questions...</p>
                  <p className="text-sm text-muted-foreground mt-2">Generating personalized questions for you</p>
                </>
              )}
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
                  <GamingButton type="primary" variant="default" onClick={() => {
                    // Reset quiz
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setUserAnswers(new Array(quizQuestions.length).fill(null));
                    setScore(0);
                    setTimeRemaining(300);
                    setQuizCompleted(false);
                  }}>
                    Retake Quiz
                  </GamingButton>
                  
                  {currentTopic ? (
                    <GamingButton type="primary" type="outline" onClick={() => {
                      router.push(`/topic?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}&topic=${encodeURIComponent(currentTopic)}`);
                    }}>
                      Back to Topic
                    </GamingButton>
                  ) : (
                    <GamingButton type="primary" type="outline" onClick={() => {
                      router.push(`/subject?exam=${encodeURIComponent(examData.name)}&subject=${encodeURIComponent(currentSubject)}`);
                    }}>
                      Back to Subject
                    </GamingButton>
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
      <GamingNavigation customTitle="Quiz Challenge" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <GamingButton type="primary" 
                type="ghost" 
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
              </GamingButton>
              
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
                </GamingButton>
              ))}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <GamingButton type="primary" 
              type="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </GamingButton>
            
            <div className="flex gap-4">
              <GamingButton type="primary" type="outline" onClick={handleSubmitQuiz}>
                Submit Quiz
              </GamingButton>
              
              <GamingButton type="primary" 
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
              >
                {currentQuestion === quizQuestions.length - 1 ? 'Finish' : 'Next'}
              </GamingButton>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}