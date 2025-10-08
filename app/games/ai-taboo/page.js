"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy,
  Clock,
  Zap,
  ArrowLeft,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { XPNotificationManager } from "@/lib/xp-notifications"

export default function AITabooGame() {
  const [gameState, setGameState] = useState('menu') // menu, playing, result
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [maxRounds] = useState(10)
  const [userGuess, setUserGuess] = useState('')
  const [currentCard, setCurrentCard] = useState(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isLoading, setIsLoading] = useState(false)
  const [gameHistory, setGameHistory] = useState([])

  // Sample game cards (in a real app, these would come from AI)
  const sampleCards = [
    {
      concept: "Photosynthesis",
      description: "This biological process converts light energy into chemical energy, producing glucose and releasing a gas we breathe. Green organisms use this to make their own food.",
      forbiddenWords: ["sunlight", "chlorophyll", "plant", "oxygen", "green", "leaves"],
      difficulty: "Medium",
      subject: "Biology"
    },
    {
      concept: "Democracy",
      description: "A system of government where power is held by the people, either directly or through elected representatives. Citizens have the right to vote and participate in decision-making.",
      forbiddenWords: ["vote", "election", "government", "people", "citizens", "politics"],
      difficulty: "Easy",
      subject: "Civics"
    },
    {
      concept: "Gravity",
      description: "An invisible force that pulls objects toward each other. It keeps us on the ground and causes things to fall downward when dropped.",
      forbiddenWords: ["force", "fall", "Newton", "weight", "attraction", "mass"],
      difficulty: "Easy",
      subject: "Physics"
    },
    {
      concept: "Mitochondria",
      description: "Often called the powerhouse of the cell, this organelle produces energy for cellular activities through a process involving glucose and oxygen.",
      forbiddenWords: ["powerhouse", "cell", "energy", "ATP", "organelle", "cellular"],
      difficulty: "Hard",
      subject: "Biology"
    },
    {
      concept: "Renaissance",
      description: "A cultural movement in Europe that marked the transition from medieval to modern times, characterized by renewed interest in art, science, and classical learning.",
      forbiddenWords: ["art", "Europe", "medieval", "culture", "classical", "rebirth"],
      difficulty: "Medium",
      subject: "History"
    }
  ]

  // Timer effect
  useEffect(() => {
    let timer
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleTimeUp()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, gameState])

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setRound(1)
    setGameHistory([])
    setTimeLeft(60)
    generateNewCard()
  }

  const generateNewCard = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/games/taboo-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: 'medium',
          count: 1
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.cards && data.cards.length > 0) {
          setCurrentCard(data.cards[0])
        } else {
          // Fallback to sample cards
          const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)]
          setCurrentCard(randomCard)
        }
      } else {
        // Fallback to sample cards
        const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)]
        setCurrentCard(randomCard)
      }
    } catch (error) {
      console.error('Error generating card:', error)
      // Fallback to sample cards
      const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)]
      setCurrentCard(randomCard)
    } finally {
      setUserGuess('')
      setIsLoading(false)
    }
  }

  const handleGuess = async () => {
    if (!userGuess.trim() || !currentCard) return

    const isCorrect = userGuess.toLowerCase().trim() === currentCard.concept.toLowerCase()
    const points = isCorrect ? (currentCard.difficulty === 'Hard' ? 30 : currentCard.difficulty === 'Medium' ? 20 : 10) : 0
    
    const roundResult = {
      round,
      concept: currentCard.concept,
      userGuess: userGuess.trim(),
      correct: isCorrect,
      points,
      timeRemaining: timeLeft
    }

    setGameHistory([...gameHistory, roundResult])
    
    if (isCorrect) {
      setScore(score + points)
      
      // Award XP for correct answer immediately
      try {
        const response = await fetch('/api/xp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'taboo_game',
            data: {
              gameResult: 'correct_answer',
              score: points,
              correctGuesses: 1,
              totalCards: 1,
              difficulty: currentCard.difficulty
            }
          })
        });
        
        if (response.ok) {
          const xpData = await response.json();
          
          // Update navbar XP
          if (typeof window !== 'undefined' && window.updateNavbarXP) {
            window.updateNavbarXP(xpData.totalXP, xpData.currentStreak);
          }
          
          // Show XP notification
          toast.success(`🎯 Correct! +${xpData.xpAwarded} XP`, {
            description: `Great guess for "${currentCard.concept}"!`,
            duration: 2000,
          });
        }
      } catch (error) {
        console.error('Error awarding XP for correct answer:', error);
      }
    } else {
      // Show encouragement message for wrong answers  
      toast.info(`❌ Not quite! The answer was "${currentCard.concept}"`, {
        description: "Keep trying - you'll get the next one!",
        duration: 2500,
      });
    }

    if (round >= maxRounds) {
      endGame()
    } else {
      setRound(round + 1)
      generateNewCard()
    }
  }

  const handleSkip = () => {
    const roundResult = {
      round,
      concept: currentCard.concept,
      userGuess: 'Skipped',
      correct: false,
      points: 0,
      timeRemaining: timeLeft
    }

    setGameHistory([...gameHistory, roundResult])

    if (round >= maxRounds) {
      endGame()
    } else {
      setRound(round + 1)
      generateNewCard()
    }
  }

  const handleTimeUp = () => {
    setGameState('result')
  }

  const endGame = async () => {
    setGameState('result')
    
    // Show completion message (XP already awarded during gameplay for each correct answer)
    const correctAnswers = gameHistory.filter(h => h.correct).length
    const accuracy = (correctAnswers / maxRounds) * 100
    
    // Show game completion toast
    toast.success(`🎉 Taboo game completed!`, {
      description: `${correctAnswers}/${maxRounds} correct answers (${Math.round(accuracy)}% accuracy)`,
      duration: 4000,
    });
  }

  const resetGame = () => {
    setGameState('menu')
    setScore(0)
    setRound(1)
    setCurrentCard(null)
    setUserGuess('')
    setTimeLeft(60)
    setGameHistory([])
  }

  const getScoreRating = () => {
    const percentage = (score / (maxRounds * 30)) * 100
    if (percentage >= 80) return { rating: "Excellent!", color: "text-green-500", icon: Trophy }
    if (percentage >= 60) return { rating: "Good Job!", color: "text-blue-500", icon: Zap }
    if (percentage >= 40) return { rating: "Not Bad!", color: "text-yellow-500", icon: Lightbulb }
    return { rating: "Keep Trying!", color: "text-orange-500", icon: Brain }
  }

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Link href="/games">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-blue-500/10">
                <Brain className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">AI Taboo</h1>
            <p className="text-xl text-muted-foreground mb-8">
              The Forbidden Words Challenge
            </p>

            <Card className="mb-8 border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-1 mr-3">1</div>
                      <p className="text-sm">Read the AI-generated description of a concept</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-1 mr-3">2</div>
                      <p className="text-sm">Guess the concept without using forbidden words</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-1 mr-3">3</div>
                      <p className="text-sm">Earn points based on difficulty level</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center mt-1 mr-3">4</div>
                      <p className="text-sm">Complete 10 rounds within the time limit</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Scoring System:</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <Badge variant="outline" className="text-green-600 border-green-600">Easy</Badge>
                      <p className="mt-1">10 points</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">Medium</Badge>
                      <p className="mt-1">20 points</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-red-600 border-red-600">Hard</Badge>
                      <p className="mt-1">30 points</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={startGame} size="lg" className="px-8">
              <Brain className="h-5 w-5 mr-2" />
              Start Game
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Round {round}/{maxRounds}</Badge>
              <Badge variant="outline">Score: {score}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={(round - 1) / maxRounds * 100} className="h-2" />
          </div>

          {isLoading ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">AI is generating your next challenge...</p>
              </CardContent>
            </Card>
          ) : currentCard && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Game Card */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="text-center">
                  <div className="flex justify-center items-center space-x-2 mb-2">
                    <Badge variant="outline" className={
                      currentCard.difficulty === 'Hard' ? 'text-red-600 border-red-600' :
                      currentCard.difficulty === 'Medium' ? 'text-yellow-600 border-yellow-600' :
                      'text-green-600 border-green-600'
                    }>
                      {currentCard.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentCard.subject}</Badge>
                  </div>
                  <CardTitle>Guess the Concept</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Description */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-center text-lg leading-relaxed">
                      {currentCard.description}
                    </p>
                  </div>

                  {/* Forbidden Words */}
                  <div className="text-center">
                    <h4 className="font-semibold mb-3 text-red-600">Forbidden Words:</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentCard.forbiddenWords.map((word, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="space-y-4">
                    <Input
                      value={userGuess}
                      onChange={(e) => setUserGuess(e.target.value)}
                      placeholder="Type your guess here..."
                      className="text-center text-lg p-6"
                      onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                      autoFocus
                    />
                    
                    <div className="flex gap-3">
                      <Button onClick={handleGuess} className="flex-1" disabled={!userGuess.trim()}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Guess
                      </Button>
                      <Button onClick={handleSkip} variant="outline" className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Skip
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'result') {
    const { rating, color, icon: RatingIcon } = getScoreRating()
    const correctAnswers = gameHistory.filter(h => h.correct).length

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-muted/20">
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Results Header */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <RatingIcon className={`h-12 w-12 ${color}`} />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-2">Game Complete!</h1>
            <p className={`text-2xl font-semibold mb-8 ${color}`}>{rating}</p>

            {/* Score Summary */}
            <Card className="mb-8 border-2">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{score}</div>
                    <p className="text-sm text-muted-foreground">Total Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">{correctAnswers}</div>
                    <p className="text-sm text-muted-foreground">Correct Answers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">{Math.round((correctAnswers/maxRounds)*100)}%</div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game History */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Round by Round</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {gameHistory.map((round, index) => (
                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${round.correct ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex items-center space-x-3">
                        {round.correct ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div className="text-left">
                          <p className="font-medium">{round.concept}</p>
                          <p className="text-sm text-muted-foreground">Your guess: {round.userGuess}</p>
                        </div>
                      </div>
                      <Badge variant={round.correct ? "default" : "destructive"}>
                        +{round.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
              <Link href="/games" className="flex-1">
                <Button variant="default" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Games
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}