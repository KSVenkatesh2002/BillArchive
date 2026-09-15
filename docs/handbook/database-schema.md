# Database Schema & Side-Effects Handbook

This document provides a detailed reference for the PostgreSQL / Supabase database schema used by the Bill Archive Platform, including tables, columns, foreign keys, and API side-effects.

---

## 1. Entity Relationship Overview

```
[organizations] ──1:N──> [org_configs]
       │
       ├──1:N──> [projects] ──1:N──> [tasks] ──1:N──> [time_entries]
       │             │                 │
       └──1:N──> [project_members] <───┘
```

---

## 2. Table Specifications

### 2.1 `users`
Stores platform user accounts and credentials.
- `id` (UUID, Primary Key): Unique user identifier.
- `email` (TEXT, Unique): User email address.
- `password_hash` (TEXT): Encrypted password string.
- `full_name` (TEXT): User display name.
- `role` (TEXT): Platform role (`superadmin`, `admin`, `member`).
- `created_at` (TIMESTAMP): Account creation timestamp.

### 2.2 `organizations`
Top-level multi-tenant organization container.
- `id` (UUID, Primary Key): Organization ID.
- `name` (TEXT): Organization name.
- `created_at` (TIMESTAMP): Creation date.

### 2.3 `org_configs`
Stores dynamic organization configurations and custom field metadata schemas.
- `id` (UUID, Primary Key)
- `org_id` (UUID, Foreign Key -> `organizations.id`): Associated organization.
- `custom_fields` (JSONB): Array of dynamic field definitions (e.g. Jira Key, Client Billing Code).
- `statuses` (JSONB): Workflow status definitions and color codes.
- `updated_at` (TIMESTAMP)

### 2.4 `projects`
Projects created under an organization.
- `id` (UUID, Primary Key)
- `org_id` (UUID, Foreign Key -> `organizations.id`)
- `name` (TEXT): Project title.
- `description` (TEXT): Project details.
- `status` (TEXT): Project status (`active`, `archived`).
- `created_at` (TIMESTAMP)

### 2.5 `project_members`
Maps user membership and project-level roles.
- `id` (UUID, Primary Key)
- `project_id` (UUID, Foreign Key -> `projects.id`)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `role` (TEXT): Project role (`lead`, `developer`, `viewer`).

### 2.6 `tasks`
Work items created within projects.
- `id` (UUID, Primary Key)
- `project_id` (UUID, Foreign Key -> `projects.id`)
- `task_name` (TEXT): Title of the task.
- `external_task_id` (TEXT): ClickUp / Jira external task ID.
- `external_url` (TEXT): ClickUp task URL.
- `estimated_hours` (NUMERIC): Planned hours.
- `status` (TEXT): Current workflow status (e.g. `In Progress`, `Completed`).
- `custom_metadata` (JSONB): Key-value pairs for dynamic organization fields.
- `created_at` (TIMESTAMP)

### 2.7 `time_entries`
Logged work time entries tied to tasks.
- `id` (UUID, Primary Key)
- `task_id` (UUID, Foreign Key -> `tasks.id`)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `hours` (NUMERIC): Logged work duration.
- `work_date` (DATE): Date work was performed.
- `notes` (TEXT): Description of work completed.
- `created_at` (TIMESTAMP)

### 2.8 `audit_logs`
System-wide audit trail for security and tracking.
- `id` (UUID, Primary Key)
- `org_id` (UUID, Foreign Key -> `organizations.id`)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `action` (TEXT): Event description (e.g. `TASK_DELETE`, `TIME_LOGGED`).
- `payload` (JSONB): Contextual event data.
- `created_at` (TIMESTAMP)

---

## 3. Database Side-Effects by API Action

| API Action | Target Table(s) | Operation | Side-Effect Description |
|---|---|---|---|
| `POST /api/auth/register` | `users` | `INSERT` | Creates user record with hashed password. |
| `POST /api/tasks` | `tasks`, `time_entries`, `status_history` | `INSERT` | Creates new task AND automatically creates an initial `time_entries` log record for the specified `workDate`. |
| `POST /api/tasks/[id]` (`updateTimeEntry`) | `time_entries`, `tasks` | `UPDATE` | Modifies `time_entries` record and automatically recalculates parent `tasks` aggregate billing metrics (`allocated_hours`, `billed_hours`, `actual_hours`). |
| `PATCH /api/tasks/[id]` | `tasks`, `time_entries` | `UPDATE` | Modifies status/metadata/estimates on `tasks` table and syncs single child time entry if present. |
| `DELETE /api/tasks/[id]` | `tasks`, `time_entries` | `DELETE` | Removes task and cascades deletion of all linked time entries. |
| `POST /api/organization/config` | `org_configs` | `UPSERT` | Updates dynamic schema metadata for custom task fields. |
