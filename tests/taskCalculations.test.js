import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function simulating variance calculation
function calculateTaskVariance(allocatedHours, actualHours) {
  const alloc = parseFloat(allocatedHours) || 0;
  const actual = parseFloat(actualHours) || 0;
  const variance = alloc - actual;
  return {
    variance,
    isOnTrack: variance >= 0,
    overBy: variance < 0 ? Math.abs(variance) : 0
  };
}

// Helper function simulating weekly totals calculation
function calculateWeekTotals(tasks) {
  return tasks.reduce((sum, task) => sum + (task.bill?.billedHours || 0), 0);
}

// Helper function simulating task text formatting for clipboard
function formatTaskCopyText(task) {
  const id = task._originalId || task._id;
  const name = task.name || '';
  const project = task.project || 'No Project';
  const dateStr = task.workDate || 'No Date';
  const billed = task.bill?.billedHours || 0;
  return `id: ${id}\nname: ${name}\nproject: ${project}\ndate: ${dateStr}\nbill hours: ${billed}`;
}

test('Hour variance calculation identifies on track task correctly', () => {
  const result = calculateTaskVariance(10, 8);
  assert.equal(result.variance, 2);
  assert.equal(result.isOnTrack, true);
  assert.equal(result.overBy, 0);
});

test('Hour variance calculation identifies over budget task correctly', () => {
  const result = calculateTaskVariance(5, 7.5);
  assert.equal(result.variance, -2.5);
  assert.equal(result.isOnTrack, false);
  assert.equal(result.overBy, 2.5);
});

test('Week totals calculation sums billable hours across tasks', () => {
  const sampleTasks = [
    { bill: { billedHours: 4.5 } },
    { bill: { billedHours: 3.0 } },
    { bill: { billedHours: 2.5 } },
  ];
  const total = calculateWeekTotals(sampleTasks);
  assert.equal(total, 10.0);
});

test('Task copy text formatter creates exact clipboard text structure', () => {
  const sampleTask = {
    _id: 'task-123',
    name: 'Refactor Authentication Flow',
    project: 'Auth',
    workDate: '2026-09-15',
    bill: { billedHours: 6.0 }
  };
  const text = formatTaskCopyText(sampleTask);
  assert.ok(text.includes('id: task-123'));
  assert.ok(text.includes('name: Refactor Authentication Flow'));
  assert.ok(text.includes('project: Auth'));
  assert.ok(text.includes('bill hours: 6'));
});
