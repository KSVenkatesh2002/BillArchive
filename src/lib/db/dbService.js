import { pgAdapter } from './pgAdapter';

let connectionAttempted = false;

async function getAdapter() {
  if (!connectionAttempted) {
    connectionAttempted = true;
    const pgUri = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!pgUri) {
      throw new Error('[DB Error] DATABASE_URL is not defined in environment variables. Please check your .env.local configuration.');
    }

    console.log('[DB Service] Connecting to live PostgreSQL database...');
    await pgAdapter.connect();
    console.log('[DB Service] Successfully connected to live PostgreSQL database!');
  }

  return pgAdapter;
}

export const dbService = {
  /**
   * Check if running in demo mode (Always false now as memory adapter is removed)
   */
  async isDemo() {
    return false;
  },

  async findUserByEmail(email) {
    const adapter = await getAdapter();
    return adapter.findUserByEmail(email);
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

  async getStatuses(orgSlug) {
    const adapter = await getAdapter();
    return adapter.getStatuses(orgSlug);
  },

  async saveStatuses(list, orgSlug) {
    const adapter = await getAdapter();
    return adapter.saveStatuses(list, orgSlug);
  },

  async getUserProjects(userId) {
    const adapter = await getAdapter();
    return adapter.getUserProjects(userId);
  },

  async addUserProject(userId, projectName) {
    const adapter = await getAdapter();
    return adapter.addUserProject(userId, projectName);
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
