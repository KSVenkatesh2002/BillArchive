import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/dbService';
import { getAuthUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all'; // 'all', '1w', '1m', 'custom'
    const project = searchParams.get('project');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Content inclusion toggles
    const includeHours = searchParams.get('includeHours') !== 'false';
    const includeHistory = searchParams.get('includeHistory') !== 'false';
    const includeClickUp = searchParams.get('includeClickUp') !== 'false';
    const includeMeta = searchParams.get('includeMeta') !== 'false';
    const includeTotals = searchParams.get('includeTotals') !== 'false';

    const query = {};
    if (user && (user.userId || user.id)) {
      query.userId = user.userId || user.id;
    }

    const now = new Date();
    if (timeframe === '1w') {
      const dateLimit = new Date();
      dateLimit.setDate(now.getDate() - 7);
      query.createdAt = { $gte: dateLimit };
    } else if (timeframe === '1m') {
      const dateLimit = new Date();
      dateLimit.setDate(now.getDate() - 30);
      query.createdAt = { $gte: dateLimit };
    } else if (timeframe === 'custom' && (startDateParam || endDateParam)) {
      query.createdAt = {};
      if (startDateParam) {
        query.createdAt.$gte = new Date(startDateParam);
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (project && project !== 'all') {
      query.project = project;
    }

    const result = await dbService.findTasks(query, { limit: 1000 });
    const tasks = result.tasks || [];

    // Title formatting
    let title = 'SUMMARY REPORT';
    if (project && project !== 'all') {
      title = `PROJECT REPORT: ${project.toUpperCase()}`;
    } else if (timeframe === '1w') {
      title = 'SUMMARY REPORT (Past 1 Week)';
    } else if (timeframe === '1m') {
      title = 'SUMMARY REPORT (Past 1 Month)';
    } else if (timeframe === 'custom') {
      title = `CUSTOM RANGE REPORT (${startDateParam || 'Start'} to ${endDateParam || 'End'})`;
    } else {
      title = 'ALL-TIME SUMMARY REPORT';
    }

    let totalAllocated = 0;
    let totalBilled = 0;
    let totalActual = 0;

    let textBuffer = `=========================================\n`;
    textBuffer += `${title}\n`;
    textBuffer += `Generated: ${new Date().toLocaleDateString()}\n`;
    textBuffer += `=========================================\n\n`;

    if (tasks.length === 0) {
      textBuffer += `No tasks recorded for this timeframe/project.\n`;
    } else {
      tasks.forEach((t, index) => {
        const allocated = Number(t.bill?.allocatedHours || 0);
        const billed = Number(t.bill?.billedHours || 0);
        const actual = Number(t.bill?.actualHours || 0);

        totalAllocated += allocated;
        totalBilled += billed;
        totalActual += actual;

        textBuffer += `${index + 1}. [${t.project}] ${t.name}`;
        if (includeClickUp && t.nickName) {
          textBuffer += ` (${t.nickName})`;
        }
        textBuffer += `\n`;

        if (includeMeta) {
          textBuffer += `   Status: ${t.status} | Source: ${t.source || 'N/A'} | Work Type: ${t.typeOfWork || 'N/A'}\n`;
        } else {
          textBuffer += `   Status: ${t.status}\n`;
        }

        if (includeClickUp && t.clickupId) {
          textBuffer += `   ClickUp Link/ID: ${t.clickupId}\n`;
        }

        if (includeHours) {
          textBuffer += `   Hours -> Allocated: ${allocated}h | Billed: ${billed}h | Actual: ${actual}h\n`;
        }

        if (includeHistory && t.statusHistory && t.statusHistory.length > 0) {
          const historyTrail = t.statusHistory.map(h => h.status).join(' -> ');
          textBuffer += `   Status Progression: ${historyTrail}\n`;
        }

        textBuffer += `-----------------------------------------\n`;
      });
    }

    if (includeTotals) {
      textBuffer += `\nTOTAL SUMMARY:\n`;
      textBuffer += `Total Tasks: ${tasks.length}\n`;
      if (includeHours) {
        textBuffer += `Total Allocated Hours: ${totalAllocated.toFixed(1)} hrs\n`;
        textBuffer += `Total Billed Hours: ${totalBilled.toFixed(1)} hrs\n`;
        textBuffer += `Total Actual Hours: ${totalActual.toFixed(1)} hrs\n`;
        textBuffer += `Efficiency Variance: ${(totalBilled - totalActual).toFixed(1)} hrs\n`;
      }
      textBuffer += `=========================================\n`;
    }

    const isDemo = await dbService.isDemo();

    return NextResponse.json({
      success: true,
      timeframe,
      project: project || 'All Projects',
      tasksCount: tasks.length,
      totals: { totalAllocated, totalBilled, totalActual, variance: totalBilled - totalActual },
      reportText: textBuffer,
      tasks,
      isDemo
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
