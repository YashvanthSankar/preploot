'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Zap, Brain, Target, Trophy, Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle, Flame, Star } from 'lucide-react'

export default function SynapseSurgePage() {
  const [gameState, setGameState] = useState('menu') // menu, playing, paused, gameOver
  const [currentPair, setCurrentPair] = useState(null)
  const [currentPhrase, setCurrentPhrase] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [speed, setSpeed] = useState(2000) // milliseconds between phrases
  const [subject, setSubject] = useState('biology')
  const [difficulty, setDifficulty] = useState('medium')
  const [gameMode, setGameMode] = useState('timed') // timed, survival, sprint
  const [sessionStats, setSessionStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
    averageAccuracy: 0,
    conceptsMastered: 0
  })
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [phraseHistory, setPhraseHistory] = useState([])
  
  const gameInterval = useRef(null)
  const speedMultiplier = useRef(1)

  const subjects = [
    { value: 'biology', label: 'Biology', icon: '🧬' },
    { value: 'chemistry', label: 'Chemistry', icon: '🧪' },
    { value: 'physics', label: 'Physics', icon: '⚡' },
    { value: 'mathematics', label: 'Mathematics', icon: '📐' },
    { value: 'history', label: 'History', icon: '📜' },
    { value: 'computer_science', label: 'Computer Science', icon: '💻' },
    { value: 'literature', label: 'Literature', icon: '�' },
    { value: 'geography', label: 'Geography', icon: '🌍' }
  ]

  const gameModes = [
    { 
      value: 'timed', 
      label: 'Timed Challenge', 
      description: '60 seconds, score as many as possible',
      duration: 60,
      xpMultiplier: 1.0
    },
    { 
      value: 'survival', 
      label: 'Survival Mode', 
      description: 'No time limit, but speed increases',
      duration: null,
      xpMultiplier: 1.5
    },
    { 
      value: 'sprint', 
      label: 'Speed Sprint', 
      description: '30 seconds of rapid-fire action',
      duration: 30,
      xpMultiplier: 1.2
    }
  ]

  const difficulties = [
    { value: 'easy', label: 'Novice', baseSpeed: 3000, xp: 10 },
    { value: 'medium', label: 'Expert', baseSpeed: 2000, xp: 15 },
    { value: 'hard', label: 'Master', baseSpeed: 1200, xp: 25 }
  ]

  // Timer effect
  useEffect(() => {
    let timer = null
    if (gameState === 'playing' && gameMode === 'timed' || gameMode === 'sprint') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameState, gameMode])

  // Phrase generation effect
  useEffect(() => {
    if (gameState === 'playing' && currentPair) {
      const interval = setInterval(() => {
        generateNextPhrase()
      }, speed / speedMultiplier.current)
      
      gameInterval.current = interval
      return () => clearInterval(interval)
    }
  }, [gameState, currentPair, speed])

  const startGame = async () => {
    setIsLoading(true)
    try {
      // Reset game state
      setScore(0)
      setStreak(0)
      setTimeLeft(gameModes.find(m => m.value === gameMode)?.duration || 60)
      setSpeed(difficulties.find(d => d.value === difficulty)?.baseSpeed || 2000)
      speedMultiplier.current = 1
      setPhraseHistory([])
      setFeedback(null)

      // Get concept pair from API
      const response = await fetch('/api/games/synapse-surge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_concept_pair',
          subject,
          difficulty
        })
      })

      if (!response.ok) throw new Error('Failed to get concept pair')

      const data = await response.json()
      setCurrentPair(data.conceptPair)
      setGameState('playing')
      
      // Generate first phrase immediately
      setTimeout(() => generateNextPhrase(), 500)
      
      toast.success('Game started! Quick thinking required! ⚡')
    } catch (error) {
      console.error('Error starting game:', error)
      toast.error('Failed to start game. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateNextPhrase = async () => {
    if (!currentPair || gameState !== 'playing') return

    try {
      const response = await fetch('/api/games/synapse-surge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_phrase',
          conceptPair: currentPair,
          subject,
          difficulty,
          usedPhrases: phraseHistory.map(p => p.phrase)
        })
      })

      if (!response.ok) throw new Error('Failed to get phrase')

      const data = await response.json()
      setCurrentPhrase(data.phrase)
    } catch (error) {
      console.error('Error generating phrase:', error)
    }
  }

  const classifyPhrase = async (selectedConcept) => {
    if (!currentPhrase || gameState !== 'playing') return

    try {
      const response = await fetch('/api/games/synapse-surge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'classify_phrase',
          phrase: currentPhrase,
          selectedConcept,
          conceptPair: currentPair
        })
      })

      if (!response.ok) throw new Error('Failed to classify phrase')

      const data = await response.json()
      const isCorrect = data.correct

      // Update phrase history
      setPhraseHistory(prev => [...prev, {
        phrase: currentPhrase.text,
        selectedConcept,
        correctConcept: data.correctConcept,
        isCorrect,
        timestamp: Date.now()
      }])

      if (isCorrect) {
        const points = calculatePoints()
        setScore(prev => prev + points)
        setStreak(prev => {
          const newStreak = prev + 1
          setBestStreak(current => Math.max(current, newStreak))
          
          // Speed up game in survival mode
          if (gameMode === 'survival' && newStreak % 5 === 0) {
            speedMultiplier.current = Math.min(speedMultiplier.current * 1.15, 3)
          }
          
          return newStreak
        })
        
        setFeedback({ type: 'correct', points })
        setTimeout(() => setFeedback(null), 1000)
      } else {
        setStreak(0)
        speedMultiplier.current = Math.max(speedMultiplier.current * 0.9, 1) // Slow down slightly on error
        
        setFeedback({ 
          type: 'incorrect', 
          correctAnswer: data.correctConcept,
          explanation: data.explanation 
        })
        setTimeout(() => setFeedback(null), 2000)
        
        // End game in survival mode on wrong answer
        if (gameMode === 'survival') {
          endGame()
          return
        }
      }

      // Clear current phrase and generate next
      setCurrentPhrase(null)
    } catch (error) {
      console.error('Error classifying phrase:', error)
    }
  }

  const calculatePoints = () => {
    const basePoints = 10
    const streakBonus = Math.min(streak * 2, 50) // Up to 50 bonus points
    const speedBonus = Math.round(speedMultiplier.current * 5) // Speed multiplier bonus
    return basePoints + streakBonus + speedBonus
  }

  const endGame = async () => {
    setGameState('gameOver')
    clearInterval(gameInterval.current)

    // Calculate final stats
    const accuracy = phraseHistory.length > 0 ? 
      (phraseHistory.filter(p => p.isCorrect).length / phraseHistory.length) * 100 : 0

    // Update session stats
    setSessionStats(prev => ({
      gamesPlayed: prev.gamesPlayed + 1,
      totalScore: prev.totalScore + score,
      bestScore: Math.max(prev.bestScore, score),
      averageAccuracy: prev.gamesPlayed > 0 ? 
        ((prev.averageAccuracy * prev.gamesPlayed) + accuracy) / (prev.gamesPlayed + 1) : accuracy,
      conceptsMastered: prev.conceptsMastered + (bestStreak >= 10 ? 1 : 0)
    }))

    // Award XP based on performance
    if (score > 0) {
      const difficultyXP = difficulties.find(d => d.value === difficulty)?.xp || 15
      const modeMultiplier = gameModes.find(m => m.value === gameMode)?.xpMultiplier || 1.0
      const performanceMultiplier = Math.min(accuracy / 100, 1.0) // Based on accuracy
      const streakBonus = bestStreak >= 20 ? 20 : bestStreak >= 10 ? 10 : bestStreak >= 5 ? 5 : 0
      
      const totalXP = Math.round((difficultyXP * modeMultiplier * performanceMultiplier) + streakBonus)

      if (totalXP > 0) {
        await fetch('/api/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'synapse_surge',
            data: {
              subject,
              difficulty,
              gameMode,
              score,
              accuracy,
              bestStreak,
              phrasesClassified: phraseHistory.length
            }
          })
        })

        toast.success(`Game complete! +${totalXP} XP earned! ⚡`)
      }
    }
  }

  const pauseGame = () => {
    setGameState('paused')
    clearInterval(gameInterval.current)
  }

  const resumeGame = () => {
    setGameState('playing')
  }

  const resetGame = () => {
    setGameState('menu')
    setCurrentPair(null)
    setCurrentPhrase(null)
    setScore(0)
    setStreak(0)
    setTimeLeft(60)
    speedMultiplier.current = 1
    setPhraseHistory([])
    setFeedback(null)
    clearInterval(gameInterval.current)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-cyan-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Synapse Surge: The Concept Classifier
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Lightning-fast concept differentiation! Rapidly classify phrases to train your mental agility 
            for competitive exams. Speed increases as you improve!
          </p>
        </div>

        {/* Game Menu */}
        {gameState === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Game Setup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map((subj) => (
                        <Button
                          key={subj.value}
                          variant={subject === subj.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSubject(subj.value)}
                          className="text-xs"
                        >
                          {subj.icon} {subj.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <div className="space-y-2">
                      {difficulties.map((diff) => (
                        <Button
                          key={diff.value}
                          variant={difficulty === diff.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDifficulty(diff.value)}
                          className="w-full justify-between"
                        >
                          <span>{diff.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            +{diff.xp} XP
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Game Mode</label>
                    <div className="space-y-2">
                      {gameModes.map((mode) => (
                        <Button
                          key={mode.value}
                          variant={gameMode === mode.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setGameMode(mode.value)}
                          className="w-full text-left"
                        >
                          <div>
                            <div className="font-medium">{mode.label}</div>
                            <div className="text-xs text-muted-foreground">{mode.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Session Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Games Played:</span>
                    <span className="font-medium">{sessionStats.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Best Score:</span>
                    <span className="font-medium">{sessionStats.bestScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Accuracy:</span>
                    <span className="font-medium">{sessionStats.averageAccuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Concepts Mastered:</span>
                    <span className="font-medium">{sessionStats.conceptsMastered}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Instructions */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-600" />
                    How to Play Synapse Surge
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-cyan-50 p-4 rounded-lg border-l-4 border-cyan-500">
                      <h4 className="font-semibold text-cyan-800 mb-2">1. ⚡ Rapid Recognition</h4>
                      <p className="text-cyan-700 text-sm">Two similar concepts appear at the top. Phrases flash at the bottom - classify them quickly!</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-800 mb-2">2. 🎯 Quick Decisions</h4>
                      <p className="text-blue-700 text-sm">Click left or right to assign each phrase to the correct concept. Speed and accuracy matter!</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                      <h4 className="font-semibold text-indigo-800 mb-2">3. 🔥 Build Streaks</h4>
                      <p className="text-indigo-700 text-sm">Consecutive correct answers build your streak multiplier and increase your score!</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-800 mb-2">4. 📈 Adaptive Speed</h4>
                      <p className="text-purple-700 text-sm">Game speeds up as you improve. In survival mode, mistakes end the game!</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg border">
                    <h3 className="font-bold text-lg mb-4 text-center">Example: Biology</h3>
                    <div className="text-center mb-4">
                      <div className="inline-flex gap-8">
                        <div className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold">
                          MITOSIS
                        </div>
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                          MEIOSIS
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-center text-lg font-medium">
                        "Results in four genetically unique daughter cells"
                      </p>
                      <p className="text-center text-sm text-gray-600 mt-2">
                        Which concept does this describe? Choose quickly!
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={startGame}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-lg py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Loading Concepts...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Start Synapse Surge
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Game Playing State */}
        {gameState === 'playing' && currentPair && (
          <div className="space-y-6">
            {/* Game Header */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-xl">{score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="font-bold text-lg">{streak}</span>
                      <span className="text-sm text-gray-600">streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">{bestStreak}</span>
                      <span className="text-sm text-gray-600">best</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {(gameMode === 'timed' || gameMode === 'sprint') && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="font-bold text-lg text-blue-600">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    )}
                    <Button onClick={pauseGame} variant="outline" size="sm">
                      Pause
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Concept Pair */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-gray-700 mb-6">Classify the phrase into the correct concept:</h2>
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                    <Button
                      onClick={() => classifyPhrase(currentPair.concept1.name)}
                      disabled={!currentPhrase}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                    >
                      <ArrowLeft className="w-6 h-6 mr-3" />
                      <div className="text-center">
                        <div className="text-xl font-bold">{currentPair.concept1.name}</div>
                        <div className="text-sm opacity-90 mt-1">{currentPair.concept1.description}</div>
                      </div>
                    </Button>
                    
                    <div className="flex items-center justify-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-lg">VS</div>
                    </div>
                    
                    <Button
                      onClick={() => classifyPhrase(currentPair.concept2.name)}
                      disabled={!currentPhrase}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                    >
                      <div className="text-center">
                        <div className="text-xl font-bold">{currentPair.concept2.name}</div>
                        <div className="text-sm opacity-90 mt-1">{currentPair.concept2.description}</div>
                      </div>
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                  </div>
                </div>

                {/* Current Phrase */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-10 rounded-2xl border-3 border-gradient-to-r border-indigo-200 min-h-[140px] flex items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-purple-100/30 to-pink-100/30 rounded-2xl"></div>
                  {currentPhrase ? (
                    <div className="relative z-10 text-center">
                      <div className="text-sm font-semibold text-indigo-600 mb-2">CLASSIFY THIS PHRASE:</div>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-800 leading-relaxed max-w-4xl">
                        "{currentPhrase.text}"
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-lg font-medium">Loading next phrase...</span>
                    </div>
                  )}
                </div>

                {/* Speed Indicator */}
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">Speed:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            speedMultiplier.current >= level 
                              ? 'bg-orange-500' 
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {speedMultiplier.current.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            {feedback && (
              <Card>
                <CardContent className="p-4">
                  <div className={`flex items-center gap-2 ${
                    feedback.type === 'correct' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feedback.type === 'correct' ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">Correct! +{feedback.points} points</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        <span className="font-bold">
                          Incorrect! Correct answer: {feedback.correctAnswer}
                        </span>
                      </>
                    )}
                  </div>
                  {feedback.explanation && (
                    <p className="text-sm text-gray-600 mt-1">{feedback.explanation}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Paused State */}
        {gameState === 'paused' && (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
              <div className="flex items-center justify-center gap-4">
                <Button onClick={resumeGame} className="bg-green-600 hover:bg-green-700">
                  Resume Game
                </Button>
                <Button onClick={resetGame} variant="outline">
                  End Game
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Over State */}
        {gameState === 'gameOver' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Game Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{score}</p>
                  <p className="text-sm text-gray-600">Final Score</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{bestStreak}</p>
                  <p className="text-sm text-gray-600">Best Streak</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {phraseHistory.length > 0 ? 
                      Math.round((phraseHistory.filter(p => p.isCorrect).length / phraseHistory.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{phraseHistory.length}</p>
                  <p className="text-sm text-gray-600">Classifications</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button onClick={startGame} className="bg-gradient-to-r from-cyan-600 to-blue-600">
                  Play Again
                </Button>
                <Button onClick={resetGame} variant="outline">
                  Change Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}