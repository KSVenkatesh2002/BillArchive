import test from 'node:test';
import assert from 'node:assert/strict';

// Helper reporting aggregation function
function calculateReportMetrics(tasks, timeEntries) {
  let totalEstimated = 0;
  let totalLogged = 0;

  const projectMap = {};

  tasks.forEach((t) => {
    const est = Number(t.estimatedHours || 0);
    totalEstimated += est;

    if (!projectMap[t.projectId]) {
      projectMap[t.projectId] = { estimatedHours: 0, loggedHours: 0, taskCount: 0 };
    }
    projectMap[t.projectId].estimatedHours += est;
    projectMap[t.projectId].taskCount += 1;
  });

  timeEntries.forEach((entry) => {
    const hours = Number(entry.hours || 0);
    totalLogged += hours;

    const linkedTask = tasks.find((t) => t.id === entry.taskId);
    if (linkedTask && projectMap[linkedTask.projectId]) {
      projectMap[linkedTask.projectId].loggedHours += hours;
    }
  });

  const netVariance = totalLogged - totalEstimated;

  return {
    totalEstimated,
    totalLogged,
    netVariance,
    projectMap,
  };
}

test('calculateReportMetrics correctly sums totals and computes variance', () => {
  const tasks = [
    { id: 't1', projectId: 'p1', estimatedHours: 10 },
    { id: 't2', projectId: 'p1', estimatedHours: 5 },
    { id: 't3', projectId: 'p2', estimatedHours: 8 },
  ];
  const entries = [
    { taskId: 't1', hours: 4 },
    { taskId: 't1', hours: 7 }, // Total t1 = 11h
    { taskId: 't3', hours: 6 },
  ];

  const metrics = calculateReportMetrics(tasks, entries);

  assert.equal(metrics.totalEstimated, 23);
  assert.equal(metrics.totalLogged, 17);
  assert.equal(metrics.netVariance, -6);
  assert.equal(metrics.projectMap['p1'].estimatedHours, 15);
  assert.equal(metrics.projectMap['p1'].loggedHours, 11);
  assert.equal(metrics.projectMap['p2'].estimatedHours, 8);
  assert.equal(metrics.projectMap['p2'].loggedHours, 6);
});

test('calculateReportMetrics handles zero hours and empty inputs', () => {
  const metrics = calculateReportMetrics([], []);
  assert.equal(metrics.totalEstimated, 0);
  assert.equal(metrics.totalLogged, 0);
  assert.equal(metrics.netVariance, 0);
});
