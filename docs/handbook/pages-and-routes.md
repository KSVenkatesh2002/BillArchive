# Pages & Routes Manual

This document provides an exhaustive, route-by-route reference for all client-side pages and server routes in the Bill Archive Platform.

---

## 1. Public Routes

### 1.1 Portal / Landing (`/`)
- **Route Path**: `src/app/page.js`
- **Access Level**: Public / Auto-redirect for authenticated users.
- **Description**: Landing page introducing the platform features.
- **State & Data Fetching**: Checks session token from cookies/Redux. If authenticated, redirects to `/[orgId]/[userId]`.
- **Interactive Elements**:
  - **"Get Started" Button**: Navigates to `/register`.
  - **"Sign In" Button**: Navigates to `/login`.

### 1.2 Authentication (`/login`, `/register`, `@authModal`)
- **Route Paths**: `src/app/login/page.js`, `src/app/register/page.js`, `src/app/@authModal/[...catchAll]/page.js`
- **Access Level**: Public.
- **Interception Slot**: Uses Next.js parallel route `@authModal` with catch-all fallback to prevent 404s on hard refreshes.
- **Interactive Elements & Form Actions**:
  - **Login Form**: Submits `POST /api/auth/login`. Sets HTTP-only auth cookie and redirects user to `/[orgId]/[userId]`.
  - **Register Form**: Submits `POST /api/auth/register`. Creates user account in `users` table and initializes default organization settings.

---

## 2. Authenticated Organization Routes (`/[orgId]/[userId]/...`)

### 2.1 Main Task Dashboard (`src/app/[orgId]/[userId]/page.js`)
- **Route Path**: `/[orgId]/[userId]`
- **Access Level**: Authenticated users belonging to `orgId`.
- **State Integration**: Uses `useTasksQuery` hook (TanStack React Query) for automatic caching, background revalidation, and state synchronization.
- **Page Layout & Components**:
  - **Header**: Org title, user menu, navigation links.
  - **Sidebar**: Fixed navigation sidebar with nested handbook links.
  - **MetricsBar**: Real-time calculated summary cards (Total Tasks, Total Estimated Hours, Total Logged Hours, Hour Variance).
  - **FilterControls**: Search input, project filter, status dropdown, date range picker.
  - **Task Views**: Switchable between List View (`TaskListView`), Grid View (`TaskCards`), and Table View (`TaskTable`).
  - **"Create Task" Button**: Floating action button opening `TaskFormModal`.

### 2.2 Time & Variance Reports (`src/app/[orgId]/[userId]/reports/page.js`)
- **Route Path**: `/[orgId]/[userId]/reports`
- **Access Level**: Authenticated users.
- **State Integration**: Migrated to TanStack Query via `useQuery` targeting `GET /api/reports?orgId=...`.
- **Page Layout & Interactive Features**:
  - **Date Filter Bar**: Week, Month, and Custom Date Range pickers.
  - **Team Member Summary Table**: Displays total hours logged per user vs allocated budget.
  - **Project Variance Breakdown**: Displays estimated vs actual logged hours per project, highlighting over-budget projects.
  - **"Export CSV" Button**: Generates a client-side CSV export of filtered report data.

### 2.3 User Profile & Settings (`src/app/[orgId]/[userId]/profile/page.js`)
- **Route Path**: `/[orgId]/[userId]/profile`
- **Features**: User profile management, password updates (`PUT /api/auth/profile`), and account deletion (`DELETE /api/auth/profile`).

---

## 3. Administration & System Routes

### 3.1 SuperAdmin Dashboard (`src/app/superadmin/page.js`)
- **Route Path**: `/superadmin`
- **Access Level**: Restricted to `superadmin` role.
- **State Integration**: Uses TanStack Query for organization list fetching (`GET /api/super/organizations`).
- **Features**: Multi-tenant organization provisioner, global status workflow builder, audit trail viewer.

### 3.2 Documentation System (`src/app/docs/[[...slug]]/page.js`)
- **Route Path**: `/docs/[[...slug]]`
- **Access Level**: Public / Internal reference.
- **Features**: Fixed hierarchical sidebar with sub-item links, markdown rendering with dark-mode typography (`prose prose-invert prose-sm`).
