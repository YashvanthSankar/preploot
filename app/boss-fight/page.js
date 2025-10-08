'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Skull, 
  Sword, 
  Shield, 
  Heart, 
  Zap,
  Trophy,
  Star,
  ArrowRight,
  X,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

// Boss fight questions database
const bossQuestions = {
  'physics-boss': {
    name: 'Physics Master',
    health: 100,
    avatar: '⚡',
    questions: [
      {
        id: 1,
        question: "A projectile is launched at an angle of 45° with initial velocity 20 m/s. What is the maximum height reached?",
        options: ["5.1 m", "10.2 m", "15.3 m", "20.4 m"],
        correct: 1,
        difficulty: "hard",
        damage: 25
      },
      {
        id: 2,
        question: "In SHM, when the displacement is half the amplitude, the ratio of kinetic to potential energy is:",
        options: ["1:3", "3:1", "1:1", "2:1"],
        correct: 1,
        difficulty: "hard",
        damage: 25
      },
      {
        id: 3,
        question: "The electric field inside a hollow charged sphere is:",
        options: ["Maximum at center", "Zero everywhere", "Varies linearly", "Constant non-zero"],
        correct: 1,
        difficulty: "medium",
        damage: 20
      },
      {
        id: 4,
        question: "In Young's double slit experiment, fringe width is directly proportional to:",
        options: ["Distance between slits", "Wavelength of light", "Distance from screen", "Both B and C"],
        correct: 3,
        difficulty: "hard",
        damage: 30
      }
    ]
  },
  'chemistry-boss': {
    name: 'Chemistry Sage',
    health: 100,
    avatar: '🧪',
    questions: [
      {
        id: 1,
        question: "Which electronic configuration represents a transition element?",
        options: ["[Ar] 4s²", "[Ar] 3d⁵ 4s²", "[Ne] 3s²", "[Kr] 5s²"],
        correct: 1,
        difficulty: "medium",
        damage: 20
      },
      {
        id: 2,
        question: "The hybridization of carbon in benzene is:",
        options: ["sp³", "sp²", "sp", "sp³d"],
        correct: 1,
        difficulty: "medium",
        damage: 25
      },
      {
        id: 3,
        question: "Which of the following is the strongest acid?",
        options: ["HClO", "HClO₂", "HClO₃", "HClO₄"],
        correct: 3,
        difficulty: "hard",
        damage: 30
      },
      {
        id: 4,
        question: "The IUPAC name of CH₃-CH(CH₃)-CH₂-OH is:",
        options: ["2-methylpropan-1-ol", "1-methylpropan-2-ol", "2-methylpropanol", "isobutanol"],
        correct: 0,
        difficulty: "hard",
        damage: 25
      }
    ]
  },
  'math-boss': {
    name: 'Math Wizard',
    health: 100,
    avatar: '📐',
    questions: [
      {
        id: 1,
        question: "The derivative of sin⁻¹(x) with respect to x is:",
        options: ["1/√(1-x²)", "-1/√(1-x²)", "1/√(1+x²)", "-1/√(1+x²)"],
        correct: 0,
        difficulty: "medium",
        damage: 20
      },
      {
        id: 2,
        question: "If |z₁| = |z₂| = 1 and z₁ + z₂ = 1, then |z₁ - z₂| equals:",
        options: ["1", "√2", "√3", "2"],
        correct: 2,
        difficulty: "hard",
        damage: 30
      },
      {
        id: 3,
        question: "The equation of the tangent to the parabola y² = 4x at point (1, 2) is:",
        options: ["x - y + 1 = 0", "x + y - 3 = 0", "x - y - 1 = 0", "x + y + 1 = 0"],
        correct: 0,
        difficulty: "hard",
        damage: 25
      },
      {
        id: 4,
        question: "∫₀^π sin⁴x dx equals:",
        options: ["π/4", "π/2", "3π/8", "π/8"],
        correct: 2,
        difficulty: "hard",
        damage: 25
      }
    ]
  }
}

