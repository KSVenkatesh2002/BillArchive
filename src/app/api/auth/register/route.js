import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password, name } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Name, username, and password are required.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const existingUser = await db.collection('users').findOne({ username: username.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already taken.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);
    const token = await signToken({
      userId: result.insertedId.toString(),
      username: newUser.username,
      name: newUser.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: result.insertedId.toString(), username: newUser.username, name: newUser.name },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
