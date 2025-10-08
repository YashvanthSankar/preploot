import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user data
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        streak: true, 
        lastActiveAt: true,
        xp: true
      }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || `user_${session.user.id}@example.com`,
          name: session.user.name || 'User',
          image: session.user.image || null,
          streak: 0,
          xp: 0,
          lastActiveAt: new Date()
        },
        select: { 
          streak: true, 
          lastActiveAt: true,
          xp: true
        }
      });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const lastActiveDate = new Date(user.lastActiveAt);
    lastActiveDate.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak;
    let streakUpdated = false;

    // Check if we need to update the streak
    if (lastActiveDate.getTime() < today.getTime()) {
      // User hasn't been active today yet
      
      if (lastActiveDate.getTime() === yesterday.getTime()) {
        // User was active yesterday - continue streak
        newStreak = user.streak + 1;
        streakUpdated = true;
      } else if (lastActiveDate.getTime() < yesterday.getTime()) {
        // User missed a day - reset streak to 1
        newStreak = 1;
        streakUpdated = true;
      }
      // If lastActiveDate equals today, no update needed (already active today)

      if (streakUpdated) {
        // Update user's streak and lastActiveAt
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            streak: newStreak,
            lastActiveAt: now
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      streakUpdated,
      newStreak,
      currentStreak: newStreak,
      lastActiveAt: user.lastActiveAt,
      message: streakUpdated ? 
        (newStreak === 1 ? 'Streak started!' : `Streak continued! ${newStreak} days`) :
        'Already active today'
    });

  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update streak' 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        streak: true, 
        lastActiveAt: true,
        xp: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        streak: 0, 
        lastActiveAt: null,
        canUpdateStreak: true
      });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const lastActiveDate = new Date(user.lastActiveAt);
    lastActiveDate.setHours(0, 0, 0, 0);

    const canUpdateStreak = lastActiveDate.getTime() < today.getTime();

    return NextResponse.json({
      success: true,
      streak: user.streak,
      lastActiveAt: user.lastActiveAt,
      canUpdateStreak,
      user: {
        name: user.name,
        xp: user.xp,
        streak: user.streak
      }
    });

  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch streak' 
    }, { status: 500 });
  }
}