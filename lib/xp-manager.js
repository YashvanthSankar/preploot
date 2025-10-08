// XP Management System
export const XP_REWARDS = {
  DAILY_CHECKIN: 10,
  TABOO_GAME_WIN: 15,
  TABOO_GAME_PARTICIPATION: 5,
  QUIZ_COMPLETION: 20,
  QUIZ_PERFECT_SCORE: 50,
  QUIZ_HIGH_SCORE: 30, // 80%+ score
  QUIZ_MEDIUM_SCORE: 20, // 60-79% score
  QUIZ_LOW_SCORE: 10, // 40-59% score
  VIDEO_COMPLETION: 5,
  STREAK_BONUS_MULTIPLIER: 1.5, // Extra 50% XP for maintaining streaks
}

export const ACHIEVEMENT_THRESHOLDS = {
  TABOO_MASTER: 50, // Win 50 taboo games
  QUIZ_CHAMPION: 100, // Complete 100 quizzes
  LEARNING_STREAK: 7, // 7-day learning streak
  KNOWLEDGE_SEEKER: 1000, // Earn 1000 XP
}

export class XPManager {
  static calculateQuizXP(score, totalQuestions) {
    const percentage = (score / totalQuestions) * 100;
    
    let baseXP = XP_REWARDS.QUIZ_COMPLETION;
    
    if (percentage === 100) {
      baseXP = XP_REWARDS.QUIZ_PERFECT_SCORE;
    } else if (percentage >= 80) {
      baseXP = XP_REWARDS.QUIZ_HIGH_SCORE;
    } else if (percentage >= 60) {
      baseXP = XP_REWARDS.QUIZ_MEDIUM_SCORE;
    } else if (percentage >= 40) {
      baseXP = XP_REWARDS.QUIZ_LOW_SCORE;
    } else {
      baseXP = 5; // Consolation XP for effort
    }
    
    return {
      baseXP,
      percentage,
      bonusXP: 0 // Can be used for streak bonuses
    };
  }
  
  static calculateStreakBonus(currentStreak, baseXP) {
    if (currentStreak >= 7) {
      return Math.floor(baseXP * (XP_REWARDS.STREAK_BONUS_MULTIPLIER - 1));
    }
    return 0;
  }
  
  static async updateUserXP(userId, xpGained, reason, additionalData = {}) {
    try {
      const response = await fetch('/api/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          xpGained,
          reason,
          ...additionalData
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update XP');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating XP:', error);
      throw error;
    }
  }
  
  static async checkDailyCheckin(userId) {
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process daily check-in');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error with daily check-in:', error);
      throw error;
    }
  }
  
  static getXPMessage(xpGained, reason) {
    const messages = {
      'daily_checkin': `🎉 Daily Check-in Bonus! +${xpGained} XP`,
      'taboo_win': `🏆 Taboo Victory! +${xpGained} XP`,
      'taboo_participation': `👏 Good effort! +${xpGained} XP`,
      'quiz_perfect': `🌟 Perfect Score! +${xpGained} XP`,
      'quiz_high': `💯 Excellent! +${xpGained} XP`,
      'quiz_medium': `✅ Well done! +${xpGained} XP`,
      'quiz_low': `📚 Keep learning! +${xpGained} XP`,
      'quiz_completion': `🎯 Quiz completed! +${xpGained} XP`,
      'video_completion': `📺 Video watched! +${xpGained} XP`,
      'streak_bonus': `🔥 Streak bonus! +${xpGained} XP`,
    };
    
    return messages[reason] || `+${xpGained} XP earned!`;
  }
}