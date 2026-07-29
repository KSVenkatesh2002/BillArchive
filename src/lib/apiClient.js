/**
 * Frontend API Wrapper Client
 * Encapsulates all backend endpoint calls for cleaner UI components.
 */

export const apiClient = {
  // Authentication
  async checkAuth() {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  async login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async register(name, username, password, orgName) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password, orgName }),
    });
    return res.json();
  },

  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  // Tasks
  async getTasks(params = {}) {
    const { page = 1, limit = 15, timeframe = 'all', ...filters } = params;
    let url = `/api/tasks?page=${page}&limit=${limit}&timeframe=${timeframe}`;

    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== 'all' && val !== '') {
        url += `&${key}=${encodeURIComponent(val)}`;
      }
    });

    const res = await fetch(url);
    return res.json();
  },

  async createTask(taskData) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    return res.json();
  },

  async getTask(taskId) {
    const res = await fetch(`/api/tasks/${taskId}`);
    return res.json();
  },

  async updateTask(taskId, updateData) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  async addTimeEntry(taskId, entry) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addTimeEntry', entry }),
    });
    return res.json();
  },

  async deleteTimeEntry(taskId, entryId) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteTimeEntry', entryId }),
    });
    return res.json();
  },

  async deleteTask(taskId) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    return res.json();
  },

  // Reports
  async getReport(optionsOrTimeframe, projectStr = null) {
    const params = new URLSearchParams();
    if (typeof optionsOrTimeframe === 'string') {
      params.set('timeframe', optionsOrTimeframe);
      if (projectStr && projectStr !== 'all') params.set('project', projectStr);
    } else {
      Object.entries(optionsOrTimeframe).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, v);
      });
    }
    const res = await fetch(`/api/reports?${params.toString()}`);
    return res.json();
  },

  // Bills
  async getBills() {
    const res = await fetch('/api/bills');
    return res.json();
  },

  async createBill(billData) {
    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData),
    });
    return res.json();
  },

  async getAdminData() {
    const res = await fetch('/api/admin');
    return res.json();
  },

  async getStatuses() {
    const res = await fetch('/api/admin/statuses');
    return res.json();
  },

  async getProjects() {
    const res = await fetch('/api/projects');
    return res.json();
  },

  async createProject(projectName) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: projectName }),
    });
    return res.json();
  },

  async updateStatuses(statuses) {
    const res = await fetch('/api/admin/statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statuses }),
    });
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  async deleteAccount() {
    const res = await fetch('/api/auth/profile', {
      method: 'DELETE'
    });
    return res.json();
  },

  async getOrganizationUsers() {
    const res = await fetch('/api/organization/users');
    return res.json();
  },

  async createOrganizationUser(userData) {
    const res = await fetch('/api/organization/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async getOrganizationConfig() {
    const res = await fetch('/api/organization/config');
    return res.json();
  },

  async updateOrganizationConfig(data) {
    const res = await fetch('/api/organization/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getUserPreferences() {
    const res = await fetch('/api/user/preferences');
    return res.json();
  },

  async saveUserPreferences(prefs) {
    const res = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldDefaults: prefs })
    });
    return res.json();
  }
};
