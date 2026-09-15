import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function to extract ClickUp task ID from URL
function extractClickUpTaskId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:app\.clickup\.com\/t\/|clickup\.com\/t\/|\/t\/)([a-zA-Z0-9]+)/) || url.match(/^([a-zA-Z0-9]+)$/);
  return match ? match[1] : null;
}

test('extractClickUpTaskId extracts valid ID from full ClickUp URL', () => {
  const url = 'https://app.clickup.com/t/8675309';
  const id = extractClickUpTaskId(url);
  assert.equal(id, '8675309');
});

test('extractClickUpTaskId handles plain task IDs', () => {
  const url = '8675309';
  const id = extractClickUpTaskId(url);
  assert.equal(id, '8675309');
});

test('extractClickUpTaskId returns null for invalid URLs', () => {
  assert.equal(extractClickUpTaskId(''), null);
  assert.equal(extractClickUpTaskId(null), null);
  assert.equal(extractClickUpTaskId(undefined), null);
});
