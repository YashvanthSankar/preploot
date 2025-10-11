"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Download,
  Lightbulb,
  Clock,
  Target,
  Brain
} from 'lucide-react';

export function VideoSidebar({ videoId, videoTitle, exam, subject, topic }) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('quiz');
  const [quizData, setQuizData] = useState(null);
  const [notesData, setNotesData] = useState(null);
  const [loading, setLoading] = useState({ quiz: false, notes: false, processing: false });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [cacheId, setCacheId] = useState(null);
  const [processStatus, setProcessStatus] = useState(null);

  // Get user ID in the format expected by backend (email with @ and . replaced)
  const getUserId = () => {
    if (!session?.user?.email) return null;
    return session.user.email.replace('@', '_').replace(/\./g, '_');
  };

  // Process YouTube video
  const processYouTubeVideo = async () => {
    const userId = getUserId();
    if (!userId || !videoId) return;
    
    setLoading(prev => ({ ...prev, processing: true }));
    setProcessStatus('Processing video...');
    
    try {
      const response = await fetch(`/api/user/${userId}/upload/youtube`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoId}`
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setCacheId(data.cache_id);
        
        // Show appropriate status based on transcript availability
        if (data.has_transcript) {
          setProcessStatus('Video processed successfully!');
        } else {
          setProcessStatus('Video processed (no transcript available - quiz/notes may be limited)');
        }
        
        return data.cache_id;
      } else {
        throw new Error(data.error || 'Failed to process video');
      }
    } catch (error) {
      console.error('Error processing YouTube video:', error);
      setProcessStatus(`Error: ${error.message}`);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  };

  // Load quiz data from Flask backend
  const loadQuiz = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, quiz: true }));
    setProcessStatus('Generating quiz...');
    
    try {
      // First process video if not already processed
      let currentCacheId = cacheId;
      if (!currentCacheId) {
        currentCacheId = await processYouTubeVideo();
        if (!currentCacheId) return;
      }

      const response = await fetch(`/api/user/${userId}/generate/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cache_id: currentCacheId,
          num_questions: 5,
          difficulty: 'mixed'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Quiz data received:', data);
        
        // Backend returns { questions: [...] }
        if (data.questions && Array.isArray(data.questions)) {
          // Transform backend format to component format
          const transformedQuiz = {
            questions: data.questions.map(q => ({
              id: Math.random().toString(36).substr(2, 9),
              question: q.question,
              options: q.options,
              correct: q.options.indexOf(q.answer), // Convert answer string to index
              difficulty: q.difficulty || 'medium',
              explanation: q.explanation || 'No explanation provided.'
            }))
          };
          
          console.log('Transformed quiz data:', transformedQuiz);
          setQuizData(transformedQuiz);
          setProcessStatus('Quiz generated successfully!');
        } else {
          console.warn('Invalid quiz structure:', data);
          throw new Error('Invalid quiz format received from backend');
        }
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setProcessStatus(`Error: ${error.message}`);
      // Fallback to mock quiz
      await loadMockQuiz();
    } finally {
      setLoading(prev => ({ ...prev, quiz: false }));
    }
  };

  // Load notes data from Flask backend
  const loadNotes = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    setLoading(prev => ({ ...prev, notes: true }));
    setProcessStatus('Generating notes...');
    
    try {
      // First process video if not already processed
      let currentCacheId = cacheId;
      if (!currentCacheId) {
        currentCacheId = await processYouTubeVideo();
        if (!currentCacheId) return;
      }

      const response = await fetch(`/api/user/${userId}/generate/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cache_id: currentCacheId
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setNotesData({
          title: `Study Notes - ${videoTitle}`,
          markdown: data.markdown,
          notes: data.notes
        });
        setProcessStatus('Notes generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate notes');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      setProcessStatus(`Error: ${error.message}`);
      // Fallback to mock notes
      await loadMockNotes();
    } finally {
      setLoading(prev => ({ ...prev, notes: false }));
    }
  };

  // Fallback mock quiz function
  const loadMockQuiz = async () => {
    setLoading(prev => ({ ...prev, quiz: true }));
    try {
      // For now, generate sample quiz data
      // TODO: Replace with actual API call to generate quiz from video content
      const mockQuiz = {
        title: `${subject} Quiz - ${topic}`,
        description: `Test your understanding of the concepts covered in this video`,
        questions: [
          {
            id: 1,
            question: `What is the main concept discussed in this ${subject} video?`,
            options: [
              "Basic fundamentals and theory",
              "Advanced problem solving techniques", 
              "Previous year question analysis",
              "Exam strategy and tips"
            ],
            correct: 0,
            explanation: "This video covers the fundamental concepts which form the foundation for advanced topics."
          },
          {
            id: 2,
            question: `Which exam is this video most suitable for?`,
            options: [
              exam || "NEET",
              "JEE Main",
              "JEE Advanced", 
              "CBSE Board"
            ],
            correct: 0,
            explanation: `This video is specifically designed for ${exam} preparation.`
          },
          {
            id: 3,
            question: `What is the recommended approach for studying ${subject}?`,
            options: [
              "Memorize all formulas",
              "Practice more numerical problems",
              "Understand concepts first, then practice",
              "Focus only on previous year questions"
            ],
            correct: 2,
            explanation: "Understanding concepts thoroughly before practicing problems is the most effective approach."
          },
          {
            id: 4,
            question: `How can you best utilize this video for exam preparation?`,
            options: [
              "Watch once and move on",
              "Take notes while watching",
              "Watch multiple times and practice related problems",
              "Just watch for entertainment"
            ],
            correct: 2,
            explanation: "Active learning through multiple viewings and practice yields the best results."
          }
        ]
      };
      setQuizData(mockQuiz);
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  };

  // Fallback mock notes function
  const loadMockNotes = async () => {
    try {
      const mockNotes = {
        title: `Study Notes - ${subject} ${topic}`,
        markdown: `# Study Notes - ${subject} ${topic}

## Summary
Comprehensive notes covering key concepts from this ${exam} ${subject} video.

## Key Concepts
- Understanding the fundamentals of ${subject} is crucial for ${exam} success
- Focus on conceptual clarity before attempting numerical problems  
- Regular practice and revision are essential for retention
- Connect theoretical knowledge with practical applications

## Important Formulas
- List of essential formulas covered in this video
- Derivation steps for key equations
- When and how to apply specific formulas
- Common mistakes to avoid while using formulas

## Exam Strategy
- Time management tips for ${exam} ${subject} section
- Question prioritization strategies
- Common question patterns and approaches
- Last-minute revision techniques

## Practice Recommendations
- Suggested practice problems related to this topic
- Previous year questions to attempt
- Mock test strategies for this subject
- Additional resources for deeper understanding

## Tips
- Make your own summary after watching the video
- Practice problems immediately after learning concepts
- Review these notes before your exam
- Discuss difficult concepts with peers or teachers`,
        sections: [
          {
            title: "Key Concepts",
            content: [
              `Understanding the fundamentals of ${subject} is crucial for ${exam} success`,
              "Focus on conceptual clarity before attempting numerical problems",
              "Regular practice and revision are essential for retention",
              "Connect theoretical knowledge with practical applications"
            ]
          },
          {
            title: "Important Formulas",
            content: [
              "List of essential formulas covered in this video",
              "Derivation steps for key equations",
              "When and how to apply specific formulas",
              "Common mistakes to avoid while using formulas"
            ]
          },
          {
            title: "Exam Strategy",
            content: [
              `Time management tips for ${exam} ${subject} section`,
              "Question prioritization strategies",
              "Common question patterns and approaches",
              "Last-minute revision techniques"
            ]
          },
          {
            title: "Practice Recommendations",
            content: [
              "Suggested practice problems related to this topic",
              "Previous year questions to attempt",
              "Mock test strategies for this subject",
              "Additional resources for deeper understanding"
            ]
          }
        ],
        tips: [
          "Make your own summary after watching the video",
          "Practice problems immediately after learning concepts",
          "Review these notes before your exam",
          "Discuss difficult concepts with peers or teachers"
        ]
      };
      setNotesData(mockNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  useEffect(() => {
    // Only start quiz timer when quiz tab is loaded and quiz exists
    if (activeTab === 'quiz' && quizData && !quizSubmitted) {
      setQuizStartTime(Date.now());
    }
  }, [videoId, exam, subject, topic, activeTab]);

  useEffect(() => {
    // Reset quiz timer when switching to quiz tab
    if (activeTab === 'quiz' && !quizSubmitted && quizData) {
      setQuizStartTime(Date.now());
    }
  }, [activeTab]);

  const handleAnswerSelect = (questionId, answerIndex) => {
    if (!quizSubmitted) {
      setQuizAnswers(prev => ({
        ...prev,
        [questionId]: answerIndex
      }));
    }
  };

  const handleQuizSubmit = async () => {
    if (!quizData?.questions || !session?.user?.id) return;
    
    const endTime = Date.now();
    const timeTaken = quizStartTime ? Math.floor((endTime - quizStartTime) / 1000) : 0;
    
    let correctAnswers = 0;
    const userAnswers = {};
    
    quizData.questions.forEach(question => {
      const userAnswer = quizAnswers[question.id];
      userAnswers[question.id] = {
        selected: userAnswer,
        correct: question.correct,
        isCorrect: userAnswer === question.correct
      };
      
      if (userAnswer === question.correct) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / quizData.questions.length) * 100);
    setScore(correctAnswers);
    setQuizSubmitted(true);

    // Award XP for quiz completion
    try {
      const xpResponse = await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quiz_completion',
          data: {
            correctAnswers,
            totalQuestions: quizData.questions.length,
            quizId: `${videoId}-quiz`,
            subject,
            exam,
            answers: userAnswers
          }
        })
      });

      if (xpResponse.ok) {
        const xpData = await xpResponse.json();
        console.log('XP awarded:', xpData);
        
        // Show XP notification
        setProcessStatus(`Quiz completed! +${xpData.xpAwarded} XP earned. ${xpData.activityLog?.[0] || ''}`);
        
        // Update local state with new XP info if needed
        if (xpData.user) {
          // You can dispatch this to a global state or show a toast notification
          console.log('User XP updated:', xpData.user);
        }
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }

    // Save quiz progress to API
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quiz_attempt',
          data: {
            quizId: `${videoId}-quiz`,
            score: finalScore,
            answers: userAnswers,
            timeTaken,
            exam,
            subject,
            topic
          }
        })
      });

      if (response.ok) {
        console.log('Quiz progress saved successfully');
      }
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    setQuizStartTime(Date.now());
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Learning Resources</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quiz" className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4" />
              <span>Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Notes</span>
            </TabsTrigger>
          </TabsList>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="mt-4">
            <div className="space-y-4">
              {/* Process Status */}
              {processStatus && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  {processStatus}
                </div>
              )}
              
              {loading.quiz || loading.processing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">
                    {loading.processing ? 'Processing video...' : 'Generating quiz...'}
                  </span>
                </div>
              ) : !quizData ? (
                <div className="text-center py-8 space-y-4">
                  <div className="space-y-2">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-semibold">Generate AI Quiz</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a quiz based on the content of this video using our AI system
                    </p>
                  </div>
                  <Button 
                    onClick={loadQuiz}
                    disabled={loading.quiz || loading.processing}
                    className="w-full"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Generate Quiz from Video
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{quizData.title}</h3>
                    <p className="text-sm text-muted-foreground">{quizData.description}</p>
                    {quizSubmitted && (
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span className="font-medium">Score: {score}/{quizData?.questions?.length || 0}</span>
                        </div>
                        <Button size="sm" onClick={resetQuiz}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>

                  <ScrollArea className="h-96">
                    <div className="space-y-4 pr-4">
                      {quizData?.questions?.map((question, index) => (
                        <Card key={question.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              <p className="font-medium leading-relaxed">{question.question}</p>
                            </div>
                            
                            <div className="space-y-2">
                              {question.options?.map((option, optionIndex) => {
                                const isSelected = quizAnswers[question.id] === optionIndex;
                                const isCorrect = optionIndex === question.correct;
                                const showResult = quizSubmitted;
                                
                                return (
                                  <button
                                    key={optionIndex}
                                    onClick={() => handleAnswerSelect(question.id, optionIndex)}
                                    disabled={quizSubmitted}
                                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                                      showResult
                                        ? isCorrect
                                          ? 'border-green-500 bg-green-50 text-green-700'
                                          : isSelected && !isCorrect
                                          ? 'border-red-500 bg-red-50 text-red-700'
                                          : 'border-gray-200'
                                        : isSelected
                                        ? 'border-primary bg-primary/10'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{option}</span>
                                      {showResult && isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                                      {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                                    </div>
                                  </button>
                                );
                              }) || <p className="text-sm text-muted-foreground">No options available</p>}
                            </div>
                            
                            {quizSubmitted && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-start space-x-2">
                                  <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-800">Explanation:</p>
                                    <p className="text-sm text-blue-700">{question.explanation}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>

                  {!quizSubmitted && (
                    <Button 
                      onClick={handleQuizSubmit} 
                      className="w-full"
                      disabled={Object.keys(quizAnswers).length !== quizData.questions.length}
                    >
                      Submit Quiz
                    </Button>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <div className="space-y-4">
              {/* Process Status */}
              {processStatus && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  {processStatus}
                </div>
              )}
              
              {loading.notes || loading.processing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">
                    {loading.processing ? 'Processing video...' : 'Generating notes...'}
                  </span>
                </div>
              ) : !notesData ? (
                <div className="text-center py-8 space-y-4">
                  <div className="space-y-2">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-semibold">Generate Study Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      Create comprehensive study notes from this video content using AI
                    </p>
                  </div>
                  <Button 
                    onClick={loadNotes}
                    disabled={loading.notes || loading.processing}
                    className="w-full"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Generate Notes from Video
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{notesData.title}</h3>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{notesData.summary}</p>
                  </div>

                  <ScrollArea className="h-96">
                    <div className="space-y-4 pr-4">
                      {/* Show markdown content if available */}
                      {notesData.markdown ? (
                        <Card className="p-4">
                          <div className="prose prose-sm max-w-none space-y-2">
                            {notesData.markdown.split('\n').map((line, index) => {
                              // Simple markdown parsing
                              if (line.startsWith('# ')) {
                                return <h1 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                              } else if (line.startsWith('## ')) {
                                return <h2 key={index} className="text-lg font-semibold mt-3 mb-2">{line.substring(3)}</h2>;
                              } else if (line.startsWith('### ')) {
                                return <h3 key={index} className="text-md font-medium mt-2 mb-1">{line.substring(4)}</h3>;
                              } else if (line.startsWith('- ')) {
                                return <li key={index} className="text-sm text-muted-foreground ml-4">{line.substring(2)}</li>;
                              } else if (line.trim() === '') {
                                return <br key={index} />;
                              } else {
                                return <p key={index} className="text-sm text-muted-foreground">{line}</p>;
                              }
                            })}
                          </div>
                        </Card>
                      ) : notesData.sections ? (
                        <>
                          {notesData.sections.map((section, index) => (
                            <Card key={index} className="p-4">
                              <h4 className="font-medium mb-3 flex items-center space-x-2">
                                <BookOpen className="h-4 w-4" />
                                <span>{section.title}</span>
                              </h4>
                              <ul className="space-y-2">
                                {section.content.map((item, itemIndex) => (
                                  <li key={itemIndex} className="text-sm text-muted-foreground leading-relaxed">
                                    • {item}
                                  </li>
                                ))}
                              </ul>
                            </Card>
                          ))}

                          {notesData.tips && (
                            <Card className="p-4">
                              <h4 className="font-medium mb-3 flex items-center space-x-2">
                                <Lightbulb className="h-4 w-4" />
                                <span>Study Tips</span>
                              </h4>
                              <ul className="space-y-2">
                                {notesData.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="text-sm text-muted-foreground leading-relaxed">
                                    💡 {tip}
                                  </li>
                                ))}
                              </ul>
                            </Card>
                          )}
                        </>
                      ) : null}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}