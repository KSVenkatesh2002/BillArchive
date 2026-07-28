import { pgAdapter } from './pgAdapter';
import { mongoAdapter } from './mongoAdapter';

let connectionAttempted = false;

async function getAdapter() {
  if (!connectionAttempted) {
    connectionAttempted = true;
    const pgUri = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (pgUri) {
      console.log('[DB Service] Connecting to live PostgreSQL / Supabase database...');
      await pgAdapter.connect();
      console.log('[DB Service] Successfully connected to live PostgreSQL / Supabase database!');
      return pgAdapter;
    }

    if (process.env.MONGODB_URI) {
      console.log('[DB Service] Connecting to MongoDB database...');
      await mongoAdapter.connect();
      return mongoAdapter;
    }

    throw new Error('[DB Error] DATABASE_URL is not defined in environment variables. Please check your .env.local configuration.');
  }

  return (process.env.DATABASE_URL || process.env.POSTGRES_URL) ? pgAdapter : mongoAdapter;
}

export const dbService = {
  /**
   * Check if running in demo mode (Always false now as memory adapter is removed)
   */
  async isDemo() {
    return false;
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
  },

  async getStatuses() {
    const adapter = await getAdapter();
    return adapter.getStatuses();
  },

  async saveStatuses(list) {
    const adapter = await getAdapter();
    return adapter.saveStatuses(list);
  },

  async getUserProjects(userId) {
    const adapter = await getAdapter();
    return adapter.getUserProjects(userId);
  },

  async addUserProject(userId, projectName) {
    const adapter = await getAdapter();
    return adapter.addUserProject(userId, projectName);
  },

  async getSources() {
    const adapter = await getAdapter();
    return adapter.getSources();
  },

  async getTypesOfWork() {
    const adapter = await getAdapter();
    return adapter.getTypesOfWork();
  },

  async findOrganizationById(id) {
    const adapter = await getAdapter();
    return adapter.findOrganizationById(id);
  },

  async findOrganizationBySlug(slug) {
    const adapter = await getAdapter();
    return adapter.findOrganizationBySlug(slug);
  },

  async createOrganization(orgDoc) {
    const adapter = await getAdapter();
    return adapter.createOrganization(orgDoc);
  },

  async updateOrganizationConfig(id, dynamicFields, enabledFields) {
    const adapter = await getAdapter();
    return adapter.updateOrganizationConfig(id, dynamicFields, enabledFields);
  },

  async getOrganizations() {
    const adapter = await getAdapter();
    return adapter.getOrganizations();
  }
};
