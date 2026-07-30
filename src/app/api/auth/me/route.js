import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

import { dbService } from '@/lib/db/dbService';
import { CONFIG } from '@/lib/config';

export async function GET() {
  const user = await getAuthUser();
  if (!user || !user.email) {
    const response = NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    response.cookies.delete(CONFIG.JWT_COOKIE_NAME);
    return response;
  }

  const dbUser = await dbService.findUserByEmail(user.email);
  if (!dbUser || dbUser.isDeleted) {
    const response = NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    response.cookies.delete(CONFIG.JWT_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      id: dbUser._id.toString(),
      userId: dbUser._id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role || 'user',
      email: dbUser.email || '',
      bio: dbUser.bio || '',
      phone: dbUser.phone || '',
      title: dbUser.title || '',
      clickUpToken: dbUser.clickUpToken || '',
      avatarUrl: dbUser.avatarUrl || '',
      orgId: dbUser.organization?._id ? dbUser.organization._id.toString() : (dbUser.organization ? dbUser.organization.toString() : '')
    }
  });
}
