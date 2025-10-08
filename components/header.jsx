"use client"

import Link from "next/link"
import { AuthButton } from "@/components/auth-button"
import { ModeToggle } from "@/components/mode-toggle"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Zap, Flame } from "lucide-react"

export function Header() {
  const { data: session } = useSession()
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchUserStats()
      updateDailyStreak() // Update streak on login/session start
    }
  }, [session])

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/xp')
      if (response.ok) {
        const data = await response.json()
        setUserStats({
          xp: data.user?.xp || 0,
          streak: data.user?.streak || 0
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDailyStreak = async () => {
    try {
      const response = await fetch('/api/streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.streakUpdated) {
          setUserStats(prev => ({
            ...prev,
            streak: data.newStreak
          }))
          
          // Show streak update notification (optional)
          if (typeof window !== 'undefined' && window.showToast) {
            window.showToast(data.message || `Streak updated! ${data.newStreak} days`, 'success')
          }
        }
      }
    } catch (error) {
      console.error('Error updating daily streak:', error)
    }
  }

  // Function to update XP in real-time (can be called from other components)
  const updateXP = (newXP, newStreak) => {
    setUserStats({ xp: newXP, streak: newStreak })
  }

  // Make updateXP available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.updateNavbarXP = updateXP
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-lg sm:text-xl font-bold hover:text-primary transition-colors">
            PrepLoot
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/games" className="text-sm font-medium hover:text-primary transition-colors">
              Games
            </Link>
            <Link href="/progress" className="text-sm font-medium hover:text-primary transition-colors">
              Progress
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
              Leaderboard
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* XP Display */}
          {session?.user && (
            <div className="hidden sm:flex items-center space-x-3">
              <Badge variant="outline" className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all">
                <Zap className="h-3 w-3 text-purple-600" />
                <span className="text-purple-700 font-semibold">{loading ? '...' : userStats.xp} XP</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all">
                <Flame className="h-3 w-3 text-orange-600" />
                <span className="text-orange-700 font-semibold">{loading ? '...' : userStats.streak}</span>
              </Badge>
            </div>
          )}
          <ModeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}