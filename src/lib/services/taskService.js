import { dbService } from '../db/dbService';
import { CONFIG } from '../config';

export const taskService = {
  /**
   * Find tasks with pagination, filters, and metrics
   */
  async getTasks(userId, filters = {}, pagination = {}) {
    const query = { userId };
    const { source, project, typeOfWork, timeframe, ...customFilters } = filters;

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

    // Apply custom dynamic fields filters
    Object.entries(customFilters).forEach(([key, val]) => {
      if (val && val !== 'all') {
        query[`dynamicValues.${key}`] = val;
      }
    });

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
   * Get single task by ID
   */
  async getTaskById(taskId) {
    const task = await dbService.findTaskById(taskId);
    if (!task) throw new Error('Task not found');
    return { success: true, task };
  },

  /**
   * Create a new task
   */
  async createTask(userId, username, name, taskData) {
    const { name: taskName, nickName, status, bill, project, clickupId, dynamicValues, workDate } = taskData;

    if (!taskName) {
      throw new Error('Task name is required');
    }

    const validStatuses = await dbService.getStatuses();
    const initialStatus = validStatuses.includes(status) ? status : (validStatuses[0] || 'inprocess');
    const now = new Date();
    const taskWorkDate = workDate ? new Date(workDate) : now;

    const dbUser = await dbService.findUserByUsername(username);
    const orgId = dbUser?.organization?._id || dbUser?.organization || null;

    const initialAlloc = parseFloat(bill?.allocatedHours || 0);
    const initialBilled = parseFloat(bill?.billedHours || 0);
    const initialActual = parseFloat(bill?.actualHours || 0);
    const initialEntries = [];

    if (initialAlloc > 0 || initialBilled > 0 || initialActual > 0) {
      initialEntries.push({
        date: taskWorkDate,
        allocatedHours: initialAlloc,
        billedHours: initialBilled,
        actualHours: initialActual,
        note: 'Initial hours logged',
        loggedBy: name || username
      });
    }

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
      workDate: taskWorkDate,
      timeEntries: initialEntries,
      bill: {
        allocatedHours: initialAlloc,
        billedHours: initialBilled,
        actualHours: initialActual,
      },
      project: project || '',
      userId,
      username,
      user: name,
      organization: orgId,
      dynamicValues: dynamicValues || {},
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

    const { status, name, nickName, bill, project, clickupId, dynamicValues, workDate } = updateData;
    const now = new Date();
    
    const updateDoc = {
      $set: {
        updatedAt: now,
      }
    };

    if (name) updateDoc.$set.name = name;
    if (nickName !== undefined) updateDoc.$set.nickName = nickName;
    if (project) updateDoc.$set.project = project;
    if (clickupId !== undefined) updateDoc.$set.clickupId = clickupId;
    if (dynamicValues) updateDoc.$set.dynamicValues = dynamicValues;
    if (workDate) updateDoc.$set.workDate = new Date(workDate);

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
   * Add a Time Entry to a task
   */
  async addTimeEntry(taskId, userId, userNameOrUsername, entryData) {
    const existingTask = await dbService.findTaskById(taskId);
    if (!existingTask) throw new Error('Task not found');

    const entryDate = entryData.date ? new Date(entryData.date) : new Date();
    const allocated = parseFloat(entryData.allocatedHours || 0);
    const billed = parseFloat(entryData.billedHours || 0);
    const actual = parseFloat(entryData.actualHours || 0);

    const newEntry = {
      date: entryDate,
      allocatedHours: allocated,
      billedHours: billed,
      actualHours: actual,
      note: entryData.note || '',
      loggedBy: userNameOrUsername
    };

    const updatedEntries = [...(existingTask.timeEntries || []), newEntry];
    
    // Recalculate bill totals
    const totalAllocated = updatedEntries.reduce((sum, e) => sum + (e.allocatedHours || 0), 0);
    const totalBilled = updatedEntries.reduce((sum, e) => sum + (e.billedHours || 0), 0);
    const totalActual = updatedEntries.reduce((sum, e) => sum + (e.actualHours || 0), 0);

    const updateDoc = {
      $set: {
        timeEntries: updatedEntries,
        bill: {
          allocatedHours: totalAllocated,
          billedHours: totalBilled,
          actualHours: totalActual
        },
        updatedAt: new Date()
      }
    };

    const updatedTask = await dbService.updateTask(taskId, updateDoc);
    return { success: true, task: updatedTask };
  },

  /**
   * Delete a Time Entry from a task
   */
  async deleteTimeEntry(taskId, entryId, userId) {
    const existingTask = await dbService.findTaskById(taskId);
    if (!existingTask) throw new Error('Task not found');

    const updatedEntries = (existingTask.timeEntries || []).filter(e => e._id.toString() !== entryId);

    const totalAllocated = updatedEntries.reduce((sum, e) => sum + (e.allocatedHours || 0), 0);
    const totalBilled = updatedEntries.reduce((sum, e) => sum + (e.billedHours || 0), 0);
    const totalActual = updatedEntries.reduce((sum, e) => sum + (e.actualHours || 0), 0);

    const updateDoc = {
      $set: {
        timeEntries: updatedEntries,
        bill: {
          allocatedHours: totalAllocated,
          billedHours: totalBilled,
          actualHours: totalActual
        },
        updatedAt: new Date()
      }
    };

    const updatedTask = await dbService.updateTask(taskId, updateDoc);
    return { success: true, task: updatedTask };
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
