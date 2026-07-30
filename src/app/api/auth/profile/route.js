import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';
import { CONFIG } from '@/lib/config';

export async function PUT(request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, bio, phone, title, clickUpToken, avatarUrl } = await request.json();

    // Construct update query
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (bio !== undefined) updateFields.bio = bio;
    if (phone !== undefined) updateFields.phone = phone;
    if (title !== undefined) updateFields.title = title;
    if (clickUpToken !== undefined) updateFields.clickUpToken = clickUpToken;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;

    const updatedUser = await dbService.updateUser(session.userId, { $set: updateFields });
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: updatedUser._id.toString(),
        username: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role || 'user',
        email: updatedUser.email || '',
        bio: updatedUser.bio || '',
        phone: updatedUser.phone || '',
        title: updatedUser.title || '',
        clickUpToken: updatedUser.clickUpToken || '',
        avatarUrl: updatedUser.avatarUrl || ''
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete user
    const updatedUser = await dbService.updateUser(session.userId, {
      $set: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Clear session cookies
    const response = NextResponse.json({ success: true, message: 'Account soft-deleted successfully' });
    response.cookies.delete(CONFIG.JWT_COOKIE_NAME);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
