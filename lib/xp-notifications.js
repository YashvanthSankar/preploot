import { toast } from 'sonner'

export class XPNotificationManager {
  static updateNavbarXP(totalXP, streak) {
    if (typeof window !== 'undefined' && window.updateNavbarXP) {
      window.updateNavbarXP(totalXP, streak)
    }
  }

  static showXPNotification(xpData, customMessage = null, customDescription = null) {
    // Update navbar first
    this.updateNavbarXP(
      xpData.totalXP || xpData.user?.xp, 
      xpData.currentStreak || xpData.user?.streak
    )

    // Show primary notification
    const message = customMessage || `🎉 +${xpData.xpAwarded} XP earned!`
    const description = customDescription || this.getXPDescription(xpData)
    
    toast.success(message, {
      description: description,
      duration: 4000,
    })

    // Show activity log details
    if (xpData.activityLog?.length > 0) {
      xpData.activityLog.forEach((log, index) => {
        setTimeout(() => {
          toast.info(log, { duration: 3000 })
        }, (index + 1) * 1000)
      })
    }

    // Show streak bonus if applicable
    if (xpData.streakBonus > 0) {
      setTimeout(() => {
        toast.info(`🔥 Streak bonus: +${xpData.streakBonus} XP`, { duration: 3000 })
      }, 2000)
    }
  }

  static getXPDescription(xpData) {
    if (xpData.type === 'quiz_completion') {
      return `Quiz completed with ${xpData.correctAnswers || 0}/${xpData.totalQuestions || 0} correct`
    } else if (xpData.type === 'taboo_game') {
      return `Taboo game: ${xpData.accuracy || 0}% accuracy`
    } else if (xpData.type === 'daily_checkin') {
      return `Daily streak: ${xpData.currentStreak || 0} days`
    }
    return 'Great job!'
  }

  static showLevelUpNotification(newLevel) {
    setTimeout(() => {
      toast.success(`🎊 Level Up! You're now level ${newLevel}!`, {
        description: 'Keep learning to unlock more achievements!',
        duration: 5000,
      })
    }, 2500)
  }

  static async awardXP(type, data, customNotification = null) {
    try {
      const response = await fetch('/api/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type,
          data: data
        })
      })

      if (response.ok) {
        const xpData = await response.json()
        
        // Show custom notification or default
        if (customNotification) {
          this.showXPNotification(xpData, customNotification.message, customNotification.description)
        } else {
          this.showXPNotification(xpData)
        }

        // Check for level up
        if (xpData.leveledUp) {
          this.showLevelUpNotification(xpData.newLevel)
        }

        return xpData
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to award XP')
        return null
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
      toast.error('Failed to update XP')
      return null
    }
  }
}