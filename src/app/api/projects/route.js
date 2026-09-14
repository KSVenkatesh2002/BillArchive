import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await dbService.findUserByEmail(user.email);
    const userId = user.userId || user.id;
    const orgId = dbUser?.organization?._id || dbUser?.organization?.id;

    // Fetch user/org projects
    const userProjects = await dbService.getUserProjects(userId);

    // Also scan existing tasks across org or user
    const tasksQuery = orgId ? { organizationId: orgId } : { userId };
    const tasksResult = await dbService.findTasks(tasksQuery, { limit: 2000 });
    const taskProjects = tasksResult.tasks ? Array.from(new Set(tasksResult.tasks.map(t => t.project))).filter(Boolean) : [];

    // Also include dynamicFields project options if available
    const orgProjects = dbUser?.organization?.dynamicFields?.find(f => f.name === 'project')?.options || [];

    const combined = Array.from(new Set([...userProjects, ...taskProjects, ...orgProjects])).sort();

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

    const trimmedProject = project.trim();
    const userId = user.userId || user.id;
    await dbService.addUserProject(userId, trimmedProject);

    // Also sync to organization dynamicFields project options if user belongs to an org
    const dbUser = await dbService.findUserByEmail(user.email);
    if (dbUser?.organization) {
      const org = dbUser.organization;
      const orgId = org._id || org.id;
      let currentFields = org.dynamicFields || [];
      const projectIdx = currentFields.findIndex(f => f.name === 'project');
      if (projectIdx >= 0) {
        const existingOpts = currentFields[projectIdx].options || [];
        if (!existingOpts.includes(trimmedProject)) {
          currentFields[projectIdx].options = [...existingOpts, trimmedProject];
          await dbService.updateOrganizationConfig(orgId, currentFields, org.enabledFields);
        }
      } else {
        currentFields.push({
          name: 'project',
          label: 'Project',
          type: 'dropdown',
          options: [trimmedProject],
          isRequired: true,
          displayLocation: 'table'
        });
        await dbService.updateOrganizationConfig(orgId, currentFields, org.enabledFields);
      }
    }

    return NextResponse.json({
      success: true,
      project: trimmedProject
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
