# API Endpoints Documentation

All requests require session cookie or JWT authorization header unless marked public.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates user credentials and sets session cookie.
- **Request Body**:
  ```json
  {
    "email": "user@organization.com",
    "password": "secretpassword"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid-v4",
      "email": "user@organization.com",
      "name": "Jane Doe",
      "orgId": "dialedin",
      "role": "user"
    }
  }
  ```

### `GET /api/auth/me`
Retrieves current authenticated session.
- **Response `200 OK`**:
  ```json
  {
    "authenticated": true,
    "user": { "id": "...", "email": "...", "orgId": "...", "role": "..." }
  }
  ```

### `POST /api/auth/logout`
Clears session cookie and invalidates token.

---

## 2. Task Management Endpoints

### `GET /api/tasks`
Fetch tasks for organization or user workspace with pagination and filters.
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 50)
  - `project` (string, optional)
  - `source` (string, optional: e.g. `ClickUp`, `Manual`)
  - `startDate` (ISO string `YYYY-MM-DD`, optional)
  - `endDate` (ISO string `YYYY-MM-DD`, optional)
  - `scope` (string: `org` or `user`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "tasks": [
      {
        "_id": "task-uuid",
        "name": "Implement SSO Integration",
        "project": "Security",
        "status": "inprocess",
        "workDate": "2026-09-15",
        "bill": {
          "allocatedHours": 10.0,
          "billedHours": 8.5,
          "actualHours": 9.0
        },
        "timeEntries": []
      }
    ],
    "hasMore": false,
    "metrics": {
      "totalAllocated": 10.0,
      "totalBilled": 8.5,
      "totalActual": 9.0
    }
  }
  ```

### `POST /api/tasks`
Create a new task record.
- **Request Body**:
  ```json
  {
    "name": "Database Schema Migration",
    "project": "Backend Infrastructure",
    "status": "dev",
    "workDate": "2026-09-15",
    "bill": {
      "allocatedHours": 8,
      "billedHours": 8,
      "actualHours": 6
    },
    "clickUpUrl": "https://app.clickup.com/t/8675309"
  }
  ```

### `PUT /api/tasks/[taskId]`
Updates task metadata or status.

### `DELETE /api/tasks/[taskId]`
Deletes task record.

---

## 3. Time Entry Log Endpoints

### `POST /api/tasks/[taskId]/time-entries`
Append a new time log entry to a task.
- **Request Body**:
  ```json
  {
    "date": "2026-09-15",
    "hours": 3.5,
    "note": "Initial migration script development",
    "status": "dev"
  }
  ```

---

## 4. Reports Endpoints

### `GET /api/reports`
Generate summary report items.
- **Query Params**: `project`, `startDate`, `endDate`.
- **Response `200 OK`**: `{ "success": true, "tasks": [...] }`

---

## 5. Super Admin Endpoints

### `GET /api/admin`
Fetch database diagnostics, connection pool status, and cross-organization telemetry.
- **Access**: `superAdmin` role required.
