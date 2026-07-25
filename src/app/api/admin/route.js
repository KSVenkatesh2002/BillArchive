import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';
import { billService } from '@/lib/services/billService';

export async function GET() {
  try {
    const user = await getAuthUser();
    
    // Auth security: Must be logged in AND have 'admin' role
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Admin access only.' },
        { status: 403 }
      );
    }

    // Fetch system-wide users, bills, database state
    const users = await dbService.findUsers();
    const billsResult = await billService.getBills();
    const bills = billsResult.data || [];
    const isDemo = await dbService.isDemo();

    // Fetch all tasks for system summary
    const tasksResult = await dbService.findTasks({}, { limit: 5000 });
    const tasks = tasksResult.tasks || [];
    const dbMetrics = tasksResult.metrics || { totalAllocated: 0, totalBilled: 0, totalActual: 0 };

    // Calculate billing amounts stats
    let totalGrossBilledAmount = 0;
    bills.forEach(b => {
      if (b.status === 'Paid') {
        totalGrossBilledAmount += Number(b.amount || 0);
      }
    });

    return NextResponse.json({
      success: true,
      database: isDemo ? 'in-memory-fallback' : 'mongodb-atlas',
      stats: {
        usersCount: users.length,
        tasksCount: tasks.length,
        billsCount: bills.length,
        totalAllocatedHours: dbMetrics.totalAllocated,
        totalBilledHours: dbMetrics.totalBilled,
        totalActualHours: dbMetrics.totalActual,
        totalGrossPaidAmount: totalGrossBilledAmount
      },
      users,
      bills,
      statuses: await dbService.getStatuses()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
