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

  async register(name, username, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password }),
    });
    return res.json();
  },

  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  // Tasks
  async getTasks(params = {}) {
    const { page = 1, limit = 15, timeframe = 'all', source, typeOfWork, project } = params;
    let url = `/api/tasks?page=${page}&limit=${limit}&timeframe=${timeframe}`;

    if (source && source !== 'all') url += `&source=${source}`;
    if (typeOfWork && typeOfWork !== 'all') url += `&typeOfWork=${typeOfWork}`;
    if (project && project !== 'all') url += `&project=${encodeURIComponent(project)}`;

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

  async updateTask(taskId, updateData) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  async deleteTask(taskId) {
    const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    return res.json();
  },

  // Reports
  async getReport(timeframe, project = null) {
    let url = `/api/reports?timeframe=${timeframe}`;
    if (project) {
      url += `&project=${encodeURIComponent(project)}`;
    }
    const res = await fetch(url);
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
  }
};
