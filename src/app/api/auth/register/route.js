import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { CONFIG } from '@/lib/config';

export async function POST(request) {
  try {
    const { username, password, name, orgName } = await request.json();

    if (!username || !password || !name || !orgName) {
      return NextResponse.json(
        { success: false, error: 'Name, username, password, and organization name are required.' },
        { status: 400 }
      );
    }

    const { token, user } = await authService.register(name, username, password, orgName);

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set(CONFIG.JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * CONFIG.JWT_EXPIRY_DAYS,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}
