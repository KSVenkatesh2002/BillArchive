import mongoose from 'mongoose';
import { CONFIG } from '../config';
import User from './models/User';
import Source from './models/Source';
import TypeOfWork from './models/TypeOfWork';
import Task from './models/Task';
import Bill from './models/Bill';
import Setting from './models/Setting';

const uri = process.env.MONGODB_URI;

let isConnected = false;

async function connectMongoose() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
  isConnected = true;
}

export const mongoAdapter = {
  isDemoMode: false,

  async connect() {
    try {
      await connectMongoose();
      return true;
    } catch (err) {
      console.error('Mongoose Connection Error:', err.message);
      throw err;
    }
  },

  async findUserByUsername(username) {
    await connectMongoose();
    const user = await User.findOne({ username: username.toLowerCase() }).lean();
    return user ? { ...user, _id: user._id.toString() } : null;
  },

  async findUsers() {
    await connectMongoose();
    const users = await User.find({}).select('-password').lean();
    return users.map(u => ({ ...u, _id: u._id.toString() }));
  },

  async createUser(userDoc) {
    await connectMongoose();
    const created = await User.create({
      ...userDoc,
      createdAt: userDoc.createdAt || new Date()
    });
    const obj = created.toObject();
    return { ...obj, _id: obj._id.toString() };
  },

  async findTasks(query = {}, options = {}) {
    await connectMongoose();

    const mongoQuery = {};
    if (query.userId) mongoQuery.userId = query.userId;
    if (query.project && query.project !== 'all') mongoQuery.project = query.project;
    if (query.createdAt) mongoQuery.createdAt = query.createdAt;

    // Source filter
    if (query.source && query.source !== 'all') {
      let sDoc = await Source.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(query.source) ? query.source : null },
          { name: query.source.toLowerCase() }
        ]
      }).lean();
      if (sDoc) {
        mongoQuery.source = sDoc._id;
      } else {
        mongoQuery.source = new mongoose.Types.ObjectId();
      }
    }

    // Type of work filter
    if (query.typeOfWork && query.typeOfWork !== 'all') {
      let tDoc = await TypeOfWork.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(query.typeOfWork) ? query.typeOfWork : null },
          { name: query.typeOfWork.toLowerCase() }
        ]
      }).lean();
      if (tDoc) {
        mongoQuery.typeOfWork = tDoc._id;
      } else {
        mongoQuery.typeOfWork = new mongoose.Types.ObjectId();
      }
    }

    const allMatching = await Task.find(mongoQuery).lean();

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
    const limit = options.limit || 1000;

    const tasks = await Task.find(mongoQuery)
      .populate('userId', 'username name')
      .populate('source', 'name')
      .populate('typeOfWork', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedTasks = tasks.map(t => ({
      ...t,
      _id: t._id.toString(),
      userId: t.userId?._id ? t.userId._id.toString() : (t.userId ? t.userId.toString() : ''),
      username: t.userId?.username || '',
      user: t.userId?.name || '',
      source: t.source?.name || (t.source ? t.source.toString() : ''),
      sourceId: t.source?._id ? t.source._id.toString() : (t.source ? t.source.toString() : ''),
      typeOfWork: t.typeOfWork?.name || (t.typeOfWork ? t.typeOfWork.toString() : ''),
      typeOfWorkId: t.typeOfWork?._id ? t.typeOfWork._id.toString() : (t.typeOfWork ? t.typeOfWork.toString() : '')
    }));

    return {
      tasks: formattedTasks,
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
    await connectMongoose();

    let sourceId = taskDoc.source;
    if (sourceId) {
      let sDoc = await Source.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(sourceId) ? sourceId : null },
          { name: String(sourceId).toLowerCase() }
        ]
      });
      if (!sDoc) {
        sDoc = await Source.create({ name: String(sourceId).toLowerCase() });
      }
      sourceId = sDoc._id;
    }

    let typeId = taskDoc.typeOfWork;
    if (typeId) {
      let tDoc = await TypeOfWork.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(typeId) ? typeId : null },
          { name: String(typeId).toLowerCase() }
        ]
      });
      if (!tDoc) {
        tDoc = await TypeOfWork.create({ name: String(typeId).toLowerCase() });
      }
      typeId = tDoc._id;
    }

    const newTask = await Task.create({
      ...taskDoc,
      source: sourceId,
      typeOfWork: typeId,
      createdAt: taskDoc.createdAt || new Date(),
      updatedAt: taskDoc.updatedAt || new Date()
    });

    return this.findTaskById(newTask._id);
  },

  async findTaskById(id) {
    await connectMongoose();
    const task = await Task.findById(id)
      .populate('userId', 'username name')
      .populate('source', 'name')
      .populate('typeOfWork', 'name')
      .lean();

    if (!task) return null;

    return {
      ...task,
      _id: task._id.toString(),
      userId: task.userId?._id ? task.userId._id.toString() : (task.userId ? task.userId.toString() : ''),
      username: task.userId?.username || '',
      user: task.userId?.name || '',
      source: task.source?.name || (task.source ? task.source.toString() : ''),
      sourceId: task.source?._id ? task.source._id.toString() : (task.source ? task.source.toString() : ''),
      typeOfWork: task.typeOfWork?.name || (task.typeOfWork ? task.typeOfWork.toString() : ''),
      typeOfWorkId: task.typeOfWork?._id ? task.typeOfWork._id.toString() : (task.typeOfWork ? task.typeOfWork.toString() : '')
    };
  },

  async updateTask(id, updateDoc) {
    await connectMongoose();
    if (updateDoc.$set) {
      if (updateDoc.$set.source) {
        let sDoc = await Source.findOne({
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(updateDoc.$set.source) ? updateDoc.$set.source : null },
            { name: String(updateDoc.$set.source).toLowerCase() }
          ]
        });
        if (!sDoc) {
          sDoc = await Source.create({ name: String(updateDoc.$set.source).toLowerCase() });
        }
        updateDoc.$set.source = sDoc._id;
      }
      if (updateDoc.$set.typeOfWork) {
        let tDoc = await TypeOfWork.findOne({
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(updateDoc.$set.typeOfWork) ? updateDoc.$set.typeOfWork : null },
            { name: String(updateDoc.$set.typeOfWork).toLowerCase() }
          ]
        });
        if (!tDoc) {
          tDoc = await TypeOfWork.create({ name: String(updateDoc.$set.typeOfWork).toLowerCase() });
        }
        updateDoc.$set.typeOfWork = tDoc._id;
      }
    }

    await Task.findByIdAndUpdate(id, updateDoc);
    return this.findTaskById(id);
  },

  async deleteTask(id) {
    await connectMongoose();
    const res = await Task.findByIdAndDelete(id);
    return !!res;
  },

  async findBills() {
    await connectMongoose();
    const bills = await Bill.find({}).sort({ createdAt: -1 }).lean();
    return bills.map(b => ({ ...b, _id: b._id.toString() }));
  },

  async createBill(billDoc) {
    await connectMongoose();
    const created = await Bill.create({
      ...billDoc,
      createdAt: billDoc.createdAt || new Date()
    });
    const obj = created.toObject();
    return { ...obj, _id: obj._id.toString() };
  },

  async updateUser(id, updateDoc) {
    await connectMongoose();
    await User.findByIdAndUpdate(id, updateDoc);
    const updated = await User.findById(id).lean();
    return updated ? { ...updated, _id: updated._id.toString() } : null;
  },

  async getStatuses() {
    await connectMongoose();
    const doc = await Setting.findOne({ key: 'statuses' }).lean();
    if (!doc) {
      await Setting.create({ key: 'statuses', list: [...CONFIG.VALID_STATUSES] });
      return [...CONFIG.VALID_STATUSES];
    }
    return doc.list;
  },

  async saveStatuses(list) {
    await connectMongoose();
    await Setting.findOneAndUpdate(
      { key: 'statuses' },
      { $set: { list } },
      { upsert: true }
    );
    return list;
  },

  async getUserProjects(userId) {
    await connectMongoose();
    const user = await User.findById(userId).lean();
    return user?.projects || [];
  },

  async addUserProject(userId, projectName) {
    await connectMongoose();
    await User.findByIdAndUpdate(userId, {
      $addToSet: { projects: projectName }
    });
    return true;
  },

  async getSources() {
    await connectMongoose();
    let sources = await Source.find({}).lean();
    if (sources.length === 0) {
      await Source.insertMany([{ name: 'dialedin' }, { name: 'fluent' }]);
      sources = await Source.find({}).lean();
    }
    return sources.map(s => ({ ...s, _id: s._id.toString() }));
  },

  async getTypesOfWork() {
    await connectMongoose();
    let types = await TypeOfWork.find({}).lean();
    if (types.length === 0) {
      await TypeOfWork.insertMany([{ name: 'dev' }, { name: 'qa' }]);
      types = await TypeOfWork.find({}).lean();
    }
    return types.map(t => ({ ...t, _id: t._id.toString() }));
  }
};
