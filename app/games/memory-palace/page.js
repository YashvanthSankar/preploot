"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Lightbulb, 
  Sparkles, 
  ArrowLeft,
  BookOpen,
  Save,
  RefreshCw,
  Star,
  CheckCircle,
  Copy,
  Share2
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AIMemoryPalaceGame() {
  const [gameState, setGameState] = useState('input') // input, generating, result, saved
  const [userConcept, setUserConcept] = useState('')
  const [conceptType, setConceptType] = useState('general')
  const [difficulty, setDifficulty] = useState('medium')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedMnemonic, setGeneratedMnemonic] = useState(null)
  const [savedConcepts, setSavedConcepts] = useState([])

  useEffect(() => {
    // Load saved concepts from localStorage
    const saved = localStorage.getItem('savedMemoryPalaces')
    if (saved) {
      setSavedConcepts(JSON.parse(saved))
    }
  }, [])

  const conceptTypes = [
    { id: 'general', label: 'General Concept', icon: '🧠' },
    { id: 'list', label: 'List/Sequence', icon: '📝' },
    { id: 'formula', label: 'Formula/Equation', icon: '🧮' },
    { id: 'dates', label: 'Historical Dates', icon: '📅' },
    { id: 'vocabulary', label: 'Vocabulary/Terms', icon: '📚' },
    { id: 'process', label: 'Process/Cycle', icon: '🔄' }
  ]

  const difficultyLevels = [
    { id: 'easy', label: 'Simple', description: 'Basic mnemonic', color: 'text-green-600' },
    { id: 'medium', label: 'Creative', description: 'Story-based memory aid', color: 'text-yellow-600' },
    { id: 'hard', label: 'Advanced', description: 'Complex memory palace', color: 'text-red-600' }
  ]

  const sampleConcepts = {
    general: "Photosynthesis process",
    list: "Order of planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune",
    formula: "Quadratic formula: x = (-b ± √(b²-4ac)) / 2a",
    dates: "World War II: 1939-1945",
    vocabulary: "Mitochondria - the powerhouse of the cell",
    process: "Krebs Cycle steps in cellular respiration"
  }

  const generateMnemonic = async () => {
    if (!userConcept.trim()) {
      toast.error('Please enter a concept to memorize')
      return
    }

    setIsLoading(true)
    setGameState('generating')

    try {
      const response = await fetch('/api/games/memory-palace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept: userConcept,
          type: conceptType,
          difficulty: difficulty
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedMnemonic(data.mnemonic)
        setGameState('result')
        
        // Award XP for generating a memory aid
        await awardXPForMemoryPalace()
      } else {
        throw new Error('Failed to generate memory aid')
      }
    } catch (error) {
      console.error('Error generating memory aid:', error)
      // Fallback to sample mnemonic
      generateFallbackMnemonic()
    } finally {
      setIsLoading(false)
    }
  }

  const generateFallbackMnemonic = () => {
    const fallbackMnemonics = {
      "order of planets": {
        title: "Planet Order Memory Palace",
        technique: "Acronym + Visual Story",
        mnemonic: "My Very Educated Mother Just Served Us Nachos",
        story: "Imagine walking through your house: In the **Kitchen** (Mercury - closest to heat), your **Mother** is **Very** busy. In the **Living Room** (Venus - beautiful like a living space), she's **Educated** and reading. The **Dining Room** (Earth - where we eat) is where **Mother** serves meals. The **Garage** (Mars - red like rust) is where **Just** tools are stored. The **Basement** (Jupiter - large like a basement) **Served** as storage. **Upstairs** (Saturn - with rings like upper floors), **Us** kids played. The **Attic** (Uranus - tilted like a slanted roof) had **Nachos** stored away. And the **Roof** (Neptune - furthest out) was where we'd stargaze.",
        visualization: "Walk through each room in order, seeing the planets as objects in each space.",
        tips: [
          "Start at the front door and walk through systematically",
          "Associate each planet's characteristics with room features",
          "Practice the journey 3 times to solidify the memory"
        ]
      },
      "photosynthesis": {
        title: "Photosynthesis Memory Palace",
        technique: "Story-based Visualization",
        mnemonic: "Plants Lose Water, Gain Sugar",
        story: "Imagine a **Plant Café**: The **Sun** (sunlight) is the café's energy source powering everything. **Waiters** (chlorophyll) in green uniforms work the room. **Customers** (CO₂) enter through **Air Vents** (stomata). The **Kitchen** (chloroplasts) combines **Water** (from underground pipes) with **Air** (CO₂) using **Solar Power** (sunlight). The result? **Sweet Sugar** (glucose) served to customers, while **Fresh Oxygen** is released through the **Exhaust System** (stomata).",
        visualization: "See yourself as the café manager overseeing this process",
        tips: [
          "Remember: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
          "The green uniforms (chlorophyll) are key to the process",
          "Think of it as a restaurant that serves sugar and fresh air"
        ]
      }
    }

    const concept = userConcept.toLowerCase()
    let selectedMnemonic = fallbackMnemonics["photosynthesis"] // default

    if (concept.includes("planet")) {
      selectedMnemonic = fallbackMnemonics["order of planets"]
    } else if (concept.includes("photosynthesis")) {
      selectedMnemonic = fallbackMnemonics["photosynthesis"]
    }

    setGeneratedMnemonic(selectedMnemonic)
    setGameState('result')
  }

  const awardXPForMemoryPalace = async () => {
    try {
      const response = await fetch('/api/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'memory_palace',
          data: {
            concept: userConcept,
            type: conceptType,
            difficulty: difficulty
          }
        })
      })

      if (response.ok) {
        const xpData = await response.json()
        
        // Update navbar XP
        if (typeof window !== 'undefined' && window.updateNavbarXP) {
          window.updateNavbarXP(xpData.totalXP, xpData.currentStreak)
        }
        
        // Show XP notification
        toast.success(`🧠 Memory palace created! +${xpData.xpAwarded} XP earned!`, {
          description: `Concept: ${userConcept}`,
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error awarding XP for memory palace:', error)
    }
  }

  const saveConcept = () => {
    if (!generatedMnemonic) return

    const newConcept = {
      id: Date.now(),
      concept: userConcept,
      type: conceptType,
      difficulty: difficulty,
      mnemonic: generatedMnemonic,
      createdAt: new Date().toISOString()
    }

    const updated = [...savedConcepts, newConcept]
    setSavedConcepts(updated)
    localStorage.setItem('savedMemoryPalaces', JSON.stringify(updated))
    
    setGameState('saved')
    toast.success('Memory palace saved!', {
      description: 'You can review it anytime in your saved concepts',
    })

    // Award additional XP for saving
    awardSaveXP()
  }

  const awardSaveXP = async () => {
    try {
      const response = await fetch('/api/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'concept_saved',
          data: {
            concept: userConcept,
            action: 'save_memory_palace'
          }
        })
      })

      if (response.ok) {
        const xpData = await response.json()
        
        // Update navbar XP
        if (typeof window !== 'undefined' && window.updateNavbarXP) {
          window.updateNavbarXP(xpData.totalXP, xpData.currentStreak)
        }
        
        // Show XP notification
        toast.success(`💾 Concept saved! +${xpData.xpAwarded} XP bonus!`, {
          description: 'Building your knowledge library',
          duration: 2000,
        })
      }
    } catch (error) {
      console.error('Error awarding save XP:', error)
    }
  }

  const copyToClipboard = () => {
    if (!generatedMnemonic) return
    
    const text = `Memory Palace: ${generatedMnemonic.title}\n\nConcept: ${userConcept}\n\nMnemonic: ${generatedMnemonic.mnemonic}\n\nStory: ${generatedMnemonic.story}`
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!', {
        description: 'You can paste this anywhere to review later',
      })
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  const resetGame = () => {
    setGameState('input')
    setUserConcept('')
    setGeneratedMnemonic(null)
  }

  // Input State
  if (gameState === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Link href="/games">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-purple-500/10">
                <Brain className="h-12 w-12 text-purple-500" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">AI Memory Palace Builder</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transform any concept into an unforgettable memory aid
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Concept Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  What do you want to memorize?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={userConcept}
                  onChange={(e) => setUserConcept(e.target.value)}
                  placeholder="Enter the concept, list, formula, or information you're struggling to remember..."
                  className="min-h-20"
                />
                
                <div className="text-sm text-muted-foreground">
                  <strong>Examples:</strong> {sampleConcepts[conceptType]}
                </div>
              </CardContent>
            </Card>

            {/* Concept Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>What type of concept is this?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {conceptTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={conceptType === type.id ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => setConceptType(type.id)}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose your memory technique complexity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {difficultyLevels.map((level) => (
                    <Button
                      key={level.id}
                      variant={difficulty === level.id ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-start space-y-2"
                      onClick={() => setDifficulty(level.id)}
                    >
                      <span className={`font-bold ${level.color}`}>{level.label}</span>
                      <span className="text-sm text-muted-foreground">{level.description}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={generateMnemonic} 
                  disabled={!userConcept.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {isLoading ? 'Building Your Memory Palace...' : 'Create Memory Palace'}
                </Button>
              </CardContent>
            </Card>

            {/* Saved Concepts Preview */}
            {savedConcepts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Your Saved Memory Palaces ({savedConcepts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedConcepts.slice(-4).map((saved) => (
                      <div key={saved.id} className="p-3 bg-muted rounded-lg">
                        <p className="font-medium text-sm">{saved.concept}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {conceptTypes.find(t => t.id === saved.type)?.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {saved.difficulty}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Generating State
  if (gameState === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 rounded-full bg-purple-500/10 animate-pulse">
                <Brain className="h-12 w-12 text-purple-500 animate-spin" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Building Your Memory Palace...</h2>
            <p className="text-muted-foreground mb-8">
              AI is crafting the perfect memory aid for &quot;{userConcept}&quot;
            </p>
            
            <div className="space-y-4">
              <div className="animate-pulse bg-muted h-4 rounded"></div>
              <div className="animate-pulse bg-muted h-4 rounded w-3/4 mx-auto"></div>
              <div className="animate-pulse bg-muted h-4 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Result State
  if (gameState === 'result' && generatedMnemonic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={resetGame} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Create Another
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-green-500/10">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">Your Memory Palace is Ready!</h2>
              <p className="text-muted-foreground">Here&apos;s your personalized memory aid for: <strong>{userConcept}</strong></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Memory Aid */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-500" />
                      {generatedMnemonic.title}
                    </CardTitle>
                    <Badge variant="outline">{generatedMnemonic.technique}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <h4 className="font-bold text-lg mb-2">🧠 Memory Trigger:</h4>
                      <p className="text-lg font-medium text-purple-700">{generatedMnemonic.mnemonic}</p>
                    </div>

                    <div>
                      <h4 className="font-bold mb-2">📖 Memory Story:</h4>
                      <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: generatedMnemonic.story.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>

                    <div>
                      <h4 className="font-bold mb-2">👁️ Visualization:</h4>
                      <p className="text-muted-foreground italic">{generatedMnemonic.visualization}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                {generatedMnemonic.tips && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        Memory Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {generatedMnemonic.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            <span className="text-sm">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Actions Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Save & Share</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={saveConcept} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Memory Palace
                    </Button>
                    
                    <Button onClick={copyToClipboard} variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    
                    <Button onClick={resetGame} variant="outline" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Create Another
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Study Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Review today:</span>
                      <Badge variant="secondary">✓</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Review in 3 days:</span>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Review in 1 week:</span>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Follow this schedule for optimal retention
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  // Saved State
  if (gameState === 'saved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-background dark:via-background dark:to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Memory Palace Saved! 🏰</h2>
            <p className="text-muted-foreground mb-8">
              Your memory aid for &quot;{userConcept}&quot; has been added to your collection
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} className="px-8">
                <Brain className="h-4 w-4 mr-2" />
                Create Another Palace
              </Button>
              
              <Link href="/games">
                <Button variant="outline" className="px-8">
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

  return null
}