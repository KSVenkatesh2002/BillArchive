# Projects & Organizations

## Overview
The Bill Archive Platform organizes work logically through **Organizations** and **Projects**. This hierarchical structure allows for multi-tenant scalability, granular role-based access control (RBAC), and logical partitioning of tasks and resources.

## 1. Organizations

An **Organization** acts as the top-level container for a business unit or company using the platform.

### Organization Configuration
Organizations can possess specific global configurations defined in the `orgConfig` table. This includes:
- **Custom Schema Attributes**: Dynamic fields required for tasks (e.g., Jira Key, Client Billing Code).
- **Timezone Preferences**: Default timezone settings for the organization.
- **Reporting Limits**: Thresholds for time logging or hour variance limits.

### Membership & Roles
Users are invited to join an organization. Upon joining, they receive an organization-level role (e.g., Owner, Admin, Member) which dictates their global permissions across the workspace.

---

## 2. Projects

A **Project** exists within an Organization. It represents a specific initiative, client, or software product. 

### Project Entities
- **Members**: Subsets of Organization members can be allocated to specific projects.
- **Tasks**: Work items are exclusively tied to a single project.
- **Time Entries**: Logged time rolls up to a task, and ultimately, to the project for reporting.

### Project-Level Access
Users can have distinct roles at the project level, separate from their organization role. For instance, an Organization "Member" might be a "Project Manager" for Project A, but a standard "Developer" for Project B.

## Data Model (Supabase Schema)
- `organizations`: `id`, `name`, `created_at`
- `org_configs`: `org_id`, `schema_metadata`, `settings`
- `projects`: `id`, `org_id`, `name`, `status`, `created_at`
- `project_members`: `project_id`, `user_id`, `role`

## Integration Points
- **TanStack Query Caching**: Organization configurations (`useOrgConfigQuery`) are fetched once and cached globally to ensure rapid metadata rendering on task forms without repeated database calls.
- **SuperAdmin Management**: Global administrators can view and manage all Organizations and Projects across the platform via the `/superadmin` routes.
