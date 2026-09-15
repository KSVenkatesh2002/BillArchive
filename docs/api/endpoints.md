# Complete API Endpoint Reference

This document provides complete technical specifications for **all 31 API endpoints across 20 handler files** in the Bill Archive Platform.

---

## 1. Authentication API (`/api/auth/*`)

### 1.1 `POST /api/auth/login`
- **Description**: Authenticates user email and password.
- **Request Body**:
  ```json
  { "email": "user@example.com", "password": "securepassword" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "user": { "id": "uuid", "email": "user@example.com", "role": "admin" } }
  ```
- **Database Side-Effects**: Queries `users` table for email match and password hash. Sets HTTP-only authentication cookie.

### 1.2 `POST /api/auth/register`
- **Description**: Registers a new platform user.
- **Request Body**:
  ```json
  { "email": "new@example.com", "password": "password123", "fullName": "John Doe" }
  ```
- **Response (201 Created)**: Returns created user object and sets auth cookie.
- **Database Side-Effects**: Inserts record into `users` table with bcrypt hashed password.

### 1.3 `GET /api/auth/me`
- **Description**: Retrieves current authenticated session user profile.
- **Response (200 OK)**: User profile object or `401 Unauthorized`.

### 1.4 `POST /api/auth/logout`
- **Description**: Clears session cookies and logs user out.
- **Response (200 OK)**: `{ "success": true }`.

### 1.5 `PUT /api/auth/profile`
- **Description**: Updates user profile details (display name, preferences).
- **Request Body**: `{ "fullName": "New Name", "theme": "dark" }`.
- **Database Side-Effects**: Updates matching record in `users` table.

### 1.6 `DELETE /api/auth/profile`
- **Description**: Deletes user account.
- **Database Side-Effects**: Deletes user row from `users` table.

---

## 2. Tasks & Time Logging API (`/api/tasks/*`)

### 2.1 `GET /api/tasks`
- **Description**: Fetches tasks with optional filters.
- **Query Params**: `orgId` (required), `projectId`, `status`, `search`, `startDate`, `endDate`.
- **Response (200 OK)**: Array of task objects with calculated total logged hours and variance.

### 2.2 `POST /api/tasks`
- **Description**: Creates a new task.
- **Request Body**:
  ```json
  {
    "projectId": "uuid",
    "taskName": "Implement SSO Integration",
    "externalUrl": "https://app.clickup.com/t/8675309",
    "estimatedHours": 10,
    "status": "In Progress",
    "customMetadata": { "jiraKey": "PROJ-123" }
  }
  ```
- **Database Side-Effects**: Inserts row into `tasks` table and creates entry in `audit_logs`.

### 2.3 `GET /api/tasks/[id]`
- **Description**: Fetches detailed info for a single task including all associated time log entries.
- **Response (200 OK)**: Task object with `time_entries` array.

### 2.4 `POST /api/tasks/[id]`
- **Description**: Logs hours worked on a task.
- **Request Body**:
  ```json
  { "hours": 3.5, "workDate": "2026-09-15", "notes": "Completed initial OAuth flow" }
  ```
- **Database Side-Effects**: Inserts row into `time_entries` table.

### 2.5 `PATCH /api/tasks/[id]`
- **Description**: Updates task status, estimated hours, or custom metadata.
- **Database Side-Effects**: Modifies matching row in `tasks` table.

### 2.6 `DELETE /api/tasks/[id]`
- **Description**: Deletes a task.
- **Database Side-Effects**: Deletes task row from `tasks` table and cascades deletion of all child rows in `time_entries`.

---

## 3. Projects API (`/api/projects/*`)

### 3.1 `GET /api/projects`
- **Description**: Lists active projects for an organization.
- **Query Params**: `orgId`.
- **Response**: Array of project objects with task count statistics.

### 3.2 `POST /api/projects`
- **Description**: Creates a new project.
- **Request Body**: `{ "orgId": "uuid", "name": "Mobile App V2", "description": "React Native App" }`.
- **Database Side-Effects**: Inserts row into `projects` table.

---

## 4. Organization API (`/api/organization/*`)

### 4.1 `GET /api/organization/config`
- **Description**: Fetches dynamic organization schema metadata and workflow statuses.
- **Response**: Org config object containing `customFields` and `statuses`.

### 4.2 `POST /api/organization/config`
- **Description**: Updates organization dynamic configuration.
- **Database Side-Effects**: Upserts row in `org_configs` table.

### 4.3 `GET /api/organization/users`
- **Description**: Lists members belonging to the organization.

### 4.4 `POST /api/organization/users`
- **Description**: Adds/invites a new user to the organization.
- **Database Side-Effects**: Creates membership association in `project_members` / `users`.

---

## 5. Reports API (`/api/reports/*`)

### 5.1 `GET /api/reports`
- **Description**: Aggregates time entries, estimated vs logged hours, and variance math per project and user across date ranges.
- **Query Params**: `orgId`, `startDate`, `endDate`.
- **Response**: Structured object with `projectSummaries`, `userSummaries`, and total variance metrics.

---

## 6. SuperAdmin & Admin API (`/api/super/*`, `/api/admin/*`)

### 6.1 `GET /api/super/organizations` & `POST /api/super/organizations`
- **Description**: System admin endpoints for managing multi-tenant organization accounts.

### 6.2 `GET /api/admin`, `GET /api/admin/statuses`, `POST /api/admin/statuses`
- **Description**: System admin metric monitoring and global status workflow customization.

---

## 7. Utility & Preference APIs

### 7.1 `GET /api/title-scraper`
- **Description**: Fetches page title from an external URL (e.g. ClickUp link) to auto-fill task titles.
- **Query Params**: `url`.

### 7.2 `GET /api/user/preferences` & `POST /api/user/preferences`
- **Description**: Manages user-specific UI preferences (theme mode, default layout view).

### 7.3 `GET /api/bills` & `POST /api/bills`
- **Description**: Archives and manages billing records.

### 7.4 `POST /api/contact`
- **Description**: Contact form submission handler.

### 7.5 `GET /api/health`
- **Description**: Health check endpoint returning `{ "status": "ok", "timestamp": "..." }`.
