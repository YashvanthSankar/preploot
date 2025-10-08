"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Calendar, Flame, Zap } from 'lucide-react'
import { toast } from 'sonner'

export function DailyCheckin() {
  const { data: session } = useSession()
  const [canCheckIn, setCanCheckIn] = useState(false)
  const [userStats, setUserStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasCheckedIn, setHasCheckedIn] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchUserStats()
    }
  }, [session])

  const fetchUserStats = async () => {
    try {
      const [xpResponse, streakResponse] = await Promise.all([
        fetch('/api/xp'),
        fetch('/api/streak')
      ])
      
      if (xpResponse.ok) {
        const xpData = await xpResponse.json()
        setUserStats(xpData.user)
      }
      
      if (streakResponse.ok) {
        const streakData = await streakResponse.json()
        setCanCheckIn(streakData.canUpdateStreak)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleCheckIn = async () => {
    if (!session?.user || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'daily_checkin',
          data: {}
        })
      })

      const data = await response.json()

      if (response.ok) {
        setHasCheckedIn(true)
        setCanCheckIn(false)
        setUserStats(data.user)
        
        // Update navbar XP display in real-time
        if (typeof window !== 'undefined' && window.updateNavbarXP) {
          window.updateNavbarXP(data.totalXP || data.user?.xp, data.currentStreak || data.user?.streak)
        }
        
        // Show success toast with XP details
        toast.success(data.message, {
          description: `+${data.xpAwarded} XP earned! ${data.streakBonus > 0 ? `Streak bonus: +${data.streakBonus} XP` : ''}`,
          duration: 4000,
        })
        
        // Show activity log details
        data.activityLog?.forEach((log, index) => {
          setTimeout(() => {
            toast.info(log, { duration: 3000 })
          }, (index + 1) * 1000)
        })
      } else {
        toast.error(data.error || 'Failed to check in')
      }
    } catch (error) {
      console.error('Error checking in:', error)
      toast.error('Failed to check in')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Check-in
        </CardTitle>
        <CardDescription>
          Earn XP and maintain your learning streak!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userStats && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold">{userStats.xp}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{userStats.streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        )}

        {hasCheckedIn ? (
          <div className="text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <Badge variant="success" className="bg-green-100 text-green-800">
              ✅ Checked in today!
            </Badge>
            <p className="text-sm text-muted-foreground">
              Come back tomorrow for more XP!
            </p>
          </div>
        ) : canCheckIn ? (
          <Button 
            onClick={handleCheckIn} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? 'Checking in...' : '🎉 Check In (+10 XP)'}
          </Button>
        ) : (
          <div className="text-center space-y-2">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <Badge variant="secondary">
              Already checked in today
            </Badge>
            <p className="text-sm text-muted-foreground">
              Come back tomorrow for more XP!
            </p>
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground">
          <p>Daily check-in: +10 XP</p>
          <p>Streak bonus: +2 XP per day (max +20 XP)</p>
        </div>
      </CardContent>
    </Card>
  )
}