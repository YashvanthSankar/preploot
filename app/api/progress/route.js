import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exam = searchParams.get('exam');
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');

    // Ensure user exists in database (create if needed)
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          xp: true,
          streak: true,
          lastActiveAt: true,
        }
      });

      if (!user) {
        // Create user if it doesn't exist
        user = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || `user_${session.user.id}@example.com`,
            name: session.user.name || 'User',
            image: session.user.image || null,
          },
          select: {
            xp: true,
            streak: true,
            lastActiveAt: true,
          }
        });
      }
    } catch (error) {
      console.error('Database error, returning default user data:', error);
      // Return mock data if database is unavailable
      user = {
        xp: 0,
        streak: 0,
        lastActiveAt: new Date()
      };
    }

    // Get today's goal
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyGoal;
    try {
      dailyGoal = await prisma.dailyGoal.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today
          }
        }
      });

      // Create daily goal if it doesn't exist
      if (!dailyGoal) {
        dailyGoal = await prisma.dailyGoal.create({
          data: {
            userId: session.user.id,
            date: today,
            videosTarget: 3,
            quizzesTarget: 2,
            studyTimeTarget: 60,
            xpTarget: 100
          }
        });
      }
    } catch (error) {
      console.error('Database error for daily goal, using defaults:', error);
      // Return mock daily goal if database is unavailable
      dailyGoal = {
        videosTarget: 3,
        quizzesTarget: 2,
        studyTimeTarget: 60,
        xpTarget: 100,
        videosWatched: 0,
        quizzesTaken: 0,
        studyTimeActual: 0,
        xpEarned: 0
      };
    }

    // Get subject progress if subject is specified
    let subjectProgress = null;
    if (exam && subject) {
      try {
        subjectProgress = await prisma.subjectProgress.findUnique({
          where: {
            userId_exam_subject: {
              userId: session.user.id,
              exam,
              subject
            }
          }
        });

        // Create subject progress if it doesn't exist
        if (!subjectProgress) {
          subjectProgress = await prisma.subjectProgress.create({
            data: {
              userId: session.user.id,
              exam,
              subject,
              totalTopics: 10, // You can make this dynamic based on your curriculum
              totalVideos: 50  // Same here
            }
          });
        }
      } catch (error) {
        console.error('Database error for subject progress, using defaults:', error);
        subjectProgress = {
          topicsCompleted: 0,
          totalTopics: 10,
          videosWatched: 0,
          totalVideos: 50,
          quizzesTaken: 0,
          averageScore: 0
        };
      }
    }

    // Get overall stats
    let stats;
    try {
      stats = await getProgressStats(session.user.id, exam, subject);
    } catch (error) {
      console.error('Database error for stats, using defaults:', error);
      stats = {
        videosWatched: 0,
        quizzesTaken: 0
      };
    }

    // Get recent achievements
    let recentAchievements = [];
    try {
      recentAchievements = await prisma.achievement.findMany({
        where: { userId: session.user.id },
        orderBy: { unlockedAt: 'desc' },
        take: 5
      });
    } catch (error) {
      console.error('Database error for achievements, using empty array:', error);
      recentAchievements = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        dailyGoal,
        subjectProgress,
        stats,
        recentAchievements
      }
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'video_progress':
        return handleVideoProgress(session.user.id, data);
      
      case 'quiz_attempt':
        return handleQuizAttempt(session.user.id, data);
      
      case 'study_session':
        return handleStudySession(session.user.id, data);
      
      default:
        return NextResponse.json({ error: 'Invalid progress type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

async function getProgressStats(userId, exam = null, subject = null) {
  try {
    const whereClause = { userId };
    if (exam) whereClause.exam = exam;
    if (subject) whereClause.subject = subject;

    const [videoCount, quizCount] = await Promise.all([
      prisma.videoProgress.count({ where: whereClause }),
      prisma.quizAttempt.count({ where: { userId } })
    ]);

    return {
      videosWatched: videoCount,
      quizzesTaken: quizCount
    };
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    return {
      videosWatched: 0,
      quizzesTaken: 0
    };
  }
}

async function handleVideoProgress(userId, data) {
  try {
    const { videoId, watchDuration, totalDuration, completed, exam, subject, topic, videoTitle } = data;

    const videoProgress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: { userId, videoId }
      },
      update: {
        watchDuration: Math.max(watchDuration, 0),
        totalDuration,
        completed,
        lastWatchedAt: new Date()
      },
      create: {
        userId,
        videoId,
        videoTitle,
        exam,
        subject,
        topic,
        watchDuration: Math.max(watchDuration, 0),
        totalDuration,
        completed
      }
    });

    // Update daily goal
    await updateDailyGoal(userId, { videosWatched: 1 });

    // Award XP for video completion
    if (completed) {
      await updateUserXP(userId, 20);
    }

    return NextResponse.json({ success: true, data: videoProgress });
  } catch (error) {
    console.error('Error handling video progress:', error);
    return NextResponse.json({ success: false, error: 'Failed to save video progress' }, { status: 500 });
  }
}

