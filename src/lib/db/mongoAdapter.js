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
    return new ObjectId(id);
  } catch {
    return id;
  }
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
    if (query.userId) mongoQuery.userId = query.userId;
    if (query.source) mongoQuery.source = query.source;
    if (query.project) mongoQuery.project = query.project;
    if (query.typeOfWork) mongoQuery.typeOfWork = query.typeOfWork;
    if (query.createdAt) mongoQuery.createdAt = query.createdAt;

    // Fetch all matching tasks for metrics calculation
    const allMatching = await db.collection('tasks').find(mongoQuery).toArray();
    
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
      .find(mongoQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      tasks: tasks.map(t => ({ ...t, _id: t._id.toString() })),
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
    const result = await db.collection('tasks').insertOne({
      ...taskDoc,
      createdAt: taskDoc.createdAt || new Date(),
      updatedAt: taskDoc.updatedAt || new Date()
    });
    return {
      _id: result.insertedId.toString(),
      ...taskDoc
    };
  },

  async findTaskById(id) {
    const db = await getDb();
    const task = await db.collection('tasks').findOne({ _id: castId(id) });
    return task;
  },

  async updateTask(id, updateDoc) {
    const db = await getDb();
    await db.collection('tasks').updateOne({ _id: castId(id) }, updateDoc);
    const updated = await db.collection('tasks').findOne({ _id: castId(id) });
    if (updated) {
      updated._id = updated._id.toString();
    }
    return updated;
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
  }
};
