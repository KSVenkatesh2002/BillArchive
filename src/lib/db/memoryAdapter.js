import { CONFIG } from '../config';

// Preserve memory database state across module reloads in development
if (!global._inMemoryDb) {
  global._inMemoryDb = {
    users: [
      {
        _id: 'mock-admin-id',
        username: 'admin',
        password: '$2b$10$CYV7KUDHU8g2EmkNT1TjweTYdMz8LJuxZ9x2wkuHGkntSvTcPa7qm',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date()
      }
    ],
    sources: [
      { _id: 'source-dialedin', name: 'dialedin' },
      { _id: 'source-fluent', name: 'fluent' }
    ],
    typesOfWork: [
      { _id: 'type-dev', name: 'dev' },
      { _id: 'type-qa', name: 'qa' }
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
        source: 'source-dialedin',
        typeOfWork: 'type-dev',
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
        source: 'source-fluent',
        typeOfWork: 'type-qa',
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
        source: 'source-dialedin',
        typeOfWork: 'type-dev',
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

function ensureStoreInitialized() {
  if (!dbStore.sources) {
    dbStore.sources = [
      { _id: 'source-dialedin', name: 'dialedin' },
      { _id: 'source-fluent', name: 'fluent' }
    ];
  }
  if (!dbStore.typesOfWork) {
    dbStore.typesOfWork = [
      { _id: 'type-dev', name: 'dev' },
      { _id: 'type-qa', name: 'qa' }
    ];
  }
  if (!dbStore.organizations) {
    dbStore.organizations = [
      {
        _id: 'org-dialedin',
        name: 'DialedIn',
        slug: 'dialedin',
        dynamicFields: [
          { name: 'source', label: 'Source', type: 'dropdown', options: ['dialedin', 'fluent'], defaultValue: 'dialedin' },
          { name: 'typeOfWork', label: 'Type Of Work', type: 'dropdown', options: ['dev', 'qa'], defaultValue: 'dev' },
          { name: 'project', label: 'Project', type: 'dropdown', options: ['BillArchive'], defaultValue: 'BillArchive' }
        ]
      }
    ];
  }
}

async function normalizeMemoryTaskDoc(taskDoc) {
  ensureStoreInitialized();
  const normalized = { ...taskDoc };
  delete normalized.username;
  delete normalized.user;

  // Normalize source
  if (normalized.source) {
    const name = String(normalized.source).trim().toLowerCase();
    let found = dbStore.sources.find(s => s._id === name || s.name === name);
    if (!found) {
      found = { _id: 'source-' + Math.random().toString(36).substr(2, 9), name };
      dbStore.sources.push(found);
    }
    normalized.source = found._id;
  }

  // Normalize typeOfWork
  if (normalized.typeOfWork) {
    const name = String(normalized.typeOfWork).trim().toLowerCase();
    let found = dbStore.typesOfWork.find(t => t._id === name || t.name === name);
    if (!found) {
      found = { _id: 'type-' + Math.random().toString(36).substr(2, 9), name };
      dbStore.typesOfWork.push(found);
    }
    normalized.typeOfWork = found._id;
  }

  return normalized;
}

export const memoryAdapter = {
  isDemoMode: true,

  async connect() {
    return true;
  },

  async findUserByUsername(username) {
    ensureStoreInitialized();
    const user = dbStore.users.find(u => u.username === username.toLowerCase());
    if (user) {
      if (!user.organization) {
        user.organization = 'org-dialedin';
      }
      const org = dbStore.organizations.find(o => o._id === user.organization);
      return {
        ...user,
        organization: org ? { ...org } : null
      };
    }
    return null;
  },

  async createUser(userDoc) {
    ensureStoreInitialized();
    const newUser = {
      _id: 'mem-' + Math.random().toString(36).substr(2, 9),
      ...userDoc,
      organization: userDoc.organization || 'org-dialedin',
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
    ensureStoreInitialized();
    let filtered = [...dbStore.tasks];

    if (query.userId) {
      filtered = filtered.filter(t => t.userId.toString() === query.userId.toString());
    }

    if (query.source && query.source !== 'all') {
      const qSource = query.source.toLowerCase();
      filtered = filtered.filter(t => {
        const val = (t.source || t.dynamicValues?.source || '').toLowerCase();
        const sDoc = dbStore.sources.find(s => s._id === t.source);
        const sourceName = sDoc ? sDoc.name.toLowerCase() : '';
        return val === qSource || sourceName === qSource || t.source === query.source;
      });
    }

    if (query.project && query.project !== 'all') {
      filtered = filtered.filter(t => {
        const pVal = (t.project || t.dynamicValues?.project || '').toLowerCase();
        return pVal === query.project.toLowerCase();
      });
    }

    if (query.typeOfWork && query.typeOfWork !== 'all') {
      const qType = query.typeOfWork.toLowerCase();
      filtered = filtered.filter(t => {
        const val = (t.typeOfWork || t.dynamicValues?.typeOfWork || '').toLowerCase();
        const tDoc = dbStore.typesOfWork.find(s => s._id === t.typeOfWork);
        const typeName = tDoc ? tDoc.name.toLowerCase() : '';
        return val === qType || typeName === qType || t.typeOfWork === query.typeOfWork;
      });
    }

    if (query.createdAt && query.createdAt.$gte) {
      const gteDate = new Date(query.createdAt.$gte);
      filtered = filtered.filter(t => new Date(t.createdAt) >= gteDate);
    }

    // Filter by custom dynamic fields
    Object.keys(query).forEach(key => {
      if (key !== 'userId' && key !== 'project' && key !== 'source' && key !== 'typeOfWork' && key !== 'createdAt') {
        const val = query[key];
        if (val && val !== 'all') {
          const fieldName = key.startsWith('dynamicValues.') ? key.split('.')[1] : key;
          filtered = filtered.filter(t => {
            const tVal = t.dynamicValues?.[fieldName] !== undefined ? t.dynamicValues[fieldName] : t[fieldName];
            return String(tVal).toLowerCase() === String(val).toLowerCase();
          });
        }
      }
    });

    // Metrics calculation
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

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const skip = options.skip || 0;
    const limit = options.limit || 15;
    const paginated = filtered.slice(skip, skip + limit);

    const populatedTasks = paginated.map(t => {
      const u = dbStore.users.find(usr => usr._id.toString() === t.userId.toString());
      const s = dbStore.sources.find(src => src._id === t.source);
      const tow = dbStore.typesOfWork.find(type => type._id === t.typeOfWork);
      return {
        ...t,
        _id: t._id.toString(),
        userId: t.userId.toString(),
        source: s ? s.name : (t.source || ''),
        sourceId: t.source || '',
        typeOfWork: tow ? tow.name : (t.typeOfWork || ''),
        typeOfWorkId: t.typeOfWork || '',
        username: u ? u.username : '',
        user: u ? u.name : ''
      };
    });

    return {
      tasks: populatedTasks,
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
    const normalized = await normalizeMemoryTaskDoc(taskDoc);
    const newTask = {
      _id: 'mem-task-' + Math.random().toString(36).substr(2, 9),
      ...normalized,
      createdAt: normalized.createdAt || new Date(),
      updatedAt: normalized.updatedAt || new Date()
    };
    dbStore.tasks.push(newTask);
    return { ...newTask };
  },

  async findTaskById(id) {
    ensureStoreInitialized();
    const t = dbStore.tasks.find(tk => tk._id.toString() === id.toString());
    if (!t) return null;

    const u = dbStore.users.find(usr => usr._id.toString() === t.userId.toString());
    const s = dbStore.sources.find(src => src._id === t.source);
    const tow = dbStore.typesOfWork.find(type => type._id === t.typeOfWork);

    return {
      ...t,
      _id: t._id.toString(),
      userId: t.userId.toString(),
      source: s ? s.name : (t.source || ''),
      sourceId: t.source || '',
      typeOfWork: tow ? tow.name : (t.typeOfWork || ''),
      typeOfWorkId: t.typeOfWork || '',
      username: u ? u.username : '',
      user: u ? u.name : ''
    };
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

    const normalized = await normalizeMemoryTaskDoc(updated);
    normalized.updatedAt = new Date();
    dbStore.tasks[idx] = normalized;

    return this.findTaskById(id);
  },

  async deleteTask(id) {
    const idx = dbStore.tasks.findIndex(t => t._id.toString() === id.toString());
    if (idx === -1) return false;
    dbStore.tasks.splice(idx, 1);
    return true;
  },

  async findBills() {
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
  },

  async getSources() {
    ensureStoreInitialized();
    return [...dbStore.sources];
  },

  async getTypesOfWork() {
    ensureStoreInitialized();
    return [...dbStore.typesOfWork];
  },

  async findOrganizationById(id) {
    ensureStoreInitialized();
    const org = dbStore.organizations.find(o => o._id === id);
    return org ? { ...org } : null;
  },

  async findOrganizationBySlug(slug) {
    ensureStoreInitialized();
    const org = dbStore.organizations.find(o => o.slug === slug.toLowerCase());
    return org ? { ...org } : null;
  },

  async createOrganization(orgDoc) {
    ensureStoreInitialized();
    const newOrg = {
      _id: 'org-' + Math.random().toString(36).substr(2, 9),
      ...orgDoc,
      slug: orgDoc.slug.toLowerCase(),
      createdAt: orgDoc.createdAt || new Date()
    };
    dbStore.organizations.push(newOrg);
    return { ...newOrg };
  },

  async updateOrganizationConfig(id, dynamicFields, enabledFields) {
    ensureStoreInitialized();
    const idx = dbStore.organizations.findIndex(o => o._id === id);
    if (idx === -1) return null;
    dbStore.organizations[idx] = {
      ...dbStore.organizations[idx],
      dynamicFields,
      ...(enabledFields ? { enabledFields } : {}),
      updatedAt: new Date()
    };
    return { ...dbStore.organizations[idx] };
  },

  async getOrganizations() {
    ensureStoreInitialized();
    return dbStore.organizations.map(o => ({ ...o }));
  }
};
