# Project Structure & Navigation Guide

```
BillArchive/
├── docs/                        # Complete System Documentation (Markdown)
│   ├── api/                     # API specification and endpoints
│   ├── architecture/            # Architecture overview, stack, and data flow
│   ├── deployment/              # Vercel & Supabase deployment guides
│   ├── development/             # Coding standards & directory mapping
│   ├── features/                # Core features (Tasks, Reports, Multi-tenancy)
│   └── testing/                 # Testing strategy & coverage guidelines
├── src/
│   ├── app/                     # Next.js App Router Structure
│   │   ├── @authModal/          # Parallel Route Intercepting Auth Modals
│   │   │   ├── (.)login/        # Soft-nav Login Modal
│   │   │   ├── (.)register/     # Soft-nav Register Modal
│   │   │   ├── [...catchAll]/   # Catch-all fallback slot handler
│   │   │   └── default.js       # Default slot export
│   │   ├── [orgId]/             # Organization Namespace Dynamic Route
│   │   │   └── [userId]/        # User Workspace Dynamic Route
│   │   │       ├── [taskId]/    # Individual Task Detail View
│   │   │       ├── profile/     # User & Organization Preference Config
│   │   │       ├── projects/    # Organization Project Directory
│   │   │       ├── reports/     # Time Logging & Billing Text Generator
│   │   │       └── page.js      # Main Interactive Task Dashboard
│   │   ├── superadmin/          # System Administration & Diagnostic Panel
│   │   ├── docs/                # Interactive Documentation System (`/docs`)
│   │   ├── login/               # Dedicated Full-Page Login
│   │   ├── register/            # Dedicated Full-Page Register
│   │   └── layout.js            # Root App Layout with TanStack & Redux Providers
│   ├── components/              # Reusable UI Components
│   │   ├── TaskListView.js      # New List View UI with Date Grouping & Copy Button
│   │   ├── TaskCards.js         # Card Grid View Component
│   │   ├── TaskTable.js         # Classic Table View Component
│   │   ├── MetricsBar.js        # Hours Allocation KPI Widgets
│   │   └── LogTimeModal.js      # Time Entry Logging Modal
│   ├── lib/                     # Core Business Logic & State Management
│   │   ├── hooks/               # Custom TanStack Query Hooks (`useTasksQuery`)
│   │   ├── store/               # Redux Toolkit Slices (`taskSlice`, `authSlice`)
│   │   ├── db/                  # Database Service & Knex Adapters
│   │   ├── config.js            # Single Source of Truth Brand Configuration
│   │   └── apiClient.js         # Universal Frontend API Client Interface
└── tests/                       # Node.js Test Runner Automated Test Suite
```
