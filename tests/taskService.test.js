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
