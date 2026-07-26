import { NextResponse } from 'next/server';
import { getAuthUser, hashPassword } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await dbService.findUserByUsername(auth.username);
    if (!dbUser || dbUser.isDeleted) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = dbUser.role === 'admin' || dbUser.role === 'superAdmin';
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const authOrgId = (dbUser.organization?._id || dbUser.organization)?.toString();
    if (!authOrgId) {
      return NextResponse.json({ success: false, error: 'No organization scope found' }, { status: 400 });
    }

    const allUsers = await dbService.findUsers();
    const orgUsers = allUsers.filter(u => {
      const uOrgId = (u.organization?._id || u.organization)?.toString();
      return uOrgId === authOrgId && !u.isDeleted;
    });

    return NextResponse.json({
      success: true,
      users: orgUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        username: u.username,
        role: u.role || 'user',
        createdAt: u.createdAt
      }))
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await dbService.findUserByUsername(auth.username);
    if (!dbUser || dbUser.isDeleted) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = dbUser.role === 'admin' || dbUser.role === 'superAdmin';
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const authOrgId = dbUser.organization?._id || dbUser.organization;
    if (!authOrgId) {
      return NextResponse.json({ success: false, error: 'No organization scope found' }, { status: 400 });
    }

    const { name, username, password, role } = await request.json();
    if (!name || !username || !password) {
      return NextResponse.json({ success: false, error: 'Name, username, and password are required.' }, { status: 400 });
    }

    const existingUser = await dbService.findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Username already taken.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await dbService.createUser({
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      organization: authOrgId,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
