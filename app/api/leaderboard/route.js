import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || 'xp'; // 'xp' or 'streak'

    // Get current user session to highlight their position
    const session = await getServerSession(authOptions);

    let orderBy;
    let selectField;

    switch (type) {
      case 'streak':
        orderBy = { streak: 'desc' };
        selectField = 'streak';
        break;
      case 'xp':
      default:
        orderBy = { xp: 'desc' };
        selectField = 'xp';
        break;
    }

    // Get top users
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        streak: true,
        lastActiveAt: true,
        _count: {
          select: {
            quizAttempts: true,
            videoProgress: true
          }
        }
      },
      orderBy: [orderBy, { lastActiveAt: 'desc' }],
      take: limit,
      where: {
        // Only include users with some activity
        OR: [
          { xp: { gt: 0 } },
          { streak: { gt: 0 } }
        ]
      }
    });

    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || 'Anonymous User',
      email: user.email,
      image: user.image,
      xp: user.xp,
      streak: user.streak,
      lastActiveAt: user.lastActiveAt,
      totalQuizzes: user._count.quizAttempts,
      totalVideos: user._count.videoProgress,
      isCurrentUser: session?.user?.id === user.id
    }));

    // Get current user's rank if they're not in top results
    let currentUserRank = null;
    if (session?.user?.id) {
      const currentUserInTop = leaderboard.find(user => user.isCurrentUser);
      
      if (!currentUserInTop) {
        // Count users with higher XP/streak than current user
        const currentUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { xp: true, streak: true, name: true }
        });

        if (currentUser) {
          const usersAbove = await prisma.user.count({
            where: {
              [selectField]: {
                gt: currentUser[selectField]
              }
            }
          });

          currentUserRank = {
            rank: usersAbove + 1,
            name: currentUser.name || 'You',
            xp: currentUser.xp,
            streak: currentUser.streak,
            isCurrentUser: true
          };
        }
      }
    }

    // Get leaderboard statistics
    const stats = await prisma.user.aggregate({
      _count: {
        id: true
      },
      _avg: {
        xp: true,
        streak: true
      },
      _max: {
        xp: true,
        streak: true
      }
    });

    return NextResponse.json({
      leaderboard,
      currentUserRank,
      stats: {
        totalUsers: stats._count.id,
        averageXP: Math.round(stats._avg.xp || 0),
        averageStreak: Math.round(stats._avg.streak || 0),
        maxXP: stats._max.xp || 0,
        maxStreak: stats._max.streak || 0
      },
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update leaderboard (for admin or system updates)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'refresh_ranks') {
      // This could be used to recalculate ranks or clean up data
      // For now, just return success as ranks are calculated dynamically
      return NextResponse.json({ 
        success: true, 
        message: 'Leaderboard refreshed successfully' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}