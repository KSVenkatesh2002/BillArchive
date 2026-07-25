import { CONFIG } from '../config';

// Preserve memory database state across module reloads in development
if (!global._inMemoryDb) {
  // Hash the default password 'admin' using bcrypt or simulate it.
  // Since bcryptjs is async, we store the plaintext/hashed info.
  // We can seed: admin / admin (hashed using a known hash, or we'll let comparison match it)
  global._inMemoryDb = {
    users: [
      {
        _id: 'mock-admin-id',
        username: 'admin',
        // pre-hashed '$2b$10$CYV7KUDHU8g2EmkNT1TjweTYdMz8LJuxZ9x2wkuHGkntSvTcPa7qm' which is 'admin'
        password: '$2b$10$CYV7KUDHU8g2EmkNT1TjweTYdMz8LJuxZ9x2wkuHGkntSvTcPa7qm',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date()
      }
    ],
    tasks: [
      {
        _id: 'demo-task-1',
        name: 'Implement OAuth Login Flow',
        nickName: 'OAuth-Auth',
        status: 'dev',
        statusHistory: [
          { status: 'inprocess', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), changedBy: 'Admin User' },
          { status: 'dev', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), changedBy: 'Admin User' }
        ],
        bill: { allocatedHours: 10, billedHours: 8, actualHours: 7.5 },
        project: 'Auth System',
        source: 'dialedin',
        typeOfWork: 'dev',
        user: 'Admin User',
        userId: 'mock-admin-id',
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 86400000 * 1)
      },
      {
        _id: 'demo-task-2',
        name: 'QA Testing on Billing Webhooks',
        nickName: 'Bill-QA',
        status: 'ready for qa',
        statusHistory: [
          { status: 'inprocess', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), changedBy: 'Admin User' },
          { status: 'dev', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), changedBy: 'Admin User' },
          { status: 'ready for qa', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), changedBy: 'Admin User' }
        ],
        bill: { allocatedHours: 6, billedHours: 6, actualHours: 5.5 },
        project: 'Invoice Engine',
        source: 'fluent',
        typeOfWork: 'qa',
        user: 'Admin User',
        userId: 'mock-admin-id',
        createdAt: new Date(Date.now() - 86400000 * 5),
        updatedAt: new Date(Date.now() - 86400000 * 1)
      },
      {
        _id: 'demo-task-3',
        name: 'Database Migration to MongoDB Atlas',
        nickName: 'Atlas-DB',
        status: 'complete',
        statusHistory: [
          { status: 'inprocess', timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), changedBy: 'Admin User' },
          { status: 'dev', timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), changedBy: 'Admin User' },
          { status: 'ready for code review', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), changedBy: 'Admin User' },
          { status: 'code review complete', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), changedBy: 'Admin User' },
          { status: 'complete', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), changedBy: 'Admin User' }
        ],
        bill: { allocatedHours: 15, billedHours: 15, actualHours: 14.0 },
        project: 'Core Infrastructure',
        source: 'dialedin',
        typeOfWork: 'dev',
        user: 'Admin User',
        userId: 'mock-admin-id',
        createdAt: new Date(Date.now() - 86400000 * 10),
        updatedAt: new Date(Date.now() - 86400000 * 1)
      }
    ],
    bills: [
      { _id: 'demo-1', title: 'Hosting Subscription - Vercel', clientName: 'Acme Corp', amount: 49.00, status: 'Paid', date: '2026-07-20', createdAt: new Date() },
      { _id: 'demo-2', title: 'UI/UX Design Retainer', clientName: 'Starlight Inc', amount: 1200.00, status: 'Pending', date: '2026-07-24', createdAt: new Date() },
      { _id: 'demo-3', title: 'Database Optimization', clientName: 'Global Cloud', amount: 450.00, status: 'Overdue', date: '2026-07-15', createdAt: new Date() }
    ]
  };
}

const dbStore = global._inMemoryDb;

