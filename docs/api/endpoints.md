# API Endpoints Documentation

## Task Endpoints

### `GET /api/tasks`
Fetch tasks with pagination and filters.
- **Query Params**: `page`, `limit`, `project`, `scope` (`org` or `user`), `startDate`, `endDate`.
- **Response**: `{ success: true, tasks: [...], hasMore: boolean, metrics: {...} }`

### `POST /api/tasks`
Create a new task.
- **Body**: `{ name, project, status, bill: { allocatedHours, billedHours, actualHours }, dynamicValues }`

### `PUT /api/tasks/[taskId]`
Update task metadata or summary.

### `DELETE /api/tasks/[taskId]`
Delete a task.

## Time Entry Log Endpoints

### `POST /api/tasks/[taskId]/time-entries`
Add a new time log entry to a task.

### `PUT /api/tasks/[taskId]/time-entries/[entryId]`
Update a specific time log entry's date, hours, status, or note.

### `DELETE /api/tasks/[taskId]/time-entries/[entryId]`
Delete a specific time log entry.

## Project & Status Endpoints

### `GET /api/projects`
Returns all distinct projects in the user's organization.

### `POST /api/projects`
Add a new project name to user/organization project list.

### `GET /api/admin/statuses`
Fetch organization status list.

### `POST /api/admin/statuses`
Update organization status list.
