# Automated Testing Strategy

## Overview
The application incorporates automated tests leveraging **Node.js Native Test Runner** (`node --test`), requiring zero external dependencies and executing rapidly.

## Running Tests
Run unit and integration tests via `npm`:

```bash
# Run full test suite
npm test

# Run unit tests only
npm run test:unit
```

## Test Suite Coverage
1. **Week Date Calculations (`tests/weekDate.test.js`)**:
   - Validates Sunday-to-Saturday date range boundaries.
   - Tests `parseLocalDate` and `formatLocalDate` for timezone stability.
   - Verifies `Previous Week`, `Current Week`, and `Next Week` badge logic.

2. **Project Synchronization (`tests/projectsApi.test.js`)**:
   - Tests merging of projects from user lists, task queries, and dynamic field options.

3. **Status Color Mapping (`tests/statusColors.test.js`)**:
   - Verifies dynamic status color key lookups and fallback defaults.