async function handleQuizAttempt(userId, data) {
  try {
    const { quizId, score, answers, exam, subject, topic } = data;

    const xpEarned = Math.floor(score * 2); // 2 XP per point

    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        answers,
        xpEarned
      }
    });

    // Update daily goal
    await updateDailyGoal(userId, { quizzesTaken: 1, xpEarned });

    // Update user XP
    await updateUserXP(userId, xpEarned);

    // Update subject progress
    if (exam && subject) {
      await updateSubjectProgress(userId, exam, subject, { quizScore: score });
    }

    return NextResponse.json({ success: true, data: quizAttempt });
  } catch (error) {
    console.error('Error handling quiz attempt:', error);
    return NextResponse.json({ success: false, error: 'Failed to save quiz attempt' }, { status: 500 });
  }
}

async function handleStudySession(userId, data) {
  const { exam, subject, topic, duration, activities } = data;

  const xpEarned = Math.floor(duration / 5); // 1 XP per 5 minutes

  const studySession = await prisma.studySession.create({
    data: {
      userId,
      exam,
      subject,
      topic,
      duration,
      activities,
      xpEarned
    }
  });

  // Update daily goal
  await updateDailyGoal(userId, { studyTime: duration, xpEarned });

  // Update user XP
  await updateUserXP(userId, xpEarned);

  return NextResponse.json({ success: true, data: studySession });
}

async function updateDailyGoal(userId, updates) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const incrementData = {};
    if (updates.videosWatched) incrementData.videosWatched = updates.videosWatched;
    if (updates.quizzesTaken) incrementData.quizzesTaken = updates.quizzesTaken;
    if (updates.studyTime) incrementData.studyTimeActual = updates.studyTime;
    if (updates.xpEarned) incrementData.xpEarned = updates.xpEarned;

    // First ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `user_${userId}@example.com`,
        name: 'User'
      }
    });

    await prisma.dailyGoal.upsert({
      where: {
        userId_date: { userId, date: today }
      },
      update: incrementData,
      create: {
        userId,
        date: today,
        videosTarget: 3,
        quizzesTarget: 2,
        studyTimeTarget: 60,
        xpTarget: 100,
        ...incrementData
      }
    });
  } catch (error) {
    console.error('Error updating daily goal:', error);
  }
}

async function updateUserXP(userId, xpToAdd) {
  try {
    // Ensure user exists before updating
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        xp: { increment: xpToAdd },
        lastActiveAt: new Date()
      },
      create: {
        id: userId,
        email: `user_${userId}@example.com`,
        name: 'User',
        xp: xpToAdd,
        lastActiveAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating user XP:', error);
  }
}

async function updateSubjectProgress(userId, exam, subject, updates) {
  try {
    const updateData = {};
    if (updates.quizScore !== undefined) {
      updateData.quizzesTaken = { increment: 1 };
      // Calculate new average score (simplified)
      const current = await prisma.subjectProgress.findUnique({
        where: { userId_exam_subject: { userId, exam, subject } }
      });
      if (current) {
        const newAverage = ((current.averageScore * current.quizzesTaken) + updates.quizScore) / (current.quizzesTaken + 1);
        updateData.averageScore = newAverage;
      }
    }

    await prisma.subjectProgress.upsert({
      where: {
        userId_exam_subject: { userId, exam, subject }
      },
      update: updateData,
      create: {
        userId,
        exam,
        subject,
        quizzesTaken: 1,
        averageScore: updates.quizScore || 0
      }
    });
  } catch (error) {
    console.error('Error updating subject progress:', error);
  }
}