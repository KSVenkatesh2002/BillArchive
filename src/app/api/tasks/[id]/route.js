import { NextResponse } from 'next/server';
import { taskService } from '@/lib/services/taskService';
import { getAuthUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await taskService.getTaskById(id);

    return NextResponse.json(result);
  } catch (error) {
    const status = error.message === 'Task not found' ? 404 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check action type (add time entry or delete time entry)
    if (body.action === 'addTimeEntry') {
      const result = await taskService.addTimeEntry(
        id,
        user.userId,
        user.name || user.email,
        body.entry
      );
      return NextResponse.json(result);
    } else if (body.action === 'deleteTimeEntry') {
      const result = await taskService.deleteTimeEntry(
        id,
        body.entryId,
        user.userId
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const result = await taskService.updateTask(
      id,
      user.userId,
      user.name || user.email,
      body
    );

    return NextResponse.json(result);
  } catch (error) {
    const status = error.message === 'Task not found' ? 404 :
                   error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await taskService.deleteTask(id, user.userId);

    return NextResponse.json(result);
  } catch (error) {
    const status = error.message === 'Task not found' ? 404 :
                   error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
