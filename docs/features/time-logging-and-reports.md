# Time Logging & Reports Documentation

## Time Logging System
- **Adding Log Entries**: Users log hours via `LogTimeModal.js` (`allocatedHours`, `billedHours`, `actualHours`, and entry date).
- **Editing Log Entries**:
  - Clicking the pencil icon on a specific log entry row opens `EditLogModal.js` ("Edit Log Details").
  - Displays the specific log entry date, allocated, billed, and actual hours.
  - Submit button explicitly labeled "Save Log Details".
  - Calls `apiClient.updateTimeEntry(taskId, entryId, payload)` to update the individual time log without corrupting the parent task's total hours summary.

## Reports & Analytics (`/reports`)
- Generates timeframe-based and project-based work summaries.
- Exports text and CSV logs for client billing and project metrics.
