'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { MessageSquare, Users, Trophy, Clock, Target, CheckCircle, XCircle, Brain, Zap, Award } from 'lucide-react'

export default function DebateBotPage() {
  const [currentDebate, setCurrentDebate] = useState(null)
  const [userArgument, setUserArgument] = useState('')
  const [debateHistory, setDebateHistory] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subject, setSubject] = useState('history')
  const [difficulty, setDifficulty] = useState('medium')
  const [debateRound, setDebateRound] = useState(0)
  const [userScore, setUserScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [debateComplete, setDebateComplete] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    debatesWon: 0,
    debatesLost: 0,
    totalArguments: 0,
    bestScore: 0
  })

  const subjects = [
    { value: 'history', label: 'History', icon: '📜' },
    { value: 'politics', label: 'Politics', icon: '🏛️' },
    { value: 'science', label: 'Science', icon: '🔬' },
    { value: 'economics', label: 'Economics', icon: '💰' },
    { value: 'philosophy', label: 'Philosophy', icon: '🤔' },
    { value: 'environment', label: 'Environment', icon: '🌍' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'ethics', label: 'Ethics', icon: '⚖️' }
  ]

  const difficulties = [
    { value: 'easy', label: 'Novice', color: 'bg-green-500', rounds: 3, xp: 20 },
    { value: 'medium', label: 'Scholar', color: 'bg-yellow-500', rounds: 5, xp: 35 },
    { value: 'hard', label: 'Expert', color: 'bg-red-500', rounds: 7, xp: 50 }
  ]

  const startNewDebate = async () => {
    setIsGenerating(true)
    setUserArgument('')
    setDebateHistory([])
    setDebateRound(0)
    setUserScore(0)
    setBotScore(0)
    setDebateComplete(false)
    
    try {
      const response = await fetch('/api/games/debate-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'start_debate',
          subject, 
          difficulty 
        })
      })
      
      if (!response.ok) throw new Error('Failed to start debate')
      
      const data = await response.json()
      setCurrentDebate(data.debate)
      
      // Add bot's opening statement to history
      setDebateHistory([{
        speaker: 'bot',
        content: data.debate.botOpeningStatement,
        round: 0,
        timestamp: new Date()
      }])
      
      setDebateRound(1)
      toast.success('Debate started! Present your opening argument! 🗣️')
    } catch (error) {
      console.error('Error starting debate:', error)
      toast.error('Failed to start debate. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const submitArgument = async () => {
    if (!userArgument.trim()) {
      toast.error('Please provide your argument before submitting!')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/games/debate-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_argument',
          debateId: currentDebate.id,
          userArgument: userArgument.trim(),
          round: debateRound,
          subject,
          difficulty,
          debateHistory
        })
      })

      if (!response.ok) throw new Error('Failed to submit argument')

      const data = await response.json()
      
      // Add user argument to history
      const newUserEntry = {
        speaker: 'user',
        content: userArgument.trim(),
        round: debateRound,
        timestamp: new Date(),
        score: data.userArgumentScore,
        feedback: data.userFeedback
      }

      // Add bot counter-argument to history
      const newBotEntry = {
        speaker: 'bot', 
        content: data.botCounterArgument,
        round: debateRound,
        timestamp: new Date(),
        score: data.botArgumentScore
      }

      setDebateHistory(prev => [...prev, newUserEntry, newBotEntry])
      
      // Update scores
      setUserScore(prev => prev + data.userArgumentScore)
      setBotScore(prev => prev + data.botArgumentScore)

      // Clear user input
      setUserArgument('')

      // Check if debate is complete
      const maxRounds = difficulties.find(d => d.value === difficulty)?.rounds || 5
      if (debateRound >= maxRounds) {
        // Debate is complete
        setDebateComplete(true)
        
        const finalUserScore = userScore + data.userArgumentScore
        const finalBotScore = botScore + data.botArgumentScore
        const userWon = finalUserScore > finalBotScore
        
        // Update session stats
        setSessionStats(prev => ({
          ...prev,
          debatesWon: userWon ? prev.debatesWon + 1 : prev.debatesWon,
          debatesLost: !userWon ? prev.debatesLost + 1 : prev.debatesLost,
          totalArguments: prev.totalArguments + maxRounds,
          bestScore: Math.max(prev.bestScore, finalUserScore)
        }))

        // Award XP only if user wins or performs well
        if (userWon || finalUserScore >= finalBotScore * 0.8) {
          const difficultyXP = difficulties.find(d => d.value === difficulty)?.xp || 35
          const performanceMultiplier = userWon ? 1.0 : 0.6 // Reduced XP if lost but performed well
          const finalXP = Math.round(difficultyXP * performanceMultiplier)
          
          await fetch('/api/xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'debate_bot',
              data: {
                subject,
                difficulty,
                userScore: finalUserScore,
                botScore: finalBotScore,
                won: userWon,
                rounds: maxRounds
              }
            })
          })

          toast.success(`${userWon ? 'Debate won!' : 'Strong performance!'} +${finalXP} XP! 🏆`)
        } else {
          toast.info('Good effort! Keep practicing to improve your debate skills. 💪')
        }
      } else {
        setDebateRound(prev => prev + 1)
        toast.success(`Round ${debateRound} complete! Your turn to counter-argue! 💬`)
      }

    } catch (error) {
      console.error('Error submitting argument:', error)
      toast.error('Failed to submit argument. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score) => {
    if (score >= 8) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (score >= 6) return <Target className="w-4 h-4 text-yellow-600" />
    return <XCircle className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Debate the Bot: The Logic Arena
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Engage in structured academic debates with AI. Present evidence-based arguments, 
            counter opposing views, and develop critical thinking skills through intellectual discourse.
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Debates Won</p>
              <p className="text-2xl font-bold text-yellow-600">{sessionStats.debatesWon}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total Arguments</p>
              <p className="text-2xl font-bold text-blue-600">{sessionStats.totalArguments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-purple-600">{sessionStats.bestScore}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {sessionStats.debatesWon + sessionStats.debatesLost > 0 
                  ? Math.round((sessionStats.debatesWon / (sessionStats.debatesWon + sessionStats.debatesLost)) * 100)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Debate Setup
              </CardTitle>
              <CardDescription>
                Choose your topic and expertise level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject Area</label>
                <div className="grid grid-cols-1 gap-2">
                  {subjects.map((subj) => (
                    <Button
                      key={subj.value}
                      variant={subject === subj.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSubject(subj.value)}
                      className="justify-start text-xs"
                      disabled={currentDebate && !debateComplete}
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
                      disabled={currentDebate && !debateComplete}
                    >
                      <span>{diff.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {diff.rounds} rounds
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          +{diff.xp} XP
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Debate Status */}
              {currentDebate && !debateComplete && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Current Debate</h4>
                  <p className="text-sm text-blue-700 mb-2">{currentDebate.topic}</p>
                  <div className="flex justify-between items-center text-xs text-blue-600">
                    <span>Round {debateRound}/{difficulties.find(d => d.value === difficulty)?.rounds}</span>
                    <span>Score: {userScore} vs {botScore}</span>
                  </div>
                  <Progress 
                    value={(debateRound / (difficulties.find(d => d.value === difficulty)?.rounds)) * 100} 
                    className="mt-2" 
                  />
                </div>
              )}

              <Button 
                onClick={startNewDebate} 
                disabled={isGenerating || (currentDebate && !debateComplete)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Starting Debate...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {currentDebate && debateComplete ? 'New Debate' : 'Start Debate'}
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Debate Arena */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Topic */}
            {currentDebate && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      Debate Topic
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {currentDebate.subject}
                      </Badge>
                      <Badge className={difficulties.find(d => d.value === currentDebate.difficulty)?.color}>
                        {difficulties.find(d => d.value === currentDebate.difficulty)?.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <h3 className="font-bold text-indigo-800 mb-2">{currentDebate.topic}</h3>
                    <p className="text-indigo-700 mb-3">{currentDebate.context}</p>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600 mb-1">Bot&apos;s Position:</p>
                      <p className="font-medium text-gray-800">{currentDebate.botPosition}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Debate History */}
            {debateHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Debate History</CardTitle>
                  <CardDescription>
                    Follow the flow of arguments and counter-arguments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {debateHistory.map((entry, index) => (
                    <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md p-4 rounded-lg ${
                        entry.speaker === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">
                            {entry.speaker === 'user' ? 'You' : 'AI Bot'} 
                            {entry.round > 0 && ` - Round ${entry.round}`}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                        
                        {entry.score && (
                          <div className="mt-2 pt-2 border-t border-opacity-30 border-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                {getScoreIcon(entry.score)}
                                <span className="text-xs font-medium">
                                  Score: {entry.score}/10
                                </span>
                              </div>
                            </div>
                            {entry.feedback && (
                              <p className="text-xs mt-1 opacity-90">{entry.feedback}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Argument Input */}
            {currentDebate && !debateComplete && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Counter-Argument - Round {debateRound}</CardTitle>
                  <CardDescription>
                    Present your evidence-based argument. Focus on logic, facts, and clear reasoning.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Present your argument here... Include evidence, reasoning, and address potential counter-points. Be specific and cite examples where possible."
                    value={userArgument}
                    onChange={(e) => setUserArgument(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Characters: {userArgument.length} | Words: {userArgument.trim().split(/\s+/).filter(Boolean).length}
                    </p>
                    <Button 
                      onClick={submitArgument}
                      disabled={isSubmitting || !userArgument.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Submit Argument
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Debate Results */}
            {debateComplete && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Debate Complete!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800">Your Score</h3>
                      <p className="text-3xl font-bold text-blue-600">{userScore}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800">AI Bot Score</h3>
                      <p className="text-3xl font-bold text-gray-600">{botScore}</p>
                    </div>
                  </div>
                  
                  <div className={`text-center p-4 rounded-lg ${
                    userScore > botScore 
                      ? 'bg-green-50 text-green-800' 
                      : userScore === botScore 
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'bg-red-50 text-red-800'
                  }`}>
                    <h3 className="font-bold text-xl mb-2">
                      {userScore > botScore 
                        ? '🎉 Victory!' 
                        : userScore === botScore 
                          ? '🤝 Draw!' 
                          : '🤖 AI Wins!'}
                    </h3>
                    <p>
                      {userScore > botScore 
                        ? 'Excellent argumentation! You presented stronger evidence and reasoning.' 
                        : userScore === botScore 
                          ? 'A well-matched debate! Both sides presented compelling arguments.'
                          : 'Keep practicing! Focus on evidence-based reasoning and counter-arguments.'}
                    </p>
                  </div>

                  <Button 
                    onClick={startNewDebate}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Start New Debate
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Instructions for new users */}
            {!currentDebate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    How Debate Bot Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">1. 🎯 Choose Your Battle</h4>
                      <p className="text-indigo-700 text-sm">Select subject and difficulty. AI presents a debatable topic with its position.</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">2. ⚔️ Present Arguments</h4>
                      <p className="text-purple-700 text-sm">Counter the AI&apos;s position with evidence-based reasoning and logical arguments.</p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-800 mb-2">3. 🔄 Dynamic Exchange</h4>
                      <p className="text-pink-700 text-sm">AI responds to your arguments with counter-points, creating realistic debate flow.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">4. 🏆 Win & Learn</h4>
                      <p className="text-green-700 text-sm">Get scored on argument quality. Win debates to earn XP and improve skills!</p>
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <p className="text-gray-600 mb-4">Ready to test your argumentation skills? Start your first debate!</p>
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