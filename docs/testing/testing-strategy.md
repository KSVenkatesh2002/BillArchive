# Testing Strategy & Automated Test Suite

## 1. Automated Testing Architecture

This repository uses Node.js Native Test Runner (`node --test`) for lightning-fast, zero-dependency unit and integration testing.

```bash
# Run all automated tests
npm test
```

---

## 2. Test Coverage Domains

### 1. Date & Week Calculation Unit Tests (`tests/weekDate.test.js`)
- Validates **Sunday-to-Saturday** date boundary generation.
- Verifies timezone-safe ISO string date parsing (`parseLocalDate`) to prevent day shifts across UTC offsets.
- Tests week badge labeling (`Current Week`, `Previous Week`, `Next Week`).

### 2. Status & Palette Resolution (`tests/statusColors.test.js`)
- Tests custom organization status mapping lookup (`statusColors`).
- Validates default color fallback for legacy statuses (`inprocess`, `dev`, `qa`).

### 3. Projects Merging & Query Logic (`tests/projectsApi.test.js`)
- Tests project list deduplication.
- Validates multi-tenant query building logic ensuring organization boundary isolation.

### 4. Hour Variance Metrics & Calculations (`tests/taskCalculations.test.js`)
- Tests allocated vs billed vs actual hour totals.
- Verifies billing variance calculation rules (`over budget`, `on track`).

### 5. API Client Request Serialization (`tests/apiClient.test.js`)
- Tests query parameter encoding, header serialization, and error response handling.

---

## 3. Writing New Unit Tests

New test files should be placed in `tests/*.test.js` using the standard Node.js `test` module:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

test('Sample calculation rule', () => {
  const result = 5 + 5;
  assert.equal(result, 10);
});
```
