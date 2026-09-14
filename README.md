# Task & Time Management Platform (Bill Archive)

A high-performance, enterprise-ready multi-tenant task and time log management system built with **Next.js 16 (App Router)**, **Redux Toolkit**, **TanStack Query v5**, and **PostgreSQL**.

---

## 🚀 Key Features & Capabilities

- **Sunday-to-Saturday Weekly Dashboard (`TaskListView.js`)**: Strict weekly timeframe navigation with `Current Week`, `Previous Week`, and `Next Week` relative badges.
- **Dedicated Time Log Editor (`EditLogModal.js`)**: Edit specific time log entries with custom dates, allocated, billed, and actual hours without corrupting parent task summary metrics.
- **Organization-Wide Projects View (`/projects`)**: Dropdown-driven project list displaying all organization-wide tasks and assigned user details (`task.user`, `task.author_name`, `task.email`).
- **Custom Status & Color Management (`StatusConfig.js`)**: Create, edit, or delete custom statuses and assign dynamic status colors across table, card, and list views.
- **Browser-Based Documentation Viewer (`/docs`)**: Interactive, browser-accessible documentation suite for architecture, APIs, and guidelines.
- **Zero-Dependency Automated Testing (`npm test`)**: Built-in test runner validating week date parsing, project synchronization, and status color lookups.

---

## 📚 Documentation Map

The repository maintains formal technical documentation under the `docs/` directory, accessible via filesystem or browser (`/docs/...`):

| Category | File Path | Browser Link | Summary |
| :--- | :--- | :--- | :--- |
| **Architecture** | [`docs/architecture/overview.md`](docs/architecture/overview.md) | `/docs/architecture/overview` | Core architectural patterns, state management, DB layer |
| **Project Structure** | [`docs/development/project-structure.md`](docs/development/project-structure.md) | `/docs/development/project-structure` | Directory tree & file responsibility map |
| **Coding Standards** | [`docs/development/coding-standards.md`](docs/development/coding-standards.md) | `/docs/development/coding-standards` | Next.js 16 conventions, API standards, date rules |
| **Task Management** | [`docs/features/task-management.md`](docs/features/task-management.md) | `/docs/features/task-management` | Task workflows, creation modals, status history |
| **Projects & Orgs** | [`docs/features/projects-and-organizations.md`](docs/features/projects-and-organizations.md) | `/docs/features/projects-and-organizations` | Multi-tenancy, dropdown project viewer, user assignments |
| **Time Logs & Reports**| [`docs/features/time-logging-and-reports.md`](docs/features/time-logging-and-reports.md) | `/docs/features/time-logging-and-reports` | Time log entry modal, edit log vs task logic, reports |
| **API Endpoints** | [`docs/api/endpoints.md`](docs/api/endpoints.md) | `/docs/api/endpoints` | Complete RESTful API documentation |
| **Testing Strategy** | [`docs/testing/testing-strategy.md`](docs/testing/testing-strategy.md) | `/docs/testing/testing-strategy` | Automated test suite execution and test specs |
| **Deployment** | [`docs/deployment/deployment.md`](docs/deployment/deployment.md) | `/docs/deployment/deployment` | PostgreSQL and Vercel environment setup |
| **AI Agent Prompt** | [`prompts/default-project-prompt.md`](prompts/default-project-prompt.md) | N/A | Reusable prompt for future AI pair programming |

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
```bash
npm run db:migrate
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite

Run the zero-dependency test suite via Node.js native test runner:

```bash
npm test
# or
npm run test:unit
```
All 7 unit & integration tests validate:
- Sunday-to-Saturday date boundaries & timezone safety.
- Week status badge assignment (`Current Week`, `Previous Week`, `Next Week`).
- Project list deduplication and merging across sources.
- Custom status color lookup and default fallback handling.
