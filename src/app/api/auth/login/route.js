import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import { CONFIG } from '@/lib/config';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const { token, user } = await authService.login(email.toLowerCase(), password);

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set(CONFIG.JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * CONFIG.JWT_EXPIRY_DAYS, // config-driven expiry days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Invalid credentials' },
      { status: error.message.includes('required') ? 400 : 401 }
    );
  }
}
