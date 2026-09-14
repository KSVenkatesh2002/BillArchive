# Coding Standards & Guidelines

## 1. Next.js App Router Rules
- Read `node_modules/next/dist/docs/` for breaking changes and conventions.
- All client components MUST declare `"use client";` at the top of the file.
- Dynamic route parameters must be extracted via `useParams()` or `React.use()` in page components.

## 2. API & Data Access Standards
- Never call database adapters directly inside page components. Always go through `apiClient.js` on the frontend or `dbService.js` on the server.
- All API handlers (`src/app/api/.../route.js`) MUST use consistent JSON response structures:
  ```json
  { "success": true, "data": ... }
  ```
  or
  ```json
  { "success": false, "error": "Error message description" }
  ```

## 3. Date & Timezone Conventions
- Week calculations must always start on **Sunday** (`d.getDay() === 0`) and end on **Saturday** (`d.getDay() === 6`).
- Date parameters (`weekStart`) passed in URLs must be parsed using local date constructors (`parseLocalDate`) to avoid UTC day-shift bugs.

## 4. UI & Styling Rules
- Use Vanilla CSS and Tailwind CSS classes with pre-tailored HSL or dark-mode color palettes.
- Do not hardcode static colors inside components if status colors are customizable. Use `statusColors[status]` fallback maps.
