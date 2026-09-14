# Task Management Feature Documentation

## Overview
The Task Management system supports creating, updating, filtering, and tracking tasks across organizations.

## Core Workflows
1. **Task Creation**:
   - Initiated via "New Task" button in `TaskListView.js` / `page.js`.
   - Opens `TaskFormModal.js`. Mandatory fields: Task Name and Project.
   - Automatically saves project to global organization project options.

2. **Task Filtering & Weekly Views**:
   - `TaskListView.js` presents weekly views starting Sunday and ending Saturday.
   - Includes week status badges: `Current Week`, `Previous Week`, or `Next Week`.
   - Supports List View and Card View toggles with quick status changes.

3. **Status Audit Log**:
   - Status updates trigger entries in `status_history`.
   - Viewable via `AuditLogModal.js` to inspect historical status transitions and timestamps.
