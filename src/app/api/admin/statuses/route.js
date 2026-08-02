import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    const statuses = await dbService.getStatuses(orgId || 'system_default');
    return NextResponse.json({ success: true, statuses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    
    // Auth security: Must be logged in AND have 'admin' or 'superAdmin' role
    if (!user || (user.role !== 'admin' && user.role !== 'superAdmin')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access only.' },
        { status: 403 }
      );
    }

    const { statuses, orgId } = await request.json();
    
    // Determine the target scope
    let targetOrgId = 'system_default';
    if (user.role === 'admin') {
      // Org admin can only edit their own org
      targetOrgId = user.orgId;
    } else if (user.role === 'superAdmin') {
      // Super admin can edit the default list, or a specific org if provided
      targetOrgId = orgId || 'system_default';
    }

    if (!Array.isArray(statuses)) {
      return NextResponse.json(
        { success: false, error: 'Statuses must be an array.' },
        { status: 400 }
      );
    }

    // Clean status strings (trim and filter empty)
    const cleanedStatuses = statuses
      .map(s => s?.trim())
      .filter(s => s && s.length > 0);

    const updated = await dbService.saveStatuses(cleanedStatuses, targetOrgId);

    return NextResponse.json({
      success: true,
      statuses: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