export default function BossFightPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const bossId = searchParams.get('boss')
  const subject = searchParams.get('subject')
  const exam = searchParams.get('exam')

  const [gameState, setGameState] = useState('intro') // intro, fighting, victory, defeat
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [playerHealth, setPlayerHealth] = useState(100)
  const [bossHealth, setBossHealth] = useState(100)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isAnswering, setIsAnswering] = useState(false)

  const boss = bossQuestions[bossId] || bossQuestions['physics-boss']
  const questions = boss.questions || []

  useEffect(() => {
    if (gameState === 'fighting' && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      // Time's up - boss attacks
      handleTimeUp()
    }
  }, [timeLeft, gameState, showResult])

  const handleTimeUp = () => {
    setPlayerHealth(prev => Math.max(0, prev - 20))
    setShowResult(true)
    setIsAnswering(false)
    
    setTimeout(() => {
      if (playerHealth - 20 <= 0) {
        setGameState('defeat')
      } else {
        nextQuestion()
      }
    }, 2000)
  }

  const startBattle = () => {
    setGameState('fighting')
    setCurrentQuestion(0)
    setTimeLeft(30)
    setShowResult(false)
  }

  const handleAnswer = (answerIndex) => {
    if (isAnswering || showResult) return
    
    setSelectedAnswer(answerIndex)
    setIsAnswering(true)
    setShowResult(true)
    
    const question = questions[currentQuestion]
    const isCorrect = answerIndex === question.correct
    
    if (isCorrect) {
      // Player attacks boss
      const damage = question.damage || 25
      setBossHealth(prev => Math.max(0, prev - damage))
      setScore(prev => prev + damage)
      toast.success(`Critical hit! -${damage} HP`, {
        description: "Excellent answer!",
        duration: 2000
      })
    } else {
      // Boss attacks player
      setPlayerHealth(prev => Math.max(0, prev - 25))
      toast.error("Boss attacks! -25 HP", {
        description: "Wrong answer!",
        duration: 2000
      })
    }
    
    setTimeout(() => {
      if (bossHealth - (isCorrect ? question.damage : 0) <= 0) {
        setGameState('victory')
        awardXP()
      } else if (playerHealth - (isCorrect ? 0 : 25) <= 0) {
        setGameState('defeat')
      } else {
        nextQuestion()
      }
    }, 2000)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsAnswering(false)
      setTimeLeft(30)
    } else {
      // All questions completed
      if (bossHealth < playerHealth) {
        setGameState('victory')
        awardXP()
      } else {
        setGameState('defeat')
      }
    }
  }

  const awardXP = async () => {
    try {
      await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'boss_defeat',
          data: {
            bossId,
            subject,
            exam,
            score,
            playerHealth,
            questionsAnswered: currentQuestion + 1,
            totalQuestions: questions.length
          }
        })
      })
    } catch (error) {
      console.error('Error awarding XP:', error)
    }
  }

  const resetBattle = () => {
    setGameState('intro')
    setCurrentQuestion(0)
    setPlayerHealth(100)
    setBossHealth(100)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setTimeLeft(30)
    setIsAnswering(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-black">
        <Card className="p-8 text-center">
          <Skull className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You must be logged in to challenge the boss</p>
        </Card>
      </div>
    )
  }

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6">{boss.avatar}</div>
            <h1 className="text-4xl font-bold mb-4 text-red-600">{boss.name}</h1>
            <p className="text-xl mb-6 text-muted-foreground">
              The ultimate challenge awaits! Face {questions.length} deadly questions and prove your mastery of {subject}.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="p-4 bg-green-50">
                <Heart className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="font-bold">Player</div>
                <div className="text-2xl text-green-600">100 HP</div>
              </Card>
              <Card className="p-4 bg-red-50">
                <Skull className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <div className="font-bold">Boss</div>
                <div className="text-2xl text-red-600">100 HP</div>
              </Card>
            </div>

            <div className="space-y-4 mb-8">
              <Badge variant="destructive" className="mr-2">High Difficulty</Badge>
              <Badge variant="outline" className="mr-2">{questions.length} Questions</Badge>
              <Badge variant="outline">+200 XP Reward</Badge>
            </div>

            <div className="flex space-x-4">
              <Button 
                size="lg" 
                onClick={startBattle}
                className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
              >
                <Sword className="h-5 w-5 mr-2" />
                Begin Battle
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.history.back()}
              >
                <Shield className="h-5 w-5 mr-2" />
                Retreat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'victory') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-green-500 to-blue-600 flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="p-8 text-center">
            <Trophy className="h-20 w-20 mx-auto mb-6 text-yellow-500" />
            <h1 className="text-4xl font-bold mb-4 text-green-600">Victory!</h1>
            <p className="text-xl mb-6">
              You have defeated the {boss.name} and proven your mastery of {subject}!
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4 bg-green-50">
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <div className="font-bold">Score</div>
                <div className="text-xl">{score}</div>
              </Card>
              <Card className="p-4 bg-blue-50">
                <Zap className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="font-bold">XP Earned</div>
                <div className="text-xl">+200</div>
              </Card>
              <Card className="p-4 bg-purple-50">
                <Crown className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="font-bold">Rank</div>
                <div className="text-xl">Master</div>
              </Card>
            </div>

            <div className="flex space-x-4">
              <Button onClick={resetBattle} variant="outline" className="flex-1">
                <Sword className="h-4 w-4 mr-2" />
                Fight Again
              </Button>
              <Button onClick={() => window.location.href = '/map'} className="flex-1">
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue Journey
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'defeat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-black flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="p-8 text-center">
            <Skull className="h-20 w-20 mx-auto mb-6 text-red-500" />
            <h1 className="text-4xl font-bold mb-4 text-red-600">Defeat!</h1>
            <p className="text-xl mb-6">
              The {boss.name} has proven too powerful this time. Train harder and return stronger!
            </p>
            
            <div className="flex space-x-4">
              <Button onClick={resetBattle} className="flex-1 bg-red-600 hover:bg-red-700">
                <Sword className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/map'} variant="outline" className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Retreat to Map
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fighting state
  const question = questions[currentQuestion]
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black">
      {/* Battle HUD */}
      <div className="p-4 bg-black/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Player */}
            <div className="text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-bold text-white">You</div>
              <Progress value={playerHealth} className="h-3 mb-2" />
              <div className="text-sm text-white">{playerHealth}/100 HP</div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{timeLeft}</div>
              <div className="text-sm text-white/70">seconds left</div>
              <Badge variant="outline" className="mt-2">
                Question {currentQuestion + 1}/{questions.length}
              </Badge>
            </div>

            {/* Boss */}
            <div className="text-center">
              <div className="text-2xl mb-2">{boss.avatar}</div>
              <div className="font-bold text-white">{boss.name}</div>
              <Progress value={bossHealth} className="h-3 mb-2" />
              <div className="text-sm text-white">{bossHealth}/100 HP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">{question?.question}</CardTitle>
              <Badge variant={question?.difficulty === 'hard' ? 'destructive' : 'secondary'}>
                {question?.difficulty} • {question?.damage} damage
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {question?.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={
                      showResult
                        ? index === question.correct
                          ? 'default'
                          : index === selectedAnswer
                          ? 'destructive'
                          : 'outline'
                        : selectedAnswer === index
                        ? 'secondary'
                        : 'outline'
                    }
                    className="p-4 h-auto text-left justify-start"
                    onClick={() => handleAnswer(index)}
                    disabled={isAnswering || showResult}
                  >
                    <span className="mr-3 font-bold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                    {showResult && index === question.correct && (
                      <CheckCircle className="h-5 w-5 ml-auto text-green-500" />
                    )}
                    {showResult && index === selectedAnswer && index !== question.correct && (
                      <X className="h-5 w-5 ml-auto text-red-500" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {showResult && (
            <Card className="text-center">
              <CardContent className="p-6">
                {selectedAnswer === question.correct ? (
                  <div className="text-green-600">
                    <Zap className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Critical Hit!</h3>
                    <p>Boss takes {question.damage} damage!</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <Skull className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Boss Attacks!</h3>
                    <p>You take 25 damage!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}