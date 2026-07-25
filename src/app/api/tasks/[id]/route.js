import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, name, nickName, bill, project, source, typeOfWork, clickupId } = body;

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        message: 'Updated task status in demo mode'
      });
    }

    const db = await getDatabase();
    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch {
      queryId = id;
    }

    const existingTask = await db.collection('tasks').findOne({ _id: queryId });
    if (!existingTask) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    if (existingTask.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const updateDoc = {
      $set: {
        updatedAt: now,
      }
    };

    if (name) updateDoc.$set.name = name;
    if (nickName) updateDoc.$set.nickName = nickName;
    if (project) updateDoc.$set.project = project;
    if (source) updateDoc.$set.source = source;
    if (typeOfWork) updateDoc.$set.typeOfWork = typeOfWork;
    if (clickupId !== undefined) updateDoc.$set.clickupId = clickupId;

    if (bill) {
      updateDoc.$set.bill = {
        allocatedHours: parseFloat(bill.allocatedHours ?? existingTask.bill?.allocatedHours ?? 0),
        billedHours: parseFloat(bill.billedHours ?? existingTask.bill?.billedHours ?? 0),
        actualHours: parseFloat(bill.actualHours ?? existingTask.bill?.actualHours ?? 0),
      };
    }

    // Status Audit History tracking
    if (status && status !== existingTask.status) {
      updateDoc.$set.status = status;
      updateDoc.$push = {
        statusHistory: {
          status,
          timestamp: now.toISOString(),
          changedBy: user.name || user.username
        }
      };
    }

    await db.collection('tasks').updateOne({ _id: queryId }, updateDoc);

    const updatedTask = await db.collection('tasks').findOne({ _id: queryId });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, message: 'Deleted task in demo mode' });
    }

    const db = await getDatabase();
    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch {
      queryId = id;
    }

    const existingTask = await db.collection('tasks').findOne({ _id: queryId });
    if (!existingTask) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    if (existingTask.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await db.collection('tasks').deleteOne({ _id: queryId });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
