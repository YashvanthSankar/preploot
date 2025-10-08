'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Zap, 
  Trophy, 
  Star, 
  Lock, 
  CheckCircle,
  Skull,
  Sword,
  Shield,
  Target,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'

// Game map data structure
const examMaps = {
  JEE: {
    name: 'JEE Journey',
    subjects: {
      Physics: {
        name: 'Physics Realm',
        color: 'from-blue-500 to-purple-600',
        icon: '⚡',
        topics: [
          {
            id: 'mechanics',
            name: 'Mechanics',
            position: { x: 15, y: 70 },
            difficulty: 'easy',
            subtopics: [
              { id: 'kinematics', name: 'Kinematics', unlocked: true },
              { id: 'dynamics', name: 'Dynamics', unlocked: false },
              { id: 'work-energy', name: 'Work & Energy', unlocked: false },
              { id: 'rotational', name: 'Rotational Motion', unlocked: false }
            ]
          },
          {
            id: 'thermodynamics',
            name: 'Thermodynamics',
            position: { x: 35, y: 50 },
            difficulty: 'medium',
            subtopics: [
              { id: 'laws-thermo', name: 'Laws of Thermodynamics', unlocked: false },
              { id: 'heat-engines', name: 'Heat Engines', unlocked: false },
              { id: 'kinetic-theory', name: 'Kinetic Theory', unlocked: false }
            ]
          },
          {
            id: 'electromagnetism',
            name: 'Electromagnetism',
            position: { x: 60, y: 30 },
            difficulty: 'hard',
            subtopics: [
              { id: 'electrostatics', name: 'Electrostatics', unlocked: false },
              { id: 'current-electricity', name: 'Current Electricity', unlocked: false },
              { id: 'magnetic-effects', name: 'Magnetic Effects', unlocked: false },
              { id: 'electromagnetic-induction', name: 'EM Induction', unlocked: false }
            ]
          },
          {
            id: 'optics',
            name: 'Optics',
            position: { x: 80, y: 60 },
            difficulty: 'medium',
            subtopics: [
              { id: 'ray-optics', name: 'Ray Optics', unlocked: false },
              { id: 'wave-optics', name: 'Wave Optics', unlocked: false }
            ]
          },
          {
            id: 'physics-boss',
            name: 'Physics Master',
            position: { x: 90, y: 40 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      },
      Chemistry: {
        name: 'Chemistry Kingdom',
        color: 'from-green-500 to-teal-600',
        icon: '🧪',
        topics: [
          {
            id: 'physical-chemistry',
            name: 'Physical Chemistry',
            position: { x: 20, y: 60 },
            difficulty: 'easy',
            subtopics: [
              { id: 'atomic-structure', name: 'Atomic Structure', unlocked: true },
              { id: 'chemical-bonding', name: 'Chemical Bonding', unlocked: false },
              { id: 'states-of-matter', name: 'States of Matter', unlocked: false }
            ]
          },
          {
            id: 'organic-chemistry',
            name: 'Organic Chemistry',
            position: { x: 50, y: 40 },
            difficulty: 'hard',
            subtopics: [
              { id: 'hydrocarbons', name: 'Hydrocarbons', unlocked: false },
              { id: 'functional-groups', name: 'Functional Groups', unlocked: false },
              { id: 'biomolecules', name: 'Biomolecules', unlocked: false }
            ]
          },
          {
            id: 'inorganic-chemistry',
            name: 'Inorganic Chemistry',
            position: { x: 75, y: 70 },
            difficulty: 'medium',
            subtopics: [
              { id: 'periodic-table', name: 'Periodic Table', unlocked: false },
              { id: 'coordination-compounds', name: 'Coordination Compounds', unlocked: false }
            ]
          },
          {
            id: 'chemistry-boss',
            name: 'Chemistry Sage',
            position: { x: 85, y: 30 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      },
      Mathematics: {
        name: 'Mathematics Empire',
        color: 'from-red-500 to-pink-600',
        icon: '📐',
        topics: [
          {
            id: 'algebra',
            name: 'Algebra',
            position: { x: 25, y: 75 },
            difficulty: 'easy',
            subtopics: [
              { id: 'complex-numbers', name: 'Complex Numbers', unlocked: true },
              { id: 'quadratic-equations', name: 'Quadratic Equations', unlocked: false },
              { id: 'sequences-series', name: 'Sequences & Series', unlocked: false }
            ]
          },
          {
            id: 'calculus',
            name: 'Calculus',
            position: { x: 55, y: 50 },
            difficulty: 'hard',
            subtopics: [
              { id: 'limits', name: 'Limits', unlocked: false },
              { id: 'derivatives', name: 'Derivatives', unlocked: false },
              { id: 'integrals', name: 'Integrals', unlocked: false }
            ]
          },
          {
            id: 'coordinate-geometry',
            name: 'Coordinate Geometry',
            position: { x: 70, y: 80 },
            difficulty: 'medium',
            subtopics: [
              { id: 'straight-lines', name: 'Straight Lines', unlocked: false },
              { id: 'circles', name: 'Circles', unlocked: false },
              { id: 'conic-sections', name: 'Conic Sections', unlocked: false }
            ]
          },
          {
            id: 'math-boss',
            name: 'Math Wizard',
            position: { x: 90, y: 25 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      }
    }
  },
  NEET: {
    name: 'NEET Adventure',
    subjects: {
      Physics: {
        name: 'Physics Domain',
        color: 'from-indigo-500 to-blue-600',
        icon: '⚛️',
        topics: [
          {
            id: 'mechanics-neet',
            name: 'Mechanics',
            position: { x: 20, y: 65 },
            difficulty: 'easy',
            subtopics: [
              { id: 'motion', name: 'Motion in One Dimension', unlocked: true },
              { id: 'forces', name: 'Laws of Motion', unlocked: false },
              { id: 'gravitation', name: 'Gravitation', unlocked: false }
            ]
          },
          {
            id: 'waves-neet',
            name: 'Waves & Oscillations',
            position: { x: 45, y: 45 },
            difficulty: 'medium',
            subtopics: [
              { id: 'shm', name: 'Simple Harmonic Motion', unlocked: false },
              { id: 'wave-motion', name: 'Wave Motion', unlocked: false },
              { id: 'sound', name: 'Sound', unlocked: false }
            ]
          },
          {
            id: 'modern-physics',
            name: 'Modern Physics',
            position: { x: 75, y: 35 },
            difficulty: 'hard',
            subtopics: [
              { id: 'atomic-physics', name: 'Atomic Physics', unlocked: false },
              { id: 'nuclear-physics', name: 'Nuclear Physics', unlocked: false }
            ]
          },
          {
            id: 'physics-boss-neet',
            name: 'Physics Guardian',
            position: { x: 85, y: 55 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      },
      Chemistry: {
        name: 'Chemistry Realm',
        color: 'from-emerald-500 to-green-600',
        icon: '⚗️',
        topics: [
          {
            id: 'general-chemistry',
            name: 'General Chemistry',
            position: { x: 15, y: 80 },
            difficulty: 'easy',
            subtopics: [
              { id: 'basic-concepts', name: 'Basic Concepts', unlocked: true },
              { id: 'stoichiometry', name: 'Stoichiometry', unlocked: false }
            ]
          },
          {
            id: 'organic-neet',
            name: 'Organic Chemistry',
            position: { x: 40, y: 60 },
            difficulty: 'medium',
            subtopics: [
              { id: 'hydrocarbons-neet', name: 'Hydrocarbons', unlocked: false },
              { id: 'alcohols-phenols', name: 'Alcohols & Phenols', unlocked: false }
            ]
          },
          {
            id: 'chemistry-boss-neet',
            name: 'Chemistry Lord',
            position: { x: 80, y: 45 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      },
      Biology: {
        name: 'Biology Universe',
        color: 'from-lime-500 to-green-600',
        icon: '🧬',
        topics: [
          {
            id: 'cell-biology',
            name: 'Cell Biology',
            position: { x: 10, y: 70 },
            difficulty: 'easy',
            subtopics: [
              { id: 'cell-structure', name: 'Cell Structure', unlocked: true },
              { id: 'cell-division', name: 'Cell Division', unlocked: false },
              { id: 'biomolecules-bio', name: 'Biomolecules', unlocked: false }
            ]
          },
          {
            id: 'genetics',
            name: 'Genetics',
            position: { x: 40, y: 50 },
            difficulty: 'medium',
            subtopics: [
              { id: 'mendelian-genetics', name: 'Mendelian Genetics', unlocked: false },
              { id: 'molecular-genetics', name: 'Molecular Genetics', unlocked: false }
            ]
          },
          {
            id: 'ecology',
            name: 'Ecology',
            position: { x: 65, y: 70 },
            difficulty: 'medium',
            subtopics: [
              { id: 'ecosystem', name: 'Ecosystem', unlocked: false },
              { id: 'biodiversity', name: 'Biodiversity', unlocked: false }
            ]
          },
          {
            id: 'human-physiology',
            name: 'Human Physiology',
            position: { x: 60, y: 30 },
            difficulty: 'hard',
            subtopics: [
              { id: 'nervous-system', name: 'Nervous System', unlocked: false },
              { id: 'circulatory-system', name: 'Circulatory System', unlocked: false }
            ]
          },
          {
            id: 'biology-boss',
            name: 'Bio Master',
            position: { x: 90, y: 50 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      }
    }
  },
  CBSE: {
    name: 'CBSE Quest',
    subjects: {
      Physics: {
        name: 'Physics Adventure',
        color: 'from-cyan-500 to-blue-600',
        icon: '🔬',
        topics: [
          {
            id: 'basic-physics',
            name: 'Basic Physics',
            position: { x: 20, y: 60 },
            difficulty: 'easy',
            subtopics: [
              { id: 'units-measurements', name: 'Units & Measurements', unlocked: true },
              { id: 'motion-cbse', name: 'Motion', unlocked: false }
            ]
          },
          {
            id: 'electricity-cbse',
            name: 'Electricity',
            position: { x: 50, y: 40 },
            difficulty: 'medium',
            subtopics: [
              { id: 'current-effects', name: 'Electric Current', unlocked: false },
              { id: 'magnetic-effects-cbse', name: 'Magnetic Effects', unlocked: false }
            ]
          },
          {
            id: 'physics-boss-cbse',
            name: 'Physics Chief',
            position: { x: 80, y: 60 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      },
      Chemistry: {
        name: 'Chemistry Quest',
        color: 'from-orange-500 to-red-600',
        icon: '🔬',
        topics: [
          {
            id: 'basic-chemistry-cbse',
            name: 'Basic Chemistry',
            position: { x: 25, y: 70 },
            difficulty: 'easy',
            subtopics: [
              { id: 'matter-cbse', name: 'Matter in Our Surroundings', unlocked: true },
              { id: 'atoms-molecules', name: 'Atoms and Molecules', unlocked: false }
            ]
          },
          {
            id: 'chemistry-boss-cbse',
            name: 'Chemistry Master',
            position: { x: 75, y: 50 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      },
      Mathematics: {
        name: 'Math Kingdom',
        color: 'from-purple-500 to-pink-600',
        icon: '🔢',
        topics: [
          {
            id: 'algebra-cbse',
            name: 'Algebra',
            position: { x: 30, y: 65 },
            difficulty: 'easy',
            subtopics: [
              { id: 'polynomials', name: 'Polynomials', unlocked: true },
              { id: 'linear-equations', name: 'Linear Equations', unlocked: false }
            ]
          },
          {
            id: 'geometry-cbse',
            name: 'Geometry',
            position: { x: 60, y: 45 },
            difficulty: 'medium',
            subtopics: [
              { id: 'triangles', name: 'Triangles', unlocked: false },
              { id: 'circles-cbse', name: 'Circles', unlocked: false }
            ]
          },
          {
            id: 'math-boss-cbse',
            name: 'Math Emperor',
            position: { x: 85, y: 35 },
            difficulty: 'boss',
            isBoss: true,
            unlocked: false
          }
        ]
      }
    }
  }
}

export default function GameMapPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const selectedExam = searchParams.get('exam') || 'JEE'
  const selectedSubject = searchParams.get('subject') || 'Physics'
  
  const [userProgress, setUserProgress] = useState({})
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchUserProgress()
    }
  }, [session, selectedExam, selectedSubject])

  const fetchUserProgress = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/progress?exam=${selectedExam}&subject=${selectedSubject}`)
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data.progress || {})
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <Star className="h-4 w-4 text-green-500" />
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />
      case 'hard': return <Sword className="h-4 w-4 text-red-500" />
      case 'boss': return <Crown className="h-4 w-4 text-purple-500" />
      default: return <Star className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500 border-green-600'
      case 'medium': return 'bg-yellow-500 border-yellow-600'
      case 'hard': return 'bg-red-500 border-red-600'
      case 'boss': return 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-700'
      default: return 'bg-gray-500 border-gray-600'
    }
  }

  const currentMap = examMaps[selectedExam]
  const currentSubject = currentMap?.subjects[selectedSubject]

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-muted-foreground">Please login to access the game map</p>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white">{currentMap?.name}</h1>
            <Badge variant="outline" className="text-white border-white/30">
              {selectedExam}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={selectedExam} 
              onChange={(e) => window.location.href = `/map?exam=${e.target.value}&subject=Physics`}
              className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white"
            >
              <option value="JEE">JEE</option>
              <option value="NEET">NEET</option>
              <option value="CBSE">CBSE</option>
            </select>
            
            <select 
              value={selectedSubject} 
              onChange={(e) => window.location.href = `/map?exam=${selectedExam}&subject=${e.target.value}`}
              className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white"
            >
              {Object.keys(currentMap?.subjects || {}).map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Game Map */}
      <div className="relative min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full h-96 lg:h-[600px] bg-gradient-to-br from-green-400/20 via-blue-500/20 to-purple-600/20 rounded-2xl border border-white/10 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
            </div>

            {/* Subject Header */}
            <div className="absolute top-4 left-4 z-10">
              <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${currentSubject?.color} text-white font-bold text-xl shadow-lg`}>
                <span className="mr-2">{currentSubject?.icon}</span>
                {currentSubject?.name}
              </div>
            </div>

            {/* Map Nodes */}
            {currentSubject?.topics.map((topic, index) => {
              const isUnlocked = topic.unlocked || index === 0
              const isCompleted = userProgress[topic.id]?.completed || false
              
              return (
                <div
                  key={topic.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ 
                    left: `${topic.position.x}%`, 
                    top: `${topic.position.y}%` 
                  }}
                  onClick={() => isUnlocked && setSelectedTopic(topic)}
                >
                  {/* Connection Lines */}
                  {index > 0 && (
                    <div className="absolute w-16 h-0.5 bg-white/30 -left-16 top-1/2 transform -translate-y-1/2 rotate-12"></div>
                  )}
                  
                  {/* Node */}
                  <div className={`
                    relative w-20 h-20 rounded-full border-4 transition-all duration-300
                    ${isUnlocked ? getDifficultyColor(topic.difficulty) : 'bg-gray-700 border-gray-600'}
                    ${isCompleted ? 'ring-4 ring-green-400' : ''}
                    ${!isUnlocked ? 'opacity-50' : 'hover:scale-110 shadow-2xl'}
                    ${topic.isBoss ? 'w-24 h-24 animate-pulse' : ''}
                  `}>
                    {/* Node Icon */}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      {!isUnlocked ? (
                        <Lock className="h-8 w-8" />
                      ) : isCompleted ? (
                        <CheckCircle className="h-8 w-8 text-green-300" />
                      ) : topic.isBoss ? (
                        <Skull className="h-10 w-10 text-purple-200" />
                      ) : (
                        getDifficultyIcon(topic.difficulty)
                      )}
                    </div>
                    
                    {/* Completion Stars */}
                    {isCompleted && !topic.isBoss && (
                      <div className="absolute -top-2 -right-2 flex">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                    )}
                    
                    {/* Boss Crown */}
                    {topic.isBoss && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Crown className="h-6 w-6 text-yellow-400 fill-current" />
                      </div>
                    )}
                  </div>
                  
                  {/* Topic Name */}
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className={`
                      px-3 py-1 rounded-lg text-sm font-medium shadow-lg
                      ${topic.isBoss ? 'bg-purple-600 text-white' : 'bg-black/70 text-white'}
                    `}>
                      {topic.isBoss && <Crown className="inline h-3 w-3 mr-1" />}
                      {topic.name}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {selectedTopic.isBoss ? (
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <div className={`p-3 rounded-full ${getDifficultyColor(selectedTopic.difficulty)}`}>
                      {getDifficultyIcon(selectedTopic.difficulty)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTopic.name}</h2>
                    <Badge variant="outline" className="mt-1">
                      {selectedTopic.difficulty === 'boss' ? 'BOSS FIGHT' : selectedTopic.difficulty.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedTopic(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              {selectedTopic.isBoss ? (
                // Boss Fight UI
                <div className="space-y-6">
                  <div className="text-center p-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                    <Skull className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                    <h3 className="text-xl font-bold mb-2">Final Boss Challenge!</h3>
                    <p className="text-muted-foreground mb-4">
                      Face the ultimate test of your {selectedSubject} knowledge. 
                      Defeat this boss to unlock the next subject!
                    </p>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <Badge variant="destructive">High Difficulty</Badge>
                      <Badge variant="outline">50 Questions</Badge>
                      <Badge variant="outline">+200 XP</Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Link 
                      href={`/quiz?type=boss&subject=${selectedSubject}&exam=${selectedExam}&boss=${selectedTopic.id}`}
                      className="flex-1"
                    >
                      <Button size="lg" variant="default" className="w-full">
                        <Sword className="h-5 w-5 mr-2" />
                        Challenge Boss
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => setSelectedTopic(null)}
                    >
                      <Shield className="h-5 w-5 mr-2" />
                      Retreat
                    </Button>
                  </div>
                </div>
              ) : (
                // Regular Topic UI
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTopic.subtopics?.map((subtopic, index) => (
                      <Card key={subtopic.id} className={`p-4 transition-all duration-200 ${
                        subtopic.unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {subtopic.unlocked ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <h4 className="font-medium">{subtopic.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {index + 1} of {selectedTopic.subtopics.length}
                              </p>
                            </div>
                          </div>
                          {subtopic.unlocked && (
                            <Link href={`/quiz?topic=${subtopic.id}&subject=${selectedSubject}&exam=${selectedExam}`}>
                              <Button size="sm">
                                <Zap className="h-4 w-4 mr-1" />
                                Quiz
                              </Button>
                            </Link>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedTopic(null)}
                    >
                      Close
                    </Button>
                    <Link href={`/study?topic=${selectedTopic.id}&subject=${selectedSubject}&exam=${selectedExam}`}>
                      <Button>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}