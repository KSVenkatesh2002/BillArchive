import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId || user.id;
    const userProjects = await dbService.getUserProjects(userId);

    // Also scan existing tasks to ensure no project is missing
    const tasksResult = await dbService.findTasks({ userId }, { limit: 1000 });
    const taskProjects = tasksResult.tasks ? Array.from(new Set(tasksResult.tasks.map(t => t.project))).filter(Boolean) : [];

    const combined = Array.from(new Set([...userProjects, ...taskProjects])).sort();

    return NextResponse.json({
      success: true,
      projects: combined
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { project } = await request.json();
    if (!project || typeof project !== 'string' || !project.trim()) {
      return NextResponse.json({ success: false, error: 'Project name is required' }, { status: 400 });
    }

    const userId = user.userId || user.id;
    await dbService.addUserProject(userId, project.trim());

    return NextResponse.json({
      success: true,
      project: project.trim()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
