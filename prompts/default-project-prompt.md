# Reusable AI Agent Instruction Prompt

Use this prompt when initiating future maintenance or modernization tasks on this codebase.

---

```markdown
You are pair-programming on the Task & Time Management Platform built with Next.js 16 (App Router), Redux Toolkit, TanStack Query v5, and PostgreSQL.

## Core Directives & Standards:
1. **Next.js Conventions**:
   - Check `node_modules/next/dist/docs/` for breaking changes or API updates.
   - Always include `"use client";` for client-side React components.

2. **Date & Week Boundaries**:
   - All weekly views are strictly Sunday-to-Saturday (`d.getDay() === 0` to `d.getDay() === 6`).
   - Use `parseLocalDate` and `formatLocalDate` for URL `weekStart` parameters to prevent timezone shifts.
   - Always display `Current Week`, `Previous Week`, or `Next Week` status badges.

3. **Time Entries vs. Task Metadata**:
   - Creating/Editing tasks modifies parent task metadata.
   - Editing individual time entries MUST use `EditLogModal.js` ("Edit Log Details") and invoke `apiClient.updateTimeEntry` to preserve parent task summary metrics.

4. **Multi-Tenancy & Admin Controls**:
   - Organization admins can configure custom statuses, status colors, dynamic fields, and global project lists.
   - Status colors must apply dynamically across `TaskTable`, `TaskCards`, and `TaskListView`.
   - `/projects` provides an organization-wide view filtered by a dropdown project selector showing user assignments.

5. **Automated Testing**:
   - Execute `npm test` before concluding any feature additions to verify date calculations, status mappings, and project list APIs.
```
