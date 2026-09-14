import test from 'node:test';
import assert from 'node:assert/strict';

const mergeProjects = (userProjects = [], taskProjects = [], orgProjects = []) => {
  return Array.from(new Set([...userProjects, ...taskProjects, ...orgProjects])).filter(Boolean).sort();
};

test('Projects merging combines distinct projects without duplicates', () => {
  const userProjects = ['Website Redesign', 'Mobile App'];
  const taskProjects = ['Mobile App', 'Backend Migration'];
  const orgProjects = ['Website Redesign', 'DevOps Infra'];

  const merged = mergeProjects(userProjects, taskProjects, orgProjects);

  assert.deepEqual(merged, ['Backend Migration', 'DevOps Infra', 'Mobile App', 'Website Redesign']);
});

const buildTaskQuery = (userOrId, filters = {}) => {
  const userId = typeof userOrId === 'object' ? (userOrId.userId || userOrId.id) : userOrId;
  const orgId = typeof userOrId === 'object' ? userOrId.orgId : null;

  const query = {};
  const { scope, project } = filters;

  if (scope === 'org') {
    if (orgId) query.orgId = orgId;
  } else {
    if (userId) query.userId = userId;
  }

  if (project && project !== 'all') query.project = project;
  return query;
};

test('Org scope query building includes orgId and project without restricting to userId', () => {
  const userCtx = { userId: 'u123', orgId: 'org456' };
  const query = buildTaskQuery(userCtx, { scope: 'org', project: 'Website Redesign' });

  assert.equal(query.userId, undefined);
  assert.equal(query.orgId, 'org456');
  assert.equal(query.project, 'Website Redesign');
});
