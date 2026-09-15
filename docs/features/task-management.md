# Task Management Feature Documentation

## 1. Feature Overview
The Task Management system enables developers, managers, and project leaders to track work items, link tasks to ClickUp URLs, allocate hours, log time entries, and copy text-based summaries.

---

## 2. Core Capabilities

### Task Creation & Field Auto-Parsing
- **ClickUp URL Parsing**: When pasting a ClickUp task link (e.g. `https://app.clickup.com/t/8675309`), the system automatically extracts the task ID (`8675309`) and triggers auto-fill scraping if enabled.
- **Dynamic Field Schemas**: Renders organization-specific custom metadata fields (e.g., Jira Key, Client Billing Code).

### Multi-View Display Interfaces
1. **New List View (`TaskListView.js`)**: Grouped chronologically by work date with collapsible daily headers, hour variance indicators (`Over by X.Xh` / `On track`), and an integrated **Copy Task** button.
2. **Card View (`TaskCards.js`)**: Grid layout optimized for visual project sorting.
3. **Classic Table View (`TaskTable.js`)**: Dense tabular interface for rapid data auditing.

### Copy Task Feature
Clicking the **Copy** button on any task row formats and places the following structured summary into the user's clipboard:
```text
id: 8675309
name: Implement SSO Integration
project: Security
date: 9/15/2026
bill hours: 8.5
```
