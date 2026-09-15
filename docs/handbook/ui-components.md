# UI Components Handbook

This document provides a comprehensive, hierarchical reference for all UI components in the Bill Archive Platform, including their props, visual states, internal state variables, interactive elements, button handlers, and API side-effects.

---

## 1. Modals (`src/components/*Modal.js`)

### 1.1 TaskFormModal (`TaskFormModal.js`)
- **File Location**: `src/components/TaskFormModal.js`
- **Purpose**: Primary modal interface for creating new tasks or editing existing task metadata.
- **Props Schema**:
  - `isOpen` (`boolean`): Controls modal visibility.
  - `onClose` (`function`): Callback fired when modal is dismissed or cancelled.
  - `initialData` (`object | null`): Optional existing task object for editing mode.
  - `projectId` (`string`): Current active project ID.
  - `orgId` (`string`): Organization identifier.
- **Internal Component State**:
  - `taskName` (`string`): Controlled input for task title.
  - `url` (`string`): External ClickUp/Jira URL.
  - `estimatedHours` (`number`): Decimal planned duration.
  - `status` (`string`): Active workflow status.
  - `customMetadata` (`object`): Key-value pairs for organization dynamic fields.
  - `isScraping` (`boolean`): Loading state during URL title auto-scraping.
- **Interactive Elements & Handlers**:
  - **ClickUp URL Input (`url`)**: On blur or paste, triggers auto-scraping via `GET /api/title-scraper?url=...`. Automatically populates `taskName` and extracts `externalTaskId`.
  - **Task Title Input (`taskName`)**: Required text field.
  - **Estimated Hours Input (`estimatedHours`)**: Decimal input (e.g. `8.5`).
  - **Status Selector (`status`)**: Dropdown menu populated from `orgConfig` status definitions.
  - **Custom Schema Inputs**: Dynamically renders text/number fields based on `orgConfig.customFields`.
  - **Submit Button ("Save Task")**: 
    - Edit Mode: Invokes `PATCH /api/tasks/[id]` updating the `tasks` table.
    - Create Mode: Invokes `POST /api/tasks` creating a record in `tasks`.
    - Triggers query invalidation for `['tasks']` cache in TanStack Query.
  - **Cancel Button**: Clears internal form state and calls `onClose()`.

### 1.2 LogTimeModal (`LogTimeModal.js`)
- **File Location**: `src/components/LogTimeModal.js`
- **Purpose**: Modal interface for logging work hours against a task.
- **Props Schema**:
  - `isOpen` (`boolean`): Modal visibility state.
  - `onClose` (`function`): Close handler.
  - `task` (`object`): Selected task object.
  - `onTimeLogged` (`function`): Optional completion callback.
- **Internal Component State**:
  - `hours` (`number | string`): Logged work duration.
  - `workDate` (`string`): YYYY-MM-DD date string.
  - `notes` (`string`): Work description.
  - `isSubmitting` (`boolean`): Loading indicator during API request.
- **Interactive Elements & Handlers**:
  - **Logged Hours Input (`hours`)**: Number input (e.g., `2.5`).
  - **Work Date Picker (`workDate`)**: Defaults to current local date (`YYYY-MM-DD`).
  - **Work Notes Textarea (`notes`)**: Textarea for detailed work logs.
  - **Submit Button ("Log Hours")**: Sends `POST /api/tasks/[id]` with payload `{ hours, workDate, notes }`. Inserts a row into `time_entries` and updates task aggregate totals.
  - **Close Button**: Resets form and dismisses modal.

### 1.3 AuditLogModal (`AuditLogModal.js`)
- **File Location**: `src/components/AuditLogModal.js`
- **Purpose**: Audit viewer displaying task history and historical time log entries.
- **Props Schema**:
  - `isOpen` (`boolean`): Controls drawer/modal display.
  - `onClose` (`function`): Close handler.
  - `task` (`object`): Target task object.
- **Interactive Elements & Handlers**:
  - **Log Timeline**: Chronological list of logged entries and metadata changes.
  - **Delete Log Button (`Trash` icon)**: Triggers API call to remove entry from `time_entries`.

### 1.4 EditLogModal (`EditLogModal.js`)
- **File Location**: `src/components/EditLogModal.js`
- **Purpose**: Modal for updating an existing time entry.
- **Interactive Elements**: Hours input, notes field, and save button.

---

## 2. Views & Layout Components (`src/components/Task*.js`)

### 2.1 TaskListView (`TaskListView.js`)
- **File Location**: `src/components/TaskListView.js`
- **Purpose**: Chronological daily list view of tasks with collapsible headers and daily total hour rollups.
- **Props Schema**: `tasks` (`array`), `onEditTask` (`function`), `onLogTime` (`function`), `onDeleteTask` (`function`).
- **Interactive Elements & Handlers**:
  - **Group Header Collapse Toggle**: Toggles visibility of tasks under a specific work date.
  - **"Copy Task" Button (`Copy` icon)**: Formats task metadata into structured text (`id: ...`, `name: ...`, `project: ...`, `date: ...`) and writes to navigator clipboard with visual toast feedback.
  - **"Log Time" Button (`Clock` icon)**: Launches `LogTimeModal`.
  - **"Edit Task" Button (`Pencil` icon)**: Launches `TaskFormModal` pre-populated with task data.
  - **"Delete Task" Button (`Trash` icon)**: Prompts confirmation and executes `DELETE /api/tasks/[id]`.

### 2.2 TaskCards (`TaskCards.js`)
- **File Location**: `src/components/TaskCards.js`
- **Purpose**: Visual card grid layout sorted by project and status.
- **Interactive Elements**: Card click handler, quick time log action, status pills.

### 2.3 TaskTable (`TaskTable.js`)
- **File Location**: `src/components/TaskTable.js`
- **Purpose**: Dense data grid view for rapid data auditing and column sorting.
- **Interactive Elements**: Sortable column headers (Task ID, Name, Estimate, Logged, Variance), action button toolbar.

---

## 3. Controls & Navigation

### 3.1 FilterControls (`FilterControls.js`)
- **File Location**: `src/components/FilterControls.js`
- **Purpose**: Global top-bar filter component.
- **Interactive Elements**:
  - **Search Bar**: Debounced real-time text filter.
  - **Project Dropdown**: Selects target project.
  - **Status Selector**: Filters by task status.
  - **Date Range Picker**: Filters tasks by creation date range.
  - **Clear Filters**: Resets filters to default Redux state.
