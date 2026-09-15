import test from 'node:test';
import assert from 'node:assert/strict';

// Helper filtering function to test logic
function filterTasks(tasks, { search, status, projectId, startDate, endDate }) {
  return tasks.filter((task) => {
    // Text search filter
    if (search) {
      const query = search.toLowerCase();
      const matchName = task.taskName?.toLowerCase().includes(query);
      const matchExtId = task.externalTaskId?.toLowerCase().includes(query);
      if (!matchName && !matchExtId) return false;
    }

    // Status filter
    if (status && status !== 'ALL') {
      if (task.status !== status) return false;
    }

    // Project ID filter
    if (projectId && projectId !== 'ALL') {
      if (task.projectId !== projectId) return false;
    }

    // Date range filter
    if (startDate) {
      if (new Date(task.createdAt) < new Date(startDate)) return false;
    }
    if (endDate) {
      if (new Date(task.createdAt) > new Date(endDate)) return false;
    }

    return true;
  });
}

const mockTasks = [
  { id: '1', taskName: 'Fix Auth Modal 404', externalTaskId: '8675301', status: 'In Progress', projectId: 'proj-1', createdAt: '2026-09-01' },
  { id: '2', taskName: 'Refactor Reports Page', externalTaskId: '8675302', status: 'Completed', projectId: 'proj-1', createdAt: '2026-09-05' },
  { id: '3', taskName: 'Add Supabase Migration', externalTaskId: '8675303', status: 'In Progress', projectId: 'proj-2', createdAt: '2026-09-10' },
];

test('filterTasks by text search query', () => {
  const result = filterTasks(mockTasks, { search: 'Auth' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '1');
});

test('filterTasks by external task ID', () => {
  const result = filterTasks(mockTasks, { search: '8675302' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '2');
});

test('filterTasks by status filter', () => {
  const result = filterTasks(mockTasks, { status: 'In Progress' });
  assert.equal(result.length, 2);
});

test('filterTasks by project ID filter', () => {
  const result = filterTasks(mockTasks, { projectId: 'proj-2' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '3');
});

test('filterTasks by date range', () => {
  const result = filterTasks(mockTasks, { startDate: '2026-09-04', endDate: '2026-09-08' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '2');
});