export const memoryAdapter = {
  isDemoMode: true,

  async connect() {
    // Memory adapter is always connected
    return true;
  },

  async findUserByUsername(username) {
    const user = dbStore.users.find(u => u.username === username.toLowerCase());
    return user ? { ...user } : null;
  },

  async createUser(userDoc) {
    const newUser = {
      _id: 'mem-' + Math.random().toString(36).substr(2, 9),
      ...userDoc,
      createdAt: userDoc.createdAt || new Date()
    };
    dbStore.users.push(newUser);
    return { ...newUser };
  },

  async findUsers() {
    return dbStore.users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
  },

  async findTasks(query = {}, options = {}) {
    let filtered = [...dbStore.tasks];

    // Filter by userId if set (auth scope)
    if (query.userId) {
      filtered = filtered.filter(t => t.userId === query.userId);
    }

    if (query.source) {
      filtered = filtered.filter(t => t.source === query.source);
    }

    if (query.project) {
      filtered = filtered.filter(t => t.project.toLowerCase() === query.project.toLowerCase());
    }

    if (query.typeOfWork) {
      filtered = filtered.filter(t => t.typeOfWork === query.typeOfWork);
    }

    if (query.createdAt && query.createdAt.$gte) {
      const gteDate = new Date(query.createdAt.$gte);
      filtered = filtered.filter(t => new Date(t.createdAt) >= gteDate);
    }

    // Calculate metrics on all MATCHING tasks (before pagination)
    let totalAllocated = 0;
    let totalBilled = 0;
    let totalActual = 0;
    let completedCount = 0;

    filtered.forEach(t => {
      totalAllocated += Number(t.bill?.allocatedHours || 0);
      totalBilled += Number(t.bill?.billedHours || 0);
      totalActual += Number(t.bill?.actualHours || 0);
      if (t.status === 'complete') completedCount++;
    });

    // Sort: newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const skip = options.skip || 0;
    const limit = options.limit || 15;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      tasks: paginated.map(t => ({ ...t, _id: t._id.toString() })),
      hasMore: skip + paginated.length < filtered.length,
      metrics: {
        totalAllocated,
        totalBilled,
        totalActual,
        completedCount,
        variance: totalBilled - totalActual
      }
    };
  },

  async createTask(taskDoc) {
    const newTask = {
      _id: 'mem-task-' + Math.random().toString(36).substr(2, 9),
      ...taskDoc,
      createdAt: taskDoc.createdAt || new Date(),
      updatedAt: taskDoc.updatedAt || new Date()
    };
    dbStore.tasks.push(newTask);
    return { ...newTask };
  },

  async findTaskById(id) {
    const task = dbStore.tasks.find(t => t._id.toString() === id.toString());
    return task ? { ...task } : null;
  },

  async updateTask(id, updateDoc) {
    const idx = dbStore.tasks.findIndex(t => t._id.toString() === id.toString());
    if (idx === -1) return null;

    const task = dbStore.tasks[idx];
    const updated = { ...task };

    if (updateDoc.$set) {
      Object.assign(updated, updateDoc.$set);
    }
    if (updateDoc.$push && updateDoc.$push.statusHistory) {
      updated.statusHistory = [...(updated.statusHistory || []), updateDoc.$push.statusHistory];
    }

    updated.updatedAt = new Date();
    dbStore.tasks[idx] = updated;
    return { ...updated };
  },

  async deleteTask(id) {
    const idx = dbStore.tasks.findIndex(t => t._id.toString() === id.toString());
    if (idx === -1) return false;
    dbStore.tasks.splice(idx, 1);
    return true;
  },

  async findBills() {
    // Sort by createdAt desc
    const sorted = [...dbStore.bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted.map(b => ({ ...b }));
  },

  async createBill(billDoc) {
    const newBill = {
      _id: 'mem-bill-' + Math.random().toString(36).substr(2, 9),
      ...billDoc,
      createdAt: billDoc.createdAt || new Date()
    };
    dbStore.bills.push(newBill);
    return { ...newBill };
  },

  async updateUser(id, updateDoc) {
    const idx = dbStore.users.findIndex(u => u._id.toString() === id.toString());
    if (idx === -1) return null;
    
    // Apply updates ($set or directly)
    const updates = updateDoc.$set ? updateDoc.$set : updateDoc;
    dbStore.users[idx] = {
      ...dbStore.users[idx],
      ...updates,
      updatedAt: new Date()
    };
    return { ...dbStore.users[idx] };
  },

  async getStatuses() {
    if (!dbStore.statuses) {
      dbStore.statuses = [...CONFIG.VALID_STATUSES];
    }
    return [...dbStore.statuses];
  },

  async saveStatuses(list) {
    dbStore.statuses = [...list];
    return [...dbStore.statuses];
  },

  async getUserProjects(userId) {
    const user = dbStore.users.find(u => u._id.toString() === userId.toString());
    return user?.projects || [];
  },

  async addUserProject(userId, projectName) {
    const user = dbStore.users.find(u => u._id.toString() === userId.toString());
    if (user) {
      if (!user.projects) user.projects = [];
      if (!user.projects.includes(projectName)) {
        user.projects.push(projectName);
      }
    }
    return true;
  }
};
