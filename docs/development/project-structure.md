# Project Structure

## Directory Layout

```
bill/
├── docs/                        # Formal System Documentation
│   ├── architecture/            # Architecture & Core Concepts
│   ├── development/             # Guidelines & Standards
│   ├── features/                # Domain Feature Specs
│   ├── api/                     # API Endpoint Docs
│   ├── testing/                 # Automated Testing Strategy
│   └── deployment/              # Deployment Guide
├── prompts/                     # Reusable AI Prompt Instructions
│   └── default-project-prompt.md
├── tests/                       # Automated Test Suite (Node.js Test Runner)
│   ├── weekDate.test.js
│   ├── projectsApi.test.js
│   └── statusColors.test.js
├── src/
│   ├── app/                     # Next.js App Router Pages & API Routes
│   │   ├── api/                 # API Handlers (/api/tasks, /api/projects, etc.)
│   │   ├── docs/                # Browser-based Documentation Viewer (/docs)
│   │   ├── [orgId]/[userId]/    # Authenticated Org & User Dashboard Pages
│   │   │   ├── page.js          # Dashboard View
│   │   │   ├── projects/        # Organization Projects Page
│   │   │   ├── reports/         # Reports & Analytics Page
│   │   │   └── profile/         # User & Organization Settings
│   ├── components/              # Shared UI Components
│   │   ├── TaskListView.js      # Main Weekly Task Dashboard
│   │   ├── TaskTable.js         # Table View Component
│   │   ├── TaskCards.js         # Grid Card View Component
│   │   ├── TaskFormModal.js     # Task Creation Modal
│   │   ├── EditLogModal.js      # Dedicated Log Details Edit Modal
│   │   ├── LogTimeModal.js      # Log Time Entry Modal
│   │   └── AuditLogModal.js     # Status Audit History Modal
│   └── lib/                     # Core Business Logic & DB Layer
│       ├── apiClient.js         # Centralized API Fetcher
│       ├── config.js            # Global Site Constants & Colors
│       ├── auth.js              # Authentication Utilities
│       ├── db/                  # Data Layer (dbService & pgAdapter)
│       └── store/               # Redux Store & Slices
├── README.md                    # System Root Overview & Links
└── package.json                 # Node Scripts & Dependencies
```
