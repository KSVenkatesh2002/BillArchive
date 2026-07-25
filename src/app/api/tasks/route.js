import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';

const VALID_STATUSES = [
  'inprocess',
  'dev',
  'ready for qa',
  'qa complete',
  'ready for code review',
  'code review complete',
  'complete',
  'need approval'
];

export async function GET(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: true, tasks: [], message: 'Not logged in' });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const project = searchParams.get('project');
    const typeOfWork = searchParams.get('typeOfWork');
    const timeframe = searchParams.get('timeframe'); // '1w', '1m', or all

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    // Demo Mode check if MongoDB URI is missing
    if (!process.env.MONGODB_URI) {
      const demoTasks = [
        {
          _id: 'demo-task-1',
          name: 'Implement OAuth Login Flow',
          nickName: 'OAuth-Auth',
          status: 'dev',
          statusHistory: [
            { status: 'inprocess', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
            { status: 'dev', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() }
          ],
          bill: { allocatedHours: 10, billedHours: 8, actualHours: 7.5 },
          project: 'Auth System',
          source: 'dialedin',
          typeOfWork: 'dev',
          user: user.name || 'Demo User',
          userId: user.userId || 'demo-user',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          _id: 'demo-task-2',
          name: 'QA Testing on Billing Webhooks',
          nickName: 'Bill-QA',
          status: 'ready for qa',
          statusHistory: [
            { status: 'inprocess', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
            { status: 'dev', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
            { status: 'ready for qa', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() }
          ],
          bill: { allocatedHours: 6, billedHours: 6, actualHours: 5.5 },
          project: 'Invoice Engine',
          source: 'fluent',
          typeOfWork: 'qa',
          user: user.name || 'Demo User',
          userId: user.userId || 'demo-user',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          _id: 'demo-task-3',
          name: 'Database Migration to MongoDB Atlas',
          nickName: 'Atlas-DB',
          status: 'complete',
          statusHistory: [
            { status: 'inprocess', timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
            { status: 'dev', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
            { status: 'ready for code review', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
            { status: 'code review complete', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
            { status: 'complete', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() }
          ],
          bill: { allocatedHours: 15, billedHours: 15, actualHours: 14.0 },
          project: 'Core Infrastructure',
          source: 'dialedin',
          typeOfWork: 'dev',
          user: user.name || 'Demo User',
          userId: user.userId || 'demo-user',
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        }
      ];

      const paginatedDemo = demoTasks.slice(skip, skip + limit);
      let totalAllocated = 0, totalBilled = 0, totalActual = 0, completedCount = 0;
      demoTasks.forEach(t => {
        totalAllocated += Number(t.bill?.allocatedHours || 0);
        totalBilled += Number(t.bill?.billedHours || 0);
        totalActual += Number(t.bill?.actualHours || 0);
        if (t.status === 'complete') completedCount++;
      });

      return NextResponse.json({
        success: true,
        tasks: paginatedDemo,
        hasMore: skip + paginatedDemo.length < demoTasks.length,
        metrics: {
          totalAllocated,
          totalBilled,
          totalActual,
          completedCount,
          variance: totalBilled - totalActual
        },
        isDemo: true
      });
    }

    const db = await getDatabase();
    const query = { userId: user.userId };

    if (source) query.source = source;
    if (project) query.project = project;
    if (typeOfWork) query.typeOfWork = typeOfWork;

    if (timeframe === '1w') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.createdAt = { $gte: oneWeekAgo };
    } else if (timeframe === '1m') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      query.createdAt = { $gte: oneMonthAgo };
    }

    const allMatchingTasks = await db.collection('tasks').find(query).toArray();
    let totalAllocated = 0, totalBilled = 0, totalActual = 0, completedCount = 0;
    allMatchingTasks.forEach(t => {
      totalAllocated += Number(t.bill?.allocatedHours || 0);
      totalBilled += Number(t.bill?.billedHours || 0);
      totalActual += Number(t.bill?.actualHours || 0);
      if (t.status === 'complete') completedCount++;
    });

    const tasks = await db.collection('tasks')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      tasks,
      hasMore: skip + tasks.length < allMatchingTasks.length,
      metrics: {
        totalAllocated,
        totalBilled,
        totalActual,
        completedCount,
        variance: totalBilled - totalActual
      },
      isDemo: false
    });
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
    const { name, nickName, status, bill, project, source, typeOfWork, clickupId } = body;

    if (!name || !project) {
      return NextResponse.json(
        { success: false, error: 'Task name and project are required' },
        { status: 400 }
      );
    }

    const initialStatus = VALID_STATUSES.includes(status) ? status : 'inprocess';
    const now = new Date();

    const newTask = {
      name,
      nickName: nickName || name,
      clickupId: clickupId || '',
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: now.toISOString(),
          changedBy: user.name || user.username
        }
      ],
      bill: {
        allocatedHours: parseFloat(bill?.allocatedHours || 0),
        billedHours: parseFloat(bill?.billedHours || 0),
        actualHours: parseFloat(bill?.actualHours || 0),
      },
      project,
      source: source === 'fluent' ? 'fluent' : 'dialedin',
      typeOfWork: typeOfWork === 'qa' ? 'qa' : 'dev',
      userId: user.userId,
      username: user.username,
      user: user.name,
      createdAt: now,
      updatedAt: now,
    };

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        task: { _id: 'demo-' + Date.now(), ...newTask },
        isDemo: true,
        message: 'Demo task created locally (Connect MONGODB_URI for persistence).'
      });
    }

    const db = await getDatabase();
    const result = await db.collection('tasks').insertOne(newTask);

    return NextResponse.json({
      success: true,
      task: { _id: result.insertedId, ...newTask }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
