# Architectural Overview

## 1. Executive Summary
This application is a modern, enterprise-grade multi-tenant task and time management system built on **Next.js 16 (App Router)**, **Redux Toolkit**, **TanStack Query v5**, and **PostgreSQL**.

## 2. Core Technical Architecture
```
[ Client Browser ]
      │
      ├── Redux Toolkit (UI State & Synchronous Task Management)
      ├── TanStack Query v5 (Data Fetching & Caching for Projects/Configs)
      │
[ Next.js App Router Server ]
      │
      ├── Auth Middleware & JWT Token Validation (`src/lib/auth.js`)
      ├── RESTful API Endpoints (`src/app/api/...`)
      │
[ Data Access Layer ]
      │
      ├── `dbService` Abstraction (`src/lib/db/dbService.js`)
      └── PostgreSQL Knex Adapter (`src/lib/db/pgAdapter.js`)
```

## 3. Key Design Decisions & Standards
- **Single Source of Truth (SSOT)**: Global site configurations and default color palettes are centralized in `src/lib/config.js`.
- **Hybrid Data Fetching**:
  - **Redux Toolkit**: Handles main dashboard task state, active filters, and timeframe navigation (`src/lib/store/taskSlice.js`).
  - **TanStack Query**: Manages configuration, project lists, and paginated sub-queries with caching (`@tanstack/react-query`).
- **Timezone-Safe Date Handling**:
  - Week calculations strictly follow a **Sunday to Saturday** format (`parseLocalDate` and `formatLocalDate`).
  - Distinguishes between parent task creation dates and individual time log entry dates.
- **Multi-Tenant Isolation**:
  - All users belong to an Organization (`orgId`).
  - Organization admins can configure custom statuses, status colors, dynamic fields, and global project lists.
