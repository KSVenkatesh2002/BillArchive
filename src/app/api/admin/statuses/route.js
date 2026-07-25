import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const statuses = await dbService.getStatuses();
    return NextResponse.json({ success: true, statuses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    
    // Auth security: Must be logged in AND have 'admin' role
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Admin access only.' },
        { status: 403 }
      );
    }

    const { statuses } = await request.json();
    if (!Array.isArray(statuses)) {
      return NextResponse.json(
        { success: false, error: 'Statuses must be an array.' },
        { status: 400 }
      );
    }

    // Clean status strings (trim and filter empty/non-alphanumeric, etc.)
    const cleanedStatuses = statuses
      .map(s => s?.trim()?.toLowerCase())
      .filter(s => s && s.length > 0);

    const updated = await dbService.saveStatuses(cleanedStatuses);

    return NextResponse.json({
      success: true,
      statuses: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
