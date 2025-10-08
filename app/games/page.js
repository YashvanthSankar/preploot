"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Brain, Target, Trophy, Castle, FileText, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"

export default function GamesPage() {
  const games = [
    {
      id: "ai-taboo",
      title: "AI Taboo",
      subtitle: "The Forbidden Words Challenge",
      description: "Guess the concept while avoiding forbidden words. Test your deep understanding!",
      icon: Brain,
      difficulty: "Medium",
      players: "1 Player",
      category: "Concept Learning",
      color: "bg-blue-500"
    },
    {
      id: "memory-palace",
      title: "AI Memory Palace Builder",
      subtitle: "The Mnemonist",
      description: "Transform any concept into unforgettable memory aids using AI-powered creativity!",
      icon: Castle,
      difficulty: "Variable",
      players: "1 Player",
      category: "Memory Enhancement",
      color: "bg-purple-500"
    },
    {
      id: "case-cracker",
      title: "Case Cracker",
      subtitle: "The Scenario Simulator",
      description: "Solve real-world problems using your knowledge. Bridge theory and practice with critical thinking!",
      icon: FileText,
      difficulty: "Variable",
      players: "1 Player", 
      category: "Critical Thinking",
      color: "bg-orange-500"
    },
    {
      id: "debate-bot",
      title: "Debate the Bot",
      subtitle: "The Logic Arena",
      description: "Engage in structured academic debates with AI. Develop argumentation skills and evidence-based reasoning!",
      icon: MessageSquare,
      difficulty: "Variable",
      players: "1 Player",
      category: "Argumentation",
      color: "bg-indigo-500"
    },
    {
      id: "synapse-surge",
      title: "Synapse Surge",
      subtitle: "The Concept Classifier",
      description: "Rapid-fire concept classification to boost mental agility. Think fast, classify faster!",
      icon: Zap,
      difficulty: "Variable",
      players: "1 Player",
      category: "Mental Agility",
      color: "bg-yellow-500"
    },
  
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Learning Games</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Turn your study sessions into engaging games. Learn faster, remember longer, and have fun while doing it!
          </p>
          
          {/* Map Link */}
          <div className="mt-8">
            <Link href="/map">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <Target className="h-6 w-6 mr-3" />
                🗺️ Enter Game Map
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">NEW!</span>
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Navigate through subjects, unlock topics, and face epic boss battles!
            </p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {games.map((game) => {
            const IconComponent = game.icon
            return (
              <Card key={game.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 relative overflow-hidden">
                {game.comingSoon && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                )}
                
                {/* Color accent */}
                <div className={`h-2 ${game.color}`} />
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${game.color}/10`}>
                        <IconComponent className={`h-6 w-6 text-white`} style={{color: game.color.replace('bg-', '').replace('-500', '')}} />
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {game.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-medium">
                          {game.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {game.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {game.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {game.players}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {game.category}
                    </Badge>
                  </div>
                  
                  {game.comingSoon ? (
                    <Button variant="outline" disabled className="w-full">
                      Coming Soon
                    </Button>
                  ) : (
                    <Link href={`/games/${game.id}`} className="block">
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        Play Now
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Why Learning Games Work</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">85%</div>
                  <p className="text-sm text-muted-foreground">Better retention with gamified learning</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">3x</div>
                  <p className="text-sm text-muted-foreground">Faster concept understanding</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">92%</div>
                  <p className="text-sm text-muted-foreground">Students prefer game-based learning</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">5</div>
                  <p className="text-sm text-muted-foreground">Unique AI-powered learning games</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}