import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/userManager';

export async function DELETE(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Delete all user data
    UserManager.deleteUserData(userId);
    
    return NextResponse.json({
      message: 'All user data cleared successfully',
      user_id: userId,
      cleared_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error clearing user data:', error);
    return NextResponse.json({
      error: 'Failed to clear user data',
      details: error.message
    }, { status: 500 });
  }
}