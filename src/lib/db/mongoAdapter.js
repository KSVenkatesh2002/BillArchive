import { MongoClient, ObjectId } from 'mongodb';
import { CONFIG } from '../config';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || CONFIG.DEFAULT_DB_NAME;
const options = {
  serverSelectionTimeoutMS: 5000 // fail fast if server is unreachable
};

let client;
let clientPromise;

function getClientPromise() {
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables.');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    return client.connect();
  }
}

async function getDb() {
  const conn = await getClientPromise();
  return conn.db(dbName);
}

function castId(id) {
  try {
    if (id instanceof ObjectId) return id;
    return new ObjectId(id);
  } catch {
    return id;
  }
}

async function normalizeTaskDoc(taskDoc) {
  const db = await getDb();
  const normalized = { ...taskDoc };

  // 1. Cast userId to ObjectId
  if (normalized.userId) {
    normalized.userId = castId(normalized.userId);
  }

  // 2. Remove duplicate user/username fields
  delete normalized.username;
  delete normalized.user;

  // 3. Normalize source
  if (normalized.source) {
    let sourceId = null;
    try {
      if (typeof normalized.source === 'string' && normalized.source.length === 24) {
        sourceId = castId(normalized.source);
      }
    } catch {}

    if (!sourceId) {
      // Find or create source by name
      const name = String(normalized.source).trim().toLowerCase();
      let doc = await db.collection('sources').findOne({ name });
      if (!doc) {
        const res = await db.collection('sources').insertOne({ name });
        sourceId = res.insertedId;
      } else {
        sourceId = doc._id;
      }
    }
    normalized.source = sourceId;
  }

  // 4. Normalize typeOfWork
  if (normalized.typeOfWork) {
    let typeId = null;
    try {
      if (typeof normalized.typeOfWork === 'string' && normalized.typeOfWork.length === 24) {
        typeId = castId(normalized.typeOfWork);
      }
    } catch {}

    if (!typeId) {
      // Find or create typeOfWork by name
      const name = String(normalized.typeOfWork).trim().toLowerCase();
      let doc = await db.collection('types_of_work').findOne({ name });
      if (!doc) {
        const res = await db.collection('types_of_work').insertOne({ name });
        typeId = res.insertedId;
      } else {
        typeId = doc._id;
      }
    }
    normalized.typeOfWork = typeId;
  }

  return normalized;
}

async function normalizeUpdateDoc(updateDoc) {
  const db = await getDb();
  const normalized = { ...updateDoc };
  if (!normalized.$set) return normalized;

  // 1. Cast userId
  if (normalized.$set.userId) {
    normalized.$set.userId = castId(normalized.$set.userId);
  }

  // Remove username/user
  delete normalized.$set.username;
  delete normalized.$set.user;

  // 2. Normalize source
  if (normalized.$set.source) {
    let sourceId = null;
    try {
      if (typeof normalized.$set.source === 'string' && normalized.$set.source.length === 24) {
        sourceId = castId(normalized.$set.source);
      }
    } catch {}

    if (!sourceId) {
      const name = String(normalized.$set.source).trim().toLowerCase();
      let doc = await db.collection('sources').findOne({ name });
      if (!doc) {
        const res = await db.collection('sources').insertOne({ name });
        sourceId = res.insertedId;
      } else {
        sourceId = doc._id;
      }
    }
    normalized.$set.source = sourceId;
  }

  // 3. Normalize typeOfWork
  if (normalized.$set.typeOfWork) {
    let typeId = null;
    try {
      if (typeof normalized.$set.typeOfWork === 'string' && normalized.$set.typeOfWork.length === 24) {
        typeId = castId(normalized.$set.typeOfWork);
      }
    } catch {}

    if (!typeId) {
      const name = String(normalized.$set.typeOfWork).trim().toLowerCase();
      let doc = await db.collection('types_of_work').findOne({ name });
      if (!doc) {
        const res = await db.collection('types_of_work').insertOne({ name });
        typeId = res.insertedId;
      } else {
        typeId = doc._id;
      }
    }
    normalized.$set.typeOfWork = typeId;
  }

  return normalized;
}

