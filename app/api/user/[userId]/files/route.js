import { NextRequest, NextResponse } from 'next/server';
import { UserManager } from '@/lib/userManager';

export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get list of user's files
    const files = UserManager.listUserFiles(userId);
    
    return NextResponse.json({
      user_id: userId,
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        modified: file.modified,
        type: file.name.split('.').pop()?.toLowerCase()
      })),
      total_files: files.length
    });

  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({
      error: 'Failed to list files',
      details: error.message
    }, { status: 500 });
  }
}