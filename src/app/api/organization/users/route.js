import { NextResponse } from 'next/server';
import { getAuthUser, hashPassword } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await dbService.findUserByEmail(auth.email);
    if (!dbUser || dbUser.isDeleted) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = dbUser.role === 'admin' || dbUser.role === 'superAdmin';
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const authOrgId = (dbUser.organization?._id || dbUser.organization)?.toString();
    const authOrgSlug = dbUser.orgId || dbUser.organization?.slug?.toString();
    
    if (!authOrgId && !authOrgSlug) {
      return NextResponse.json({ success: false, error: 'No organization scope found' }, { status: 400 });
    }

    const allUsers = await dbService.findUsers();
    const orgUsers = allUsers.filter(u => {
      const uOrg = (u.organization?._id || u.organization)?.toString();
      return (uOrg === authOrgId || uOrg === authOrgSlug) && !u.isDeleted;
    });

    return NextResponse.json({
      success: true,
      users: orgUsers.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
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

    const dbUser = await dbService.findUserByEmail(auth.email);
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

    const { name, email, password, role } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await dbService.createUser({
      name,
      email: email.toLowerCase(),
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
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
