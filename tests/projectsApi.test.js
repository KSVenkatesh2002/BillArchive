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
