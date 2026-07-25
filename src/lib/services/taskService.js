import { dbService } from '../db/dbService';
import { CONFIG } from '../config';

export const taskService = {
  /**
   * Find tasks with pagination, filters, and metrics
   */
  async getTasks(userId, filters = {}, pagination = {}) {
    const query = { userId };
    const { source, project, typeOfWork, timeframe } = filters;

    if (source && source !== 'all') query.source = source;
    if (project && project !== 'all') query.project = project;
    if (typeOfWork && typeOfWork !== 'all') query.typeOfWork = typeOfWork;

    if (timeframe === '1w') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.createdAt = { $gte: oneWeekAgo };
    } else if (timeframe === '1m') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      query.createdAt = { $gte: oneMonthAgo };
    }

    const page = parseInt(pagination.page || '1');
    const limit = parseInt(pagination.limit || '15');
    const skip = (page - 1) * limit;

    const result = await dbService.findTasks(query, { skip, limit });
    const isDemo = await dbService.isDemo();

    return {
      success: true,
      tasks: result.tasks,
      hasMore: result.hasMore,
      metrics: result.metrics,
      isDemo
    };
  },

  /**
   * Create a new task
   */
  async createTask(userId, username, name, taskData) {
    const { name: taskName, nickName, status, bill, project, source, typeOfWork, clickupId } = taskData;

    if (!taskName || !project) {
      throw new Error('Task name and project are required');
    }

    const validStatuses = await dbService.getStatuses();
    const initialStatus = validStatuses.includes(status) ? status : (validStatuses[0] || 'inprocess');
    const now = new Date();

    const newTask = {
      name: taskName,
      nickName: nickName || '',
      clickupId: clickupId || '',
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: now.toISOString(),
          changedBy: name || username
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
      userId,
      username,
      user: name,
      createdAt: now,
      updatedAt: now,
    };

    const created = await dbService.createTask(newTask);
    const isDemo = await dbService.isDemo();

    return {
      success: true,
      task: created,
      isDemo
    };
  },

  /**
   * Update an existing task
   */
  async updateTask(taskId, userId, userNameOrUsername, updateData) {
    const existingTask = await dbService.findTaskById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    // Authorization check
    if (existingTask.userId !== userId) {
      throw new Error('Forbidden');
    }

    const { status, name, nickName, bill, project, source, typeOfWork, clickupId } = updateData;
    const now = new Date();
    
    const updateDoc = {
      $set: {
        updatedAt: now,
      }
    };

    if (name) updateDoc.$set.name = name;
    if (nickName !== undefined) updateDoc.$set.nickName = nickName;
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
      const validStatuses = await dbService.getStatuses();
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
      }
      updateDoc.$set.status = status;
      updateDoc.$push = {
        statusHistory: {
          status,
          timestamp: now.toISOString(),
          changedBy: userNameOrUsername
        }
      };
    }

    const updatedTask = await dbService.updateTask(taskId, updateDoc);
    return {
      success: true,
      task: updatedTask
    };
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId, userId) {
    const existingTask = await dbService.findTaskById(taskId);
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    if (existingTask.userId !== userId) {
      throw new Error('Forbidden');
    }

    const deleted = await dbService.deleteTask(taskId);
    return {
      success: deleted
    };
  }
};
