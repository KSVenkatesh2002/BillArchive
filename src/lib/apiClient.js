/**
 * Frontend API Wrapper Client
 * Encapsulates all backend endpoint calls for cleaner UI components.
 */

const BASE_API_URL = '/api';

async function fetchJSON(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_API_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  return response.json();
}

export const apiClient = {
  // Authentication
  checkAuth() {
    return fetchJSON('/auth/me');
  },

  login(email, password) {
    return fetchJSON('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(name, email, password, orgName) {
    return fetchJSON('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, orgName }),
    });
  },

  logout() {
    return fetchJSON('/auth/logout', { method: 'POST' });
  },

  // Tasks
  getTasks(params = {}) {
    const { page = 1, limit = 15, timeframe = 'all', ...filters } = params;
    let url = `/tasks?page=${page}&limit=${limit}&timeframe=${timeframe}`;

    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== 'all' && val !== '') {
        url += `&${key}=${encodeURIComponent(val)}`;
      }
    });

    return fetchJSON(url);
  },

  createTask(taskData) {
    return fetchJSON('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  getTask(taskId) {
    return fetchJSON(`/tasks/${taskId}`);
  },

  updateTask(taskId, updateData) {
    return fetchJSON(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  addTimeEntry(taskId, entry) {
    return fetchJSON(`/tasks/${taskId}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'addTimeEntry', entry }),
    });
  },

  updateTimeEntry(taskId, entryId, entry) {
    return fetchJSON(`/tasks/${taskId}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateTimeEntry', entryId, entry }),
    });
  },

  deleteTimeEntry(taskId, entryId) {
    return fetchJSON(`/tasks/${taskId}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteTimeEntry', entryId }),
    });
  },

  deleteTask(taskId) {
    return fetchJSON(`/tasks/${taskId}`, { method: 'DELETE' });
  },

  // Reports
  getReport(optionsOrTimeframe, projectStr = null) {
    const params = new URLSearchParams();
    if (typeof optionsOrTimeframe === 'string') {
      params.set('timeframe', optionsOrTimeframe);
      if (projectStr && projectStr !== 'all') params.set('project', projectStr);
    } else {
      Object.entries(optionsOrTimeframe).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, v);
      });
    }
    return fetchJSON(`/reports?${params.toString()}`);
  },

  // Bills
  getBills() {
    return fetchJSON('/bills');
  },

  createBill(billData) {
    return fetchJSON('/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
  },

  getAdminData() {
    return fetchJSON('/admin');
  },

  getStatuses(orgId) {
    const url = orgId ? `/admin/statuses?orgId=${orgId}` : '/admin/statuses';
    return fetchJSON(url);
  },

  getProjects() {
    return fetchJSON('/projects');
  },

  createProject(projectName) {
    return fetchJSON('/projects', {
      method: 'POST',
      body: JSON.stringify({ project: projectName }),
    });
  },

  updateStatuses(statuses, orgId) {
    return fetchJSON('/admin/statuses', {
      method: 'POST',
      body: JSON.stringify({ statuses, orgId }),
    });
  },

  updateProfile(profileData) {
    return fetchJSON('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  deleteAccount() {
    return fetchJSON('/auth/profile', { method: 'DELETE' });
  },

  getOrganizationUsers() {
    return fetchJSON('/organization/users');
  },

  createOrganizationUser(userData) {
    return fetchJSON('/organization/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getOrganizationConfig() {
    return fetchJSON('/organization/config');
  },

  updateOrganizationConfig(data) {
    return fetchJSON('/organization/config', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getUserPreferences() {
    return fetchJSON('/user/preferences');
  },

  saveUserPreferences(prefs) {
    return fetchJSON('/user/preferences', {
      method: 'POST',
      body: JSON.stringify({ fieldDefaults: prefs })
    });
  }
};
