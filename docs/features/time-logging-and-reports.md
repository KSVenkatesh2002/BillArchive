# Time Logging & Reports Documentation

## 1. Hour Allocation Metrics

Every task maintains three primary hour allocation dimensions:
- **Allocated Hours**: The initial estimated hour budget.
- **Billed Hours**: The billable hours invoiced or logged.
- **Actual Hours**: The total real time spent by developers.

### Variance Formula
$$\text{Variance} = \text{Allocated Hours} - \text{Actual Hours}$$

- If **Variance < 0**: Highlighted in red as `Over by X.Xh`.
- If **Variance >= 0**: Indicated as `On track`.

---

## 2. Time Log Entry Logs

Tasks can contain multiple nested time entries. Each entry logs:
- `date`: Work date (`YYYY-MM-DD`).
- `hours`: Time spent.
- `note`: Description of work completed.
- `status`: Work status associated with that log instance.

---

## 3. Automated Report Generator (`/reports`)

The Reports view generates formatted client billing summaries ready for email or invoice inclusion:
- **Project Filter**: Filter by individual project or generate for all projects.
- **Date Range**: Select custom start and end date bounds.
- **Content Toggles**: Toggle hour breakdowns, audit histories, ClickUp links, metadata tags, and total summaries.
- **Task Exclusion**: Check/uncheck specific tasks to exclude them from the generated report text.
