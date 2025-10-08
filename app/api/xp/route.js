import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Award XP for quiz completion
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 });
    }

    let xpAwarded = 0;
    let streakBonus = 0;
    let activityLog = [];

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, streak: true, lastActiveAt: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (type) {
      case 'quiz_completion':
        // Enhanced XP calculation based on performance
        const { correctAnswers, totalQuestions, quizId, subject, exam } = data;
        const percentage = (correctAnswers / totalQuestions) * 100;
        
        if (percentage === 100) {
          xpAwarded = 50; // Perfect score bonus
          activityLog.push(`🌟 Perfect quiz! Earned ${xpAwarded} XP`);
        } else if (percentage >= 80) {
          xpAwarded = 30; // High score
          activityLog.push(`💯 Excellent! ${correctAnswers}/${totalQuestions} correct, earned ${xpAwarded} XP`);
        } else if (percentage >= 60) {
          xpAwarded = 20; // Medium score
          activityLog.push(`✅ Well done! ${correctAnswers}/${totalQuestions} correct, earned ${xpAwarded} XP`);
        } else if (percentage >= 40) {
          xpAwarded = 10; // Low score
          activityLog.push(`📚 Keep learning! ${correctAnswers}/${totalQuestions} correct, earned ${xpAwarded} XP`);
        } else {
          xpAwarded = 5; // Participation XP
          activityLog.push(`👏 Good effort! ${correctAnswers}/${totalQuestions} correct, earned ${xpAwarded} XP`);
        }

        // Record quiz attempt
        await prisma.quizAttempt.create({
          data: {
            userId: session.user.id,
            quizId: quizId || `generated-${Date.now()}`,
            score: Math.round(percentage),
            answers: data.answers || {},
            xpEarned: xpAwarded
          }
        });

        break;

      case 'taboo_game':
        // Taboo game XP
        const { gameResult, score, correctGuesses, totalCards, difficulty } = data;
        
        if (gameResult === 'correct_answer') {
          // Individual correct answer XP based on difficulty
          if (difficulty === 'Hard') {
            xpAwarded = 8; // Hard question bonus
          } else if (difficulty === 'Medium') {
            xpAwarded = 5; // Medium question
          } else {
            xpAwarded = 3; // Easy question
          }
          activityLog.push(`🎯 Correct Taboo answer! +${xpAwarded} XP`);
        } else if (gameResult === 'win' || (correctGuesses && correctGuesses === totalCards)) {
          xpAwarded = 15; // Win bonus
          activityLog.push(`🏆 Taboo Victory! ${correctGuesses || score} correct, earned ${xpAwarded} XP`);
        } else {
          xpAwarded = 5; // Participation XP
          activityLog.push(`👏 Good effort in Taboo! ${correctGuesses || score} correct, earned ${xpAwarded} XP`);
        }
        
        break;

      case 'memory_palace':
        // Memory Palace creation XP
        const { concept, type: memoryType, difficulty: memoryDifficulty } = data;
        
        // XP based on difficulty and concept complexity
        if (memoryDifficulty === 'hard') {
          xpAwarded = 12; // Complex memory palace
        } else if (memoryDifficulty === 'medium') {
          xpAwarded = 8; // Creative story-based
        } else {
          xpAwarded = 5; // Simple mnemonic
        }
        
        activityLog.push(`🧠 Memory palace created! Concept: "${concept}" (+${xpAwarded} XP)`);
        break;

      case 'case_cracker':
        // Case Cracker problem-solving XP
        const { 
          subject: caseSubject, 
          difficulty: caseDifficulty, 
          score: caseScore, 
          timeBonus, 
          casesCompleted 
        } = data;
        
        // Base XP based on difficulty and performance
        let baseXP = 0;
        if (caseDifficulty === 'hard') {
          baseXP = 40; // Expert level problems
        } else if (caseDifficulty === 'medium') {
          baseXP = 25; // Professional level
        } else {
          baseXP = 15; // Apprentice level
        }
        
        // Performance multiplier (score/100)
        const performanceMultiplier = (caseScore || 50) / 100;
        xpAwarded = Math.round(baseXP * performanceMultiplier);
        
        // Add time bonus if provided
        if (timeBonus) {
          xpAwarded += timeBonus;
        }
        
        // Milestone bonuses for multiple cases
        if (casesCompleted && casesCompleted % 5 === 0) {
          const milestoneBonus = 20;
          xpAwarded += milestoneBonus;
          activityLog.push(`🏆 Case milestone! ${casesCompleted} cases solved (+${milestoneBonus} bonus XP)`);
        }
        
        activityLog.push(`🔍 Case solved! Subject: ${caseSubject}, Score: ${caseScore}% (+${xpAwarded} XP)`);
        break;

      case 'debate_bot':
        // Debate Bot argumentation XP - only awarded for wins or strong performance
        const { 
          subject: debateSubject, 
          difficulty: debateDifficulty, 
          userScore, 
          botScore, 
          won, 
          rounds 
        } = data;
        
        // Only award XP if user won or performed well (scored at least 80% of bot's score)
        const performanceThreshold = botScore * 0.8;
        if (won || userScore >= performanceThreshold) {
          // Base XP based on difficulty
          let baseXP = 0;
          if (debateDifficulty === 'hard') {
            baseXP = 50; // Expert level debates
          } else if (debateDifficulty === 'medium') {
            baseXP = 35; // Scholar level
          } else {
            baseXP = 20; // Novice level
          }
          
          // Performance multiplier (full XP for win, 60% for strong performance without win)
          const performanceMultiplier = won ? 1.0 : 0.6;
          xpAwarded = Math.round(baseXP * performanceMultiplier);
          
          // Bonus for high-quality arguments (score relative to bot)
          if (userScore > botScore * 1.2) {
            const excellenceBonus = 10;
            xpAwarded += excellenceBonus;
            activityLog.push(`🎖️ Outstanding argumentation! Significantly outperformed AI (+${excellenceBonus} bonus XP)`);
          }
          
          const statusText = won ? 'won' : 'strong performance';
          activityLog.push(`🗣️ Debate ${statusText}! Subject: ${debateSubject}, ${rounds} rounds (+${xpAwarded} XP)`);
        } else {
          // No XP for poor performance - encourages quality over quantity
          xpAwarded = 0;
          activityLog.push(`💪 Keep practicing! Focus on evidence-based reasoning to earn XP in debates.`);
        }
        break;

      case 'synapse_surge':
        // Synapse Surge rapid classification XP - performance-based rewards
        const { 
          gameMode: surgeMode, 
          subject: surgeSubject, 
          difficulty: surgeDifficulty, 
          accuracy, 
          correctAnswers: surgeCorrect, 
          totalAnswers, 
          maxStreak, 
          avgSpeed, 
          finalScore 
        } = data;
        
        // Only award XP for decent performance (accuracy >= 60%)
        if (accuracy >= 60) {
          // Base XP based on accuracy and game mode
          let baseXP = 0;
          if (surgeMode === 'sprint') {
            baseXP = 25; // High-pressure sprint mode
          } else if (surgeMode === 'survival') {
            baseXP = 20; // Endurance mode
          } else {
            baseXP = 15; // Standard timed mode
          }
          
          // Performance multiplier (accuracy/100)
          const performanceMultiplier = accuracy / 100;
          xpAwarded = Math.round(baseXP * performanceMultiplier);
          
          // Speed bonus (1-8 XP based on average speed multiplier)
          const speedBonus = avgSpeed >= 2.5 ? 8 : 
                            avgSpeed >= 2.0 ? 6 : 
                            avgSpeed >= 1.5 ? 4 : 
                            avgSpeed >= 1.2 ? 2 : 0;
          
          // Streak bonus (up to 10 XP)
          const streakBonus = maxStreak >= 15 ? 10 : 
                             maxStreak >= 10 ? 6 : 
                             maxStreak >= 5 ? 3 : 0;
          
          xpAwarded += speedBonus + streakBonus;
          
          // Difficulty bonus
          if (surgeDifficulty === 'hard') {
            xpAwarded += 5;
          } else if (surgeDifficulty === 'medium') {
            xpAwarded += 2;
          }
          
          let bonusText = [];
          if (speedBonus > 0) bonusText.push(`Speed: +${speedBonus}`);
          if (streakBonus > 0) bonusText.push(`Streak: +${streakBonus}`);
          
          const bonusSummary = bonusText.length > 0 ? ` (${bonusText.join(', ')})` : '';
          activityLog.push(`⚡ Synapse Surge completed! ${accuracy}% accuracy, ${surgeCorrect}/${totalAnswers} correct (+${xpAwarded} XP)${bonusSummary}`);
        } else {
          // Small participation XP for effort
          xpAwarded = 3;
          activityLog.push(`⚡ Synapse Surge participation! Keep practicing classification (+${xpAwarded} XP)`);
        }
        break;

      case 'concept_saved':
        // Bonus XP for saving concepts for later review
        xpAwarded = 3; // Bonus for building knowledge library
        activityLog.push(`💾 Concept saved for review! +${xpAwarded} XP`);
        break;

      case 'daily_checkin':
        // Daily check-in: +10 XP and streak management
        const today = new Date().toDateString();
        const lastActive = new Date(user.lastActiveAt).toDateString();
        
        if (lastActive === today) {
          return NextResponse.json({ 
            error: 'Already checked in today',
            currentXP: user.xp,
            currentStreak: user.streak
          }, { status: 400 });
        }

        xpAwarded = 10; // Increased daily check-in reward
        
        // Check if streak should continue or reset
        const todayDate = new Date();
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastActiveDate = new Date(user.lastActiveAt);
        
        // Reset time to start of day for accurate comparison
        todayDate.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        lastActiveDate.setHours(0, 0, 0, 0);

        let newStreak;
        if (lastActiveDate.getTime() === yesterday.getTime()) {
          // Continuing streak - user was active yesterday
          newStreak = user.streak + 1;
          activityLog.push(`Daily check-in! Streak continued: ${newStreak} days`);
        } else if (lastActiveDate.getTime() < yesterday.getTime()) {
          // Streak broken - user missed a day or more
          newStreak = 1;
          activityLog.push('Daily check-in! New streak started (previous streak broken)');
        } else {
          // User already checked in today (this shouldn't happen due to the check above)
          newStreak = user.streak;
          activityLog.push('Already checked in today!');
        }

        // Streak bonus XP (2 XP per streak day, max 20 bonus)
        streakBonus = Math.min(newStreak * 2, 20);
        xpAwarded += streakBonus;

        if (streakBonus > 0) {
          activityLog.push(`🔥 Streak bonus: +${streakBonus} XP (${newStreak} day streak)`);
        }

        // Update user streak
        await prisma.user.update({
          where: { id: session.user.id },
          data: { 
            streak: newStreak,
            lastActiveAt: new Date()
          }
        });

        break;

      case 'video_completion':
        // Video completion: +5 XP
        const { videoId, videoTitle } = data;
        xpAwarded = 5;
        activityLog.push(`📺 Video completed: ${videoTitle || videoId}, earned ${xpAwarded} XP`);

        // Record video progress
        await prisma.videoProgress.upsert({
          where: {
            userId_videoId: {
              userId: session.user.id,
              videoId: videoId
            }
          },
          update: {
            completed: true,
            updatedAt: new Date()
          },
          create: {
            userId: session.user.id,
            videoId: videoId,
            videoTitle: videoTitle || 'Unknown Video',
            completed: true,
            exam: data.exam,
            subject: data.subject,
            topic: data.topic
          }
        });

        break;

      case 'boss_defeat':
        // Boss defeat: Major XP reward
        const { 
          bossId, 
          subject: bossSubject, 
          exam: bossExam, 
          score: bossScore, 
          playerHealth: finalHealth, 
          questionsAnswered, 
          totalQuestions: totalBossQuestions 
        } = data;
        
        // Base XP for boss defeat
        xpAwarded = 200; // Base boss defeat reward
        
        // Performance bonuses
        const completionBonus = Math.floor((questionsAnswered / totalBossQuestions) * 50); // Up to 50 XP
        const healthBonus = Math.floor(finalHealth / 2); // Up to 50 XP for remaining health
        const scoreBonus = Math.floor(bossScore / 5); // Score-based bonus
        
        xpAwarded += completionBonus + healthBonus + scoreBonus;
        
        activityLog.push(`🏆 Boss Defeated! ${bossId} vanquished (+${xpAwarded} XP)`);
        
        if (completionBonus > 0) {
          activityLog.push(`📚 Completion bonus: +${completionBonus} XP`);
        }
        if (healthBonus > 0) {
          activityLog.push(`❤️ Health bonus: +${healthBonus} XP`);
        }
        if (scoreBonus > 0) {
          activityLog.push(`⭐ Score bonus: +${scoreBonus} XP`);
        }

        // Record boss defeat achievement
        await prisma.achievement.create({
          data: {
            userId: session.user.id,
            type: 'boss_defeat',
            title: `${bossSubject} Boss Defeated!`,
            description: `Conquered the ${bossId} with ${questionsAnswered}/${totalBossQuestions} questions answered`,
            xpReward: xpAwarded
          }
        });

        break;

      default:
        return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    // Update user XP
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        xp: user.xp + xpAwarded,
        lastActiveAt: new Date()
      },
      select: { xp: true, streak: true, name: true }
    });

    // Create achievement record
    await prisma.achievement.create({
      data: {
        userId: session.user.id,
        type: type,
        title: activityLog[0] || 'XP Earned',
        description: activityLog.join('. '),
        xpReward: xpAwarded
      }
    });

    return NextResponse.json({
      success: true,
      xpAwarded,
      streakBonus,
      totalXP: updatedUser.xp,
      currentStreak: updatedUser.streak,
      activityLog,
      user: {
        name: updatedUser.name,
        xp: updatedUser.xp,
        streak: updatedUser.streak
      }
    });

  } catch (error) {
    console.error('Error awarding XP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get user XP and streak info
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        xp: true,
        streak: true,
        name: true,
        lastActiveAt: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can check in today
    const today = new Date().toDateString();
    const lastActive = new Date(user.lastActiveAt).toDateString();
    const canCheckIn = lastActive !== today;

    // Get recent achievements
    const recentAchievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      orderBy: { unlockedAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      user: {
        name: user.name,
        xp: user.xp,
        streak: user.streak,
        lastActiveAt: user.lastActiveAt,
        memberSince: user.createdAt
      },
      canCheckIn,
      recentAchievements
    });

  } catch (error) {
    console.error('Error fetching user XP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}