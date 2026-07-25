import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

import { dbService } from '@/lib/db/dbService';
import { CONFIG } from '@/lib/config';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  const dbUser = await dbService.findUserByUsername(user.username);
  if (!dbUser || dbUser.isDeleted) {
    const response = NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    response.cookies.delete(CONFIG.JWT_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      userId: dbUser._id.toString(),
      username: dbUser.username,
      name: dbUser.name,
      role: dbUser.role || 'user',
      email: dbUser.email || '',
      bio: dbUser.bio || '',
      phone: dbUser.phone || '',
      title: dbUser.title || '',
      clickUpToken: dbUser.clickUpToken || '',
      avatarUrl: dbUser.avatarUrl || ''
    }
  });
}
