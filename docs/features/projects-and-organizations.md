# Projects & Organizations Documentation

## Overview
Projects and Organizations form the multi-tenant backbone of the platform.

## Organization Configuration
- Admins can manage custom statuses, status colors, and dynamic fields via `/profile` (`StatusConfig.js`, `ProjectConfig.js`).
- Organization settings apply globally to all user members within that organization.

## Organization Projects Page (`/projects`)
- Accessible to users and admins.
- Features a **Dropdown Project Selector** to switch between active projects.
- Displays all tasks belonging to the current organization under the selected project.
- Displays author and worker assignments (`task.user`, `task.author_name`, `task.email`).
