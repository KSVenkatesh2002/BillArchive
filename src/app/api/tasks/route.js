import { NextResponse } from 'next/server';
import { taskService } from '@/lib/services/taskService';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: true, tasks: [], message: 'Not logged in' });
    }

    const { searchParams } = new URL(request.url);
    const filters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page' && key !== 'limit') {
        filters[key] = value;
      }
    }

    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '15';

    const result = await taskService.getTasks(
      user.userId,
      filters,
      { page, limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized login required' }, { status: 401 });
    }

    const body = await request.json();
    const result = await taskService.createTask(
      user.userId,
      user.username,
      user.name,
      body
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('required') ? 400 : 500 }
    );
  }
}
