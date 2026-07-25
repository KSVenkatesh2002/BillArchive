import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '1w'; // '1w' or '1m'
    const project = searchParams.get('project');

    let tasks = [];

    if (!process.env.MONGODB_URI) {
      // Mock data for report preview
      tasks = [
        {
          name: 'Implement OAuth Login Flow',
          nickName: 'OAuth-Auth',
          status: 'dev',
          bill: { allocatedHours: 10, billedHours: 8, actualHours: 7.5 },
          project: 'Auth System',
          source: 'dialedin',
          typeOfWork: 'dev',
          user: 'Alex Dev',
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          name: 'QA Testing on Billing Webhooks',
          nickName: 'Bill-QA',
          status: 'ready for qa',
          bill: { allocatedHours: 6, billedHours: 6, actualHours: 5.5 },
          project: 'Invoice Engine',
          source: 'fluent',
          typeOfWork: 'qa',
          user: 'Sarah Tester',
          createdAt: new Date(Date.now() - 86400000 * 4),
        },
        {
          name: 'Database Migration to MongoDB Atlas',
          nickName: 'Atlas-DB',
          status: 'complete',
          bill: { allocatedHours: 15, billedHours: 15, actualHours: 14.0 },
          project: 'Core Infrastructure',
          source: 'dialedin',
          typeOfWork: 'dev',
          user: 'Alex Dev',
          createdAt: new Date(Date.now() - 86400000 * 6),
        }
      ];
    } else {
      const db = await getDatabase();
      const query = {};

      const now = new Date();
      if (timeframe === '1w') {
        const dateLimit = new Date();
        dateLimit.setDate(now.getDate() - 7);
        query.createdAt = { $gte: dateLimit };
      } else if (timeframe === '1m') {
        const dateLimit = new Date();
        dateLimit.setDate(now.getDate() - 30);
        query.createdAt = { $gte: dateLimit };
      }

      if (project) {
        query.project = project;
      }

      tasks = await db.collection('tasks').find(query).toArray();
    }

    // Generate formatted plain text report
    const title = project 
      ? `PROJECT REPORT: ${project.toUpperCase()}` 
      : `SUMMARY REPORT (${timeframe === '1w' ? 'Past 1 Week' : 'Past 1 Month'})`;

    let totalAllocated = 0;
    let totalBilled = 0;
    let totalActual = 0;

    let textBuffer = `=========================================\n`;
    textBuffer += `${title}\n`;
    textBuffer += `Generated: ${new Date().toLocaleDateString()}\n`;
    textBuffer += `=========================================\n\n`;

    tasks.forEach((t, index) => {
      totalAllocated += Number(t.bill?.allocatedHours || 0);
      totalBilled += Number(t.bill?.billedHours || 0);
      totalActual += Number(t.bill?.actualHours || 0);

      textBuffer += `${index + 1}. [${t.project}] ${t.name} (${t.nickName || 'N/A'})\n`;
      textBuffer += `   Status: ${t.status} | Source: ${t.source} | Work Type: ${t.typeOfWork}\n`;
      textBuffer += `   Hours -> Allocated: ${t.bill?.allocatedHours || 0}h | Billed: ${t.bill?.billedHours || 0}h | Actual: ${t.bill?.actualHours || 0}h\n`;
      if (t.statusHistory && t.statusHistory.length > 0) {
        const historyTrail = t.statusHistory.map(h => h.status).join(' -> ');
        textBuffer += `   Status Progression: ${historyTrail}\n`;
      }
      textBuffer += `-----------------------------------------\n`;
    });

    textBuffer += `\nTOTAL SUMMARY:\n`;
    textBuffer += `Total Tasks: ${tasks.length}\n`;
    textBuffer += `Total Allocated Hours: ${totalAllocated} hrs\n`;
    textBuffer += `Total Billed Hours: ${totalBilled} hrs\n`;
    textBuffer += `Total Actual Hours: ${totalActual} hrs\n`;
    textBuffer += `=========================================\n`;

    return NextResponse.json({
      success: true,
      timeframe,
      project: project || 'All Projects',
      tasksCount: tasks.length,
      totals: { totalAllocated, totalBilled, totalActual },
      reportText: textBuffer,
      tasks
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
