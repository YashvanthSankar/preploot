import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user preferences
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        selectedExam: true,
        selectedSubjects: true,
        preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        selectedExam: user.selectedExam,
        selectedSubjects: user.selectedSubjects || [],
        preferences: user.preferences || {}
      }
    });

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// Update user preferences
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { selectedExam, selectedSubjects, preferences } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        selectedExam: selectedExam || null,
        selectedSubjects: selectedSubjects || [],
        preferences: preferences || {},
        updatedAt: new Date()
      },
      select: {
        selectedExam: true,
        selectedSubjects: true,
        preferences: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}