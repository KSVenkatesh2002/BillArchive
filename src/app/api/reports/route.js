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

    const excludedIdsStr = searchParams.get('excludedIds') || '';
    const excludedIds = new Set(excludedIdsStr.split(',').filter(Boolean));

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
    let minDate = null;
    let maxDate = null;

    if (startDateParam) minDate = new Date(startDateParam);
    if (endDateParam) {
      maxDate = new Date(endDateParam);
      maxDate.setHours(23, 59, 59, 999);
    }

    if (project && project !== 'all') {
      query.project = project;
    }

    const result = await dbService.findTasks(query, { limit: 1000 });
    let rawTasks = result.tasks || [];

    // Flatten tasks by date of work entry
    const dailyEntries = [];
    rawTasks.forEach(t => {
      if (t.timeEntries && t.timeEntries.length > 0) {
        t.timeEntries.forEach(entry => {
          const entryDate = new Date(entry.date);
          let inRange = true;
          if (minDate && entryDate < minDate) inRange = false;
          if (maxDate && entryDate > maxDate) inRange = false;

          if (inRange) {
            dailyEntries.push({
              uniqueId: `${t._id || t.id}_${entry.date}`,
              taskId: t._id || t.id,
              taskName: t.name,
              nickName: t.nickName,
              clickupId: t.clickupId,
              project: t.project || 'General',
              status: t.status,
              workDate: entry.date,
              allocated: Number(entry.allocatedHours || 0),
              billed: Number(entry.billedHours || 0),
              actual: Number(entry.actualHours || 0),
              note: entry.note || '',
              statusHistory: t.statusHistory || []
            });
          }
        });
      } else {
        // Fallback for tasks with no timeEntries array
        const taskDate = new Date(t.workDate || t.createdAt);
        let inRange = true;
        if (minDate && taskDate < minDate) inRange = false;
        if (maxDate && taskDate > maxDate) inRange = false;

        if (inRange) {
          const dateStr = taskDate.toISOString().split('T')[0];
          dailyEntries.push({
            uniqueId: `${t._id || t.id}_${dateStr}`,
            taskId: t._id || t.id,
            taskName: t.name,
            nickName: t.nickName,
            clickupId: t.clickupId,
            project: t.project || 'General',
            status: t.status,
            workDate: t.workDate || t.createdAt,
            allocated: Number(t.bill?.allocatedHours || 0),
            billed: Number(t.bill?.billedHours || 0),
            actual: Number(t.bill?.actualHours || 0),
            note: '',
            statusHistory: t.statusHistory || []
          });
        }
      }
    });

    // Sort entries chronologically by workDate
    dailyEntries.sort((a, b) => new Date(b.workDate) - new Date(a.workDate));

    // Filter for text report generation
    const filteredEntries = dailyEntries.filter(e => !excludedIds.has(e.uniqueId));

    // Title formatting
    let title = 'SUMMARY REPORT';
    if (project && project !== 'all') {
      title = `PROJECT REPORT: ${project.toUpperCase()}`;
    } else if (startDateParam || endDateParam) {
      title = `CUSTOM RANGE REPORT (${startDateParam || 'Start'} to ${endDateParam || 'End'})`;
    } else {
      title = 'TIMELINE SUMMARY REPORT';
    }

    let totalAllocated = 0;
    let totalBilled = 0;
    let totalActual = 0;

    let textBuffer = `=========================================\n`;
    textBuffer += `${title}\n`;
    textBuffer += `Generated: ${new Date().toLocaleDateString()}\n`;
    textBuffer += `=========================================\n\n`;

    if (filteredEntries.length === 0) {
      textBuffer += `No work log entries recorded for this timeline/project selection.\n`;
    } else {
      filteredEntries.forEach((entry, index) => {
        totalAllocated += entry.allocated;
        totalBilled += entry.billed;
        totalActual += entry.actual;

        textBuffer += `${index + 1}. [${entry.project}] ${entry.taskName}`;
        if (includeClickUp && entry.nickName) {
          textBuffer += ` (${entry.nickName})`;
        }
        textBuffer += `\n`;

        textBuffer += `   Status: ${entry.status} | Work Date: ${new Date(entry.workDate).toLocaleDateString()}\n`;

        if (entry.note) {
          textBuffer += `   Note: ${entry.note}\n`;
        }

        if (includeClickUp && entry.clickupId) {
          textBuffer += `   ClickUp Link/ID: ${entry.clickupId}\n`;
        }

        if (includeHours) {
          textBuffer += `   Hours (This Date Log) -> Billed: ${entry.billed}h | Actual: ${entry.actual}h | Alloc: ${entry.allocated}h\n`;
        }

        if (includeHistory && entry.statusHistory && entry.statusHistory.length > 0) {
          const historyTrail = entry.statusHistory.map(h => h.status).join(' -> ');
          textBuffer += `   Status Progression: ${historyTrail}\n`;
        }

        textBuffer += `-----------------------------------------\n`;
      });
    }

    if (includeTotals) {
      textBuffer += `\nTOTAL SUMMARY:\n`;
      textBuffer += `Total Log Entries: ${filteredEntries.length}\n`;
      if (includeHours) {
        textBuffer += `Total Allocated Hours: ${totalAllocated.toFixed(2)} hrs\n`;
        textBuffer += `Total Billed Hours: ${totalBilled.toFixed(2)} hrs\n`;
        textBuffer += `Total Actual Hours: ${totalActual.toFixed(2)} hrs\n`;
        textBuffer += `Efficiency Variance: ${(totalBilled - totalActual).toFixed(2)} hrs\n`;
      }
      textBuffer += `=========================================\n`;
    }

    const isDemo = await dbService.isDemo();

    return NextResponse.json({
      success: true,
      timeframe,
      project: project || 'All Projects',
      tasksCount: filteredEntries.length,
      totals: { totalAllocated, totalBilled, totalActual, variance: totalBilled - totalActual },
      reportText: textBuffer,
      tasks: dailyEntries,
      isDemo
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
