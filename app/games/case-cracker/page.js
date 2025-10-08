'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Lightbulb, FileText, CheckCircle, XCircle, Brain, Trophy, Clock, Target } from 'lucide-react'

export default function CaseCrackerPage() {
  const [currentCase, setCurrentCase] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [difficulty, setDifficulty] = useState('medium')
  const [subject, setSubject] = useState('physics')
  const [casesCompleted, setCasesCompleted] = useState(0)
  const [sessionScore, setSessionScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [timerActive, setTimerActive] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval = null
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimeUp()
    }
    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  const subjects = [
    { value: 'physics', label: 'Physics', icon: '⚡' },
    { value: 'chemistry', label: 'Chemistry', icon: '🧪' },
    { value: 'biology', label: 'Biology', icon: '🧬' },
    { value: 'mathematics', label: 'Mathematics', icon: '📐' },
    { value: 'history', label: 'History', icon: '📜' },
    { value: 'economics', label: 'Economics', icon: '💰' },
    { value: 'engineering', label: 'Engineering', icon: '⚙️' },
    { value: 'environmental', label: 'Environmental Science', icon: '🌍' }
  ]

  const difficulties = [
    { value: 'easy', label: 'Apprentice', color: 'bg-green-500', xp: 15 },
    { value: 'medium', label: 'Professional', color: 'bg-yellow-500', xp: 25 },
    { value: 'hard', label: 'Expert', color: 'bg-red-500', xp: 40 }
  ]

  const generateCase = async () => {
    setIsLoading(true)
    setUserAnswer('')
    setFeedback(null)
    
    try {
      const response = await fetch('/api/games/case-cracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, difficulty, action: 'generate' })
      })
      
      if (!response.ok) throw new Error('Failed to generate case')
      
      const data = await response.json()
      setCurrentCase(data.case)
      setTimeLeft(data.case.timeLimit || 300)
      setTimerActive(true)
      
      toast.success('New case generated! Time to crack it! 🔍')
    } catch (error) {
      console.error('Error generating case:', error)
      toast.error('Failed to generate case. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please provide your solution before submitting!')
      return
    }

    setIsSubmitting(true)
    setTimerActive(false)

    try {
      const response = await fetch('/api/games/case-cracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate',
          caseId: currentCase.id,
          userAnswer: userAnswer.trim(),
          subject,
          difficulty,
          timeSpent: (currentCase.timeLimit || 300) - timeLeft
        })
      })

      if (!response.ok) throw new Error('Failed to evaluate answer')

      const data = await response.json()
      setFeedback(data.feedback)
      setCasesCompleted(prev => prev + 1)
      
      // Update session score
      const scoreGained = data.feedback.score
      setSessionScore(prev => prev + scoreGained)

      // Award XP based on performance
      const difficultyMultiplier = difficulties.find(d => d.value === difficulty)?.xp || 25
      const performanceBonus = Math.round((scoreGained / 100) * difficultyMultiplier)
      const timeBonus = timeLeft > 60 ? 5 : 0
      const totalXP = performanceBonus + timeBonus

      if (totalXP > 0) {
        await fetch('/api/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'case_cracker',
            data: {
              subject,
              difficulty,
              score: scoreGained,
              timeBonus,
              casesCompleted: casesCompleted + 1
            }
          })
        })

        toast.success(`Case solved! +${totalXP} XP earned! 🏆`)
      }

    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to evaluate answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTimeUp = () => {
    setTimerActive(false)
    if (!feedback) {
      toast.warning('Time\'s up! Submit your current solution or generate a new case.')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 60) return <Target className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Case Cracker: The Scenario Simulator
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Bridge theory and practice! Solve real-world scenarios using your knowledge. 
            Each case challenges your critical thinking and application skills.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Cases Solved</p>
              <p className="text-2xl font-bold text-yellow-600">{casesCompleted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Session Score</p>
              <p className="text-2xl font-bold text-purple-600">{sessionScore}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Time Left</p>
              <p className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Difficulty</p>
              <Badge className={`${difficulties.find(d => d.value === difficulty)?.color} text-white`}>
                {difficulties.find(d => d.value === difficulty)?.label}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Case Configuration
              </CardTitle>
              <CardDescription>
                Choose your subject and difficulty level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject Area</label>
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
                <label className="block text-sm font-medium mb-2">Difficulty Level</label>
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

              <Button 
                onClick={generateCase} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Case...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Generate New Case
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Case Display and Solution */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Case */}
            {currentCase && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Case Study: {currentCase.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {currentCase.subject}
                      </Badge>
                      <Badge className={difficulties.find(d => d.value === currentCase.difficulty)?.color}>
                        {difficulties.find(d => d.value === currentCase.difficulty)?.label}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{currentCase.context}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-800 mb-2">Scenario:</h4>
                    <p className="text-blue-700">{currentCase.scenario}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-purple-800 mb-2">Your Challenge:</h4>
                    <p className="text-purple-700">{currentCase.challenge}</p>
                  </div>

                  {currentCase.parameters && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Given Parameters:</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {currentCase.parameters.map((param, index) => (
                          <li key={index}>{param}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-semibold text-yellow-800 mb-2">Key Concepts to Consider:</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentCase.keyConcepts.map((concept, index) => (
                        <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Answer Input */}
            {currentCase && !feedback && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Solution</CardTitle>
                  <CardDescription>
                    Provide your detailed analysis and solution. Explain your reasoning and show your work.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write your detailed solution here... Explain your approach, show calculations if needed, and justify your reasoning with the key concepts."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Characters: {userAnswer.length} | Words: {userAnswer.trim().split(/\s+/).filter(Boolean).length}
                    </p>
                    <Button 
                      onClick={submitAnswer}
                      disabled={isSubmitting || !userAnswer.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Submit Solution
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Display */}
            {feedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getScoreIcon(feedback.score)}
                    Case Analysis Results
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className={`text-lg font-bold ${getScoreColor(feedback.score)}`}>
                        {feedback.score}/100
                      </span>
                    </div>
                    <Progress value={feedback.score} className="flex-1 max-w-48" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Strengths in Your Solution:</h4>
                    <ul className="list-disc list-inside text-green-700 space-y-1">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  {feedback.improvements.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <h4 className="font-semibold text-orange-800 mb-2">🔧 Areas for Improvement:</h4>
                      <ul className="list-disc list-inside text-orange-700 space-y-1">
                        {feedback.improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-800 mb-2">📚 Expert Solution:</h4>
                    <p className="text-blue-700 whitespace-pre-wrap">{feedback.expertSolution}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-purple-800 mb-2">💡 Learning Points:</h4>
                    <ul className="list-disc list-inside text-purple-700 space-y-1">
                      {feedback.learningPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    onClick={generateCase}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Crack Another Case
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Instructions for new users */}
            {!currentCase && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    How Case Cracker Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">1. 🎯 Choose Your Challenge</h4>
                      <p className="text-blue-700 text-sm">Select subject area and difficulty level based on your learning goals</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">2. 🧠 Analyze the Case</h4>
                      <p className="text-purple-700 text-sm">Read the scenario carefully and identify key concepts needed</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">3. ✍️ Craft Your Solution</h4>
                      <p className="text-green-700 text-sm">Write detailed analysis showing your reasoning and application</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">4. 📈 Learn & Improve</h4>
                      <p className="text-yellow-700 text-sm">Get AI feedback and compare with expert solutions</p>
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <p className="text-gray-600 mb-4">Ready to start cracking cases? Generate your first scenario!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}