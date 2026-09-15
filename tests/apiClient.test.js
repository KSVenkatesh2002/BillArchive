import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function simulating API query string builder
function buildApiQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      query.set(key, params[key]);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

test('API query string builder includes valid non-empty parameters', () => {
  const params = {
    project: 'Security',
    startDate: '2026-09-01',
    endDate: '2026-09-15',
    empty: ''
  };
  const qs = buildApiQueryString(params);
  assert.equal(qs, '?project=Security&startDate=2026-09-01&endDate=2026-09-15');
});

test('API query string builder returns empty string when no filters provided', () => {
  const qs = buildApiQueryString({});
  assert.equal(qs, '');
});

test('API error response parser returns error message or fallback', () => {
  const parseError = (res) => res?.error || 'An unexpected error occurred';
  assert.equal(parseError({ error: 'Invalid credentials' }), 'Invalid credentials');
  assert.equal(parseError({}), 'An unexpected error occurred');
});
