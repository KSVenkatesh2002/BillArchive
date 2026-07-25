import { mongoAdapter } from './mongoAdapter';
import { memoryAdapter } from './memoryAdapter';

let activeAdapter = null;
let connectionAttempted = false;

async function getAdapter() {
  if (activeAdapter) {
    return activeAdapter;
  }

  // If a connection was already attempted and failed, reuse memoryAdapter immediately
  if (connectionAttempted) {
    return memoryAdapter;
  }

  connectionAttempted = true;
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('[DB Service] MONGODB_URI not found. Falling back to In-Memory Adapter (Demo Mode).');
    activeAdapter = memoryAdapter;
    return activeAdapter;
  }

  try {
    console.log('[DB Service] Attempting connection to MongoDB Atlas...');
    await mongoAdapter.connect();
    console.log('[DB Service] Successfully connected to MongoDB Atlas!');
    activeAdapter = mongoAdapter;
  } catch (error) {
    console.error(
      `[DB Service] Failed to connect to MongoDB Atlas due to: ${error.message}.\n` +
      `[DB Service] Crucial TLS/SSL alert or network timeout occurred. Falling back to In-Memory Adapter (Demo Mode).`
    );
    activeAdapter = memoryAdapter;
  }

  return activeAdapter;
}

export const dbService = {
  /**
   * Check if we are running on the demo fallback database
   */
  async isDemo() {
    const adapter = await getAdapter();
    return adapter.isDemoMode;
  },

  async findUserByUsername(username) {
    const adapter = await getAdapter();
    return adapter.findUserByUsername(username);
  },

  async findUsers() {
    const adapter = await getAdapter();
    return adapter.findUsers();
  },

  async createUser(userDoc) {
    const adapter = await getAdapter();
    return adapter.createUser(userDoc);
  },

  async findTasks(query, options) {
    const adapter = await getAdapter();
    return adapter.findTasks(query, options);
  },

  async createTask(taskDoc) {
    const adapter = await getAdapter();
    return adapter.createTask(taskDoc);
  },

  async findTaskById(id) {
    const adapter = await getAdapter();
    return adapter.findTaskById(id);
  },

  async updateTask(id, updateDoc) {
    const adapter = await getAdapter();
    return adapter.updateTask(id, updateDoc);
  },

  async deleteTask(id) {
    const adapter = await getAdapter();
    return adapter.deleteTask(id);
  },

  async findBills() {
    const adapter = await getAdapter();
    return adapter.findBills();
  },

  async createBill(billDoc) {
    const adapter = await getAdapter();
    return adapter.createBill(billDoc);
  },

  async updateUser(id, updateDoc) {
    const adapter = await getAdapter();
    return adapter.updateUser(id, updateDoc);
  }
};
