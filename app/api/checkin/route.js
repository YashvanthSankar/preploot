import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastActive = new Date(user.lastActiveAt)
    lastActive.setHours(0, 0, 0, 0)
    
    if (lastActive.getTime() === today.getTime()) {
      return NextResponse.json({ 
        error: 'Already checked in today',
        currentXP: user.xp,
        currentStreak: user.streak
      }, { status: 400 })
    }

    // Process daily check-in via XP API
    const xpResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/xp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify({
        type: 'daily_checkin',
        data: {}
      })
    })

    if (!xpResponse.ok) {
      throw new Error('Failed to process check-in')
    }

    const xpData = await xpResponse.json()

    return NextResponse.json({
      success: true,
      message: '🎉 Daily check-in successful!',
      ...xpData
    })

  } catch (error) {
    console.error('Error processing daily check-in:', error)
    return NextResponse.json(
      { error: 'Failed to process daily check-in' },
      { status: 500 }
    )
  }
}