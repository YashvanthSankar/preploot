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
        // XP calculation: x out of y questions = x XP, perfect score = 5*x XP
        const { correctAnswers, totalQuestions, quizId, subject, exam } = data;
        
        if (correctAnswers === totalQuestions) {
          // Perfect score: 5x XP bonus
          xpAwarded = 5 * correctAnswers;
          activityLog.push(`Perfect quiz! Earned ${xpAwarded} XP (5x bonus)`);
        } else {
          // Regular scoring: 1 XP per correct answer
          xpAwarded = correctAnswers;
          activityLog.push(`Quiz completed: ${correctAnswers}/${totalQuestions} correct, earned ${xpAwarded} XP`);
        }

        // Record quiz attempt
        await prisma.quizAttempt.create({
          data: {
            userId: session.user.id,
            quizId: quizId || `generated-${Date.now()}`,
            score: Math.round((correctAnswers / totalQuestions) * 100),
            answers: data.answers || {},
            xpEarned: xpAwarded
          }
        });

        break;

      case 'daily_checkin':
        // Daily check-in: +1 XP and streak management
        const today = new Date().toDateString();
        const lastActive = new Date(user.lastActiveAt).toDateString();
        
        if (lastActive === today) {
          return NextResponse.json({ 
            error: 'Already checked in today',
            currentXP: user.xp,
            currentStreak: user.streak
          }, { status: 400 });
        }

        xpAwarded = 1;
        
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

        // Streak bonus XP (1 XP per streak day, max 10 bonus)
        streakBonus = Math.min(newStreak, 10);
        xpAwarded += streakBonus;

        if (streakBonus > 1) {
          activityLog.push(`Streak bonus: +${streakBonus} XP`);
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
        // Video completion: +2 XP
        const { videoId, videoTitle } = data;
        xpAwarded = 2;
        activityLog.push(`Video completed: ${videoTitle || videoId}`);

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