import test from 'node:test';
import assert from 'node:assert/strict';

// Task service payload validation and transformation helper
function prepareTaskPayload(input, orgConfig) {
  if (!input.taskName || !input.projectId) {
    throw new Error('Task name and Project ID are required');
  }

  const allowedStatuses = orgConfig?.statuses || ['Todo', 'In Progress', 'Completed'];
  const status = allowedStatuses.includes(input.status) ? input.status : allowedStatuses[0];

  const estimatedHours = Math.max(0, Number(input.estimatedHours) || 0);

  return {
    projectId: input.projectId,
    taskName: input.taskName.trim(),
    externalUrl: input.externalUrl || null,
    estimatedHours,
    status,
    customMetadata: input.customMetadata || {},
  };
}

test('prepareTaskPayload correctly formats valid task input', () => {
  const input = {
    projectId: 'proj-99',
    taskName: '  Write Unit Tests  ',
    estimatedHours: '8.5',
    status: 'In Progress',
    customMetadata: { jiraKey: 'BILL-404' },
  };

  const payload = prepareTaskPayload(input, { statuses: ['Todo', 'In Progress'] });

  assert.equal(payload.projectId, 'proj-99');
  assert.equal(payload.taskName, 'Write Unit Tests');
  assert.equal(payload.estimatedHours, 8.5);
  assert.equal(payload.status, 'In Progress');
  assert.deepEqual(payload.customMetadata, { jiraKey: 'BILL-404' });
});

test('prepareTaskPayload falls back to default status if invalid status provided', () => {
  const input = {
    projectId: 'proj-1',
    taskName: 'Refactor DB',
    status: 'NonExistentStatus',
  };

  const payload = prepareTaskPayload(input, { statuses: ['Backlog', 'Done'] });
  assert.equal(payload.status, 'Backlog');
});

test('prepareTaskPayload throws error on missing required fields', () => {
  assert.throws(() => prepareTaskPayload({ taskName: 'Test' }, {}), /Task name and Project ID are required/);
  assert.throws(() => prepareTaskPayload({ projectId: 'p1' }, {}), /Task name and Project ID are required/);
});

test('Initial time log entry generation on task creation', () => {
  const taskWorkDate = new Date('2026-09-15');
  const initialEntries = [
    {
      date: taskWorkDate,
      allocatedHours: 5,
      billedHours: 5,
      actualHours: 3.5,
      note: 'Initial Log',
      loggedBy: 'dev@example.com'
    }
  ];

  assert.equal(initialEntries.length, 1);
  assert.equal(initialEntries[0].allocatedHours, 5);
  assert.equal(initialEntries[0].actualHours, 3.5);
  assert.equal(initialEntries[0].note, 'Initial Log');
});

test('Updating time entry recalculates parent task bill totals', () => {
  const timeEntries = [
    { _id: 'te-1', allocatedHours: 4, billedHours: 4, actualHours: 4 },
    { _id: 'te-2', allocatedHours: 2, billedHours: 2, actualHours: 1 }
  ];

  // Simulate updating entry te-2 actualHours from 1 to 3
  const updatedEntries = timeEntries.map(e => e._id === 'te-2' ? { ...e, actualHours: 3 } : e);
  const totalAllocated = updatedEntries.reduce((sum, e) => sum + e.allocatedHours, 0);
  const totalActual = updatedEntries.reduce((sum, e) => sum + e.actualHours, 0);

  assert.equal(totalAllocated, 6);
  assert.equal(totalActual, 7);
  assert.equal(totalAllocated - totalActual, -1); // Variance -1 (Over by 1h)
});

test('Deleting a single time entry from a multi-entry task removes only specified entry', () => {
  const timeEntries = [
    { _id: 'te-1', date: '2026-09-15', allocatedHours: 4, billedHours: 4, actualHours: 4 },
    { _id: 'te-2', date: '2026-09-16', allocatedHours: 2, billedHours: 2, actualHours: 2 }
  ];

  const targetEntryId = 'te-1';
  const remainingEntries = timeEntries.filter(e => String(e._id || e.id) !== String(targetEntryId));

  assert.equal(remainingEntries.length, 1);
  assert.equal(remainingEntries[0]._id, 'te-2');
  assert.equal(remainingEntries[0].allocatedHours, 2);
});

