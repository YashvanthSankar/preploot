"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Trophy, Zap, Users } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Remove automatic redirect - always show landing page first

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {session ? (
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Welcome back, {session.user?.name}! 👋
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto ">
                Ready to start your exam preparation journey?
              </p>
            </div>
            
            <div className="space-y-6">
              <Button 
                variant="default"
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                onClick={() => router.push('/dashboard/exam-selection')}
              >
                Get Started - Choose Your Exam
              </Button>
              
              <div className="text-sm text-muted-foreground">
                <p>Select your competitive exam and start preparing with AI-powered learning</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Hero Section */}
            <div className="text-center space-y-8 lg:space-y-12 max-w-7xl mx-auto">
              {/* Main Hero Content */}
              <div className="relative pt-8 pb-16">
                {/* Content */}
                <div className="relative z-10 space-y-8">
                  {/* Badge */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                    <Zap className="w-4 h-4 mr-2" />
                    AI-Powered Learning Platform
                  </div>
                  
                  {/* Main Headline */}
                  <div className="space-y-6">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                      <span className="block text-foreground">Master Every</span>
                      <span className="block text-primary font-bold">
                        Competitive Exam
                      </span>
                      <span className="block text-foreground">with PrepLoot</span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                      Transform your preparation with AI-generated quizzes from top YouTube content. 
                      <span className="block mt-2 font-medium text-foreground">
                        Built for JEE, NEET, GATE, UPSC, CAT & more
                      </span>
                    </p>
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="flex justify-center pt-4">
                    <Button variant="default" size="lg" className="text-lg px-8 py-4 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                      Start Learning Free
                      <Trophy className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">10K+</div>
                      <div className="text-sm text-muted-foreground">Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">50+</div>
                      <div className="text-sm text-muted-foreground">Exams Covered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">95%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features Section */}
            <div className="space-y-8 lg:space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Everything you need to succeed
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive tools designed to maximize your exam preparation efficiency
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-primary/20 hover:border-primary/40">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">Smart Learning</CardTitle>
                    <CardDescription className="text-base">
                      AI-powered quizzes generated from top educational videos. Learn from the best content curated for your exam.
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-orange-500/20 hover:border-orange-500/40">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-orange-500" />
                    </div>
                    <CardTitle className="text-xl font-bold">Gamification</CardTitle>
                    <CardDescription className="text-base">
                      Earn XP, unlock badges, and climb the leaderboard. Make learning competitive and engaging.
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="p-6 hover:shadow-lg transition-shadow duration-300 border-yellow-500/20 hover:border-yellow-500/40">
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-2xl flex items-center justify-center">
                      <Zap className="h-8 w-8 text-yellow-500" />
                    </div>
                    <CardTitle className="text-xl font-bold">Progress Tracking</CardTitle>
                    <CardDescription className="text-base">
                      Monitor your learning journey with detailed analytics. Track strengths and identify improvement areas.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