export const mongoAdapter = {
  isDemoMode: false,

  async connect() {
    try {
      await getClientPromise();
      return true;
    } catch (err) {
      console.error('MongoDB Connection Error:', err.message);
      throw err;
    }
  },

  async findUserByUsername(username) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ username: username.toLowerCase() });
    return user;
  },

  async findUsers() {
    const db = await getDb();
    const users = await db.collection('users').find({}, { projection: { passwordHash: 0 } }).toArray();
    return users.map(u => ({ ...u, _id: u._id.toString() }));
  },

  async createUser(userDoc) {
    const db = await getDb();
    const result = await db.collection('users').insertOne({
      ...userDoc,
      createdAt: userDoc.createdAt || new Date()
    });
    return {
      _id: result.insertedId,
      ...userDoc
    };
  },

  async findTasks(query = {}, options = {}) {
    const db = await getDb();
    
    // Construct query object
    const mongoQuery = {};
    if (query.userId) mongoQuery.userId = castId(query.userId);
    if (query.project) mongoQuery.project = query.project;
    if (query.createdAt) mongoQuery.createdAt = query.createdAt;

    // Handle source filter (ID or name lookup)
    if (query.source && query.source !== 'all') {
      let sourceId = null;
      try {
        if (typeof query.source === 'string' && query.source.length === 24) {
          sourceId = castId(query.source);
        }
      } catch {}

      if (!sourceId) {
        const doc = await db.collection('sources').findOne({ name: query.source.toLowerCase() });
        if (doc) sourceId = doc._id;
      }

      if (sourceId) {
        mongoQuery.source = sourceId;
      } else {
        mongoQuery.source = new ObjectId(); // force no matches
      }
    }

    // Handle typeOfWork filter (ID or name lookup)
    if (query.typeOfWork && query.typeOfWork !== 'all') {
      let typeId = null;
      try {
        if (typeof query.typeOfWork === 'string' && query.typeOfWork.length === 24) {
          typeId = castId(query.typeOfWork);
        }
      } catch {}

      if (!typeId) {
        const doc = await db.collection('types_of_work').findOne({ name: query.typeOfWork.toLowerCase() });
        if (doc) typeId = doc._id;
      }

      if (typeId) {
        mongoQuery.typeOfWork = typeId;
      } else {
        mongoQuery.typeOfWork = new ObjectId(); // force no matches
      }
    }

    // aggregation pipeline to lookup related collections
    const pipeline = [
      { $match: mongoQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'sources',
          localField: 'source',
          foreignField: '_id',
          as: 'sourceDetails'
        }
      },
      { $unwind: { path: '$sourceDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'types_of_work',
          localField: 'typeOfWork',
          foreignField: '_id',
          as: 'typeDetails'
        }
      },
      { $unwind: { path: '$typeDetails', preserveNullAndEmptyArrays: true } }
    ];

    // Fetch all matching tasks for metrics calculation
    const allMatching = await db.collection('tasks').aggregate(pipeline).toArray();
    
    let totalAllocated = 0;
    let totalBilled = 0;
    let totalActual = 0;
    let completedCount = 0;

    allMatching.forEach(t => {
      totalAllocated += Number(t.bill?.allocatedHours || 0);
      totalBilled += Number(t.bill?.billedHours || 0);
      totalActual += Number(t.bill?.actualHours || 0);
      if (t.status === 'complete') completedCount++;
    });

    const skip = options.skip || 0;
    const limit = options.limit || 15;

    const tasks = await db.collection('tasks')
      .aggregate([
        ...pipeline,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ])
      .toArray();

    return {
      tasks: tasks.map(t => ({
        ...t,
        _id: t._id.toString(),
        userId: t.userId ? t.userId.toString() : '',
        source: t.sourceDetails ? t.sourceDetails.name : (t.source ? t.source.toString() : ''),
        sourceId: t.source ? t.source.toString() : '',
        typeOfWork: t.typeDetails ? t.typeDetails.name : (t.typeOfWork ? t.typeOfWork.toString() : ''),
        typeOfWorkId: t.typeOfWork ? t.typeOfWork.toString() : '',
        username: t.userDetails ? t.userDetails.username : '',
        user: t.userDetails ? t.userDetails.name : '',
        userDetails: undefined,
        sourceDetails: undefined,
        typeDetails: undefined
      })),
      hasMore: skip + tasks.length < allMatching.length,
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
    const db = await getDb();
    const normalized = await normalizeTaskDoc(taskDoc);
    const result = await db.collection('tasks').insertOne({
      ...normalized,
      createdAt: normalized.createdAt || new Date(),
      updatedAt: normalized.updatedAt || new Date()
    });
    return {
      _id: result.insertedId.toString(),
      ...normalized
    };
  },

  async findTaskById(id) {
    const db = await getDb();
    const task = await db.collection('tasks').findOne({ _id: castId(id) });
    if (!task) return null;

    const userDetails = await db.collection('users').findOne({ _id: castId(task.userId) });
    const sourceDetails = task.source ? await db.collection('sources').findOne({ _id: castId(task.source) }) : null;
    const typeDetails = task.typeOfWork ? await db.collection('types_of_work').findOne({ _id: castId(task.typeOfWork) }) : null;

    return {
      ...task,
      _id: task._id.toString(),
      userId: task.userId ? task.userId.toString() : '',
      source: sourceDetails ? sourceDetails.name : (task.source ? task.source.toString() : ''),
      sourceId: task.source ? task.source.toString() : '',
      typeOfWork: typeDetails ? typeDetails.name : (task.typeOfWork ? task.typeOfWork.toString() : ''),
      typeOfWorkId: task.typeOfWork ? task.typeOfWork.toString() : '',
      username: userDetails ? userDetails.username : '',
      user: userDetails ? userDetails.name : ''
    };
  },

  async updateTask(id, updateDoc) {
    const db = await getDb();
    const normalized = await normalizeUpdateDoc(updateDoc);
    await db.collection('tasks').updateOne({ _id: castId(id) }, normalized);
    return this.findTaskById(id);
  },

  async deleteTask(id) {
    const db = await getDb();
    const result = await db.collection('tasks').deleteOne({ _id: castId(id) });
    return result.deletedCount > 0;
  },

  async findBills() {
    const db = await getDb();
    const bills = await db.collection('bills').find({}).sort({ createdAt: -1 }).toArray();
    return bills.map(b => ({ ...b, _id: b._id.toString() }));
  },

  async createBill(billDoc) {
    const db = await getDb();
    const result = await db.collection('bills').insertOne({
      ...billDoc,
      createdAt: billDoc.createdAt || new Date()
    });
    return {
      _id: result.insertedId.toString(),
      ...billDoc
    };
  },

  async updateUser(id, updateDoc) {
    const db = await getDb();
    await db.collection('users').updateOne({ _id: castId(id) }, updateDoc);
    const updated = await db.collection('users').findOne({ _id: castId(id) });
    if (updated) {
      updated._id = updated._id.toString();
    }
    return updated;
  },

  async getStatuses() {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ key: 'statuses' });
    if (!doc) {
      // Seed default statuses into db
      await db.collection('settings').insertOne({ key: 'statuses', list: [...CONFIG.VALID_STATUSES] });
      return [...CONFIG.VALID_STATUSES];
    }
    return doc.list;
  },

  async saveStatuses(list) {
    const db = await getDb();
    await db.collection('settings').updateOne(
      { key: 'statuses' },
      { $set: { list } },
      { upsert: true }
    );
    return list;
  },

  async getUserProjects(userId) {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: castId(userId) });
    return user?.projects || [];
  },

  async addUserProject(userId, projectName) {
    const db = await getDb();
    await db.collection('users').updateOne(
      { _id: castId(userId) },
      { $addToSet: { projects: projectName } }
    );
    return true;
  },

  async getSources() {
    const db = await getDb();
    const sources = await db.collection('sources').find({}).toArray();
    if (sources.length === 0) {
      const defaultSources = [{ name: 'dialedin' }, { name: 'fluent' }];
      await db.collection('sources').insertMany(defaultSources);
      return (await db.collection('sources').find({}).toArray()).map(s => ({ ...s, _id: s._id.toString() }));
    }
    return sources.map(s => ({ ...s, _id: s._id.toString() }));
  },

  async getTypesOfWork() {
    const db = await getDb();
    const types = await db.collection('types_of_work').find({}).toArray();
    if (types.length === 0) {
      const defaultTypes = [{ name: 'dev' }, { name: 'qa' }];
      await db.collection('types_of_work').insertMany(defaultTypes);
      return (await db.collection('types_of_work').find({}).toArray()).map(t => ({ ...t, _id: t._id.toString() }));
    }
    return types.map(t => ({ ...t, _id: t._id.toString() }));
  }
};
