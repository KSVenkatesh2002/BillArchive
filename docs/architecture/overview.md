# Architectural Overview

## 1. Executive Summary
This application is a modern, enterprise-grade multi-tenant task, project, and time management system built on **Next.js 16 (App Router)**, **Redux Toolkit**, **TanStack Query v5**, and **PostgreSQL (with Knex query builder)**.

It provides real-time hour allocation metrics, ClickUp integration, automated text report generation, role-based multi-tenancy, and high-performance caching for enterprise billing workflows.

---

## 2. Technical Stack Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Browser)                        │
├───────────────────────────────────┬────────────────────────────────────┤
│         Redux Toolkit             │          TanStack Query v5         │
│ (UI State, Modals, Local Filters) │   (Server-State Caching & Revalid) │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 16 APP ROUTER LAYER                     │
├────────────────────────────────────────────────────────────────────────┤
│ • Root Layout & Parallel Routes (`@authModal`)                         │
│ • Dynamic Namespace Scoping (`/[orgId]/[userId]/...`)                   │
│ • Middleware & JWT Authentication (`JOSE` / Cookie-Based Sessions)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          RESTFUL API ROUTE HANDLERS                    │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│ `/api/tasks`    │ `/api/projects` │ `/api/reports`   │ `/api/admin`    │
└─────────────────┴────────┬────────┴──────────────────┴─────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           DATA ACCESS LAYER                            │
├────────────────────────────────────────────────────────────────────────┤
│ • Unified `dbService` Abstraction (`src/lib/db/dbService.js`)          │
│ • PostgreSQL Knex Adapter (`src/lib/db/pgAdapter.js`)                  │
│ • Automatic Fallback Memory Adapter for Diagnostic Resiliency          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Design Decisions

### Single Source of Truth (SSOT)
System configurations, default brand parameters, and fallbacks are centrally managed in `src/lib/config.js`.

### Hybrid State Management Strategy
1. **Redux Toolkit (`src/lib/store/`)**:
   - `authSlice.js`: Current user session and authentication tokens.
   - `orgSlice.js`: Organization configuration, dynamic field schemas, status mappings.
   - `taskSlice.js`: Synchronous UI state (filters, timeframe navigation, active modal selection).
2. **TanStack Query v5 (`@tanstack/react-query`)**:
   - Manages asynchronous server state caching with a `staleTime` of 60s for tasks and 5m for org configurations.
   - Automatically invalidates cache tags (`['tasks']`, `['orgConfig']`, `['reports']`) on mutations (`createTask`, `updateTask`, `deleteTask`).

### Timezone-Safe Date Calculation Pattern
- Week boundaries strictly calculate **Sunday 00:00:00 to Saturday 23:59:59**.
- Utilizes `parseLocalDate()` to prevent UTC offset shifts when displaying dates on client browsers.

---

## 4. Multi-Tenant Security & Isolation
- **Organization Boundary**: All database queries enforce `orgId` filtering. Users cannot read or mutate tasks from outside their assigned organization.
- **Role Hierarchy**:
  - `user`: Views and edits tasks within assigned projects.
  - `orgAdmin`: Configures custom organization statuses, colors, and dynamic field schemas.
  - `superAdmin`: Accesses cross-organization metrics, global user directory, system diagnostic tools, and database audit logs.
