# Coding Standards

## 1. Core Technologies
- **Framework**: Next.js 16 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit (Client State) & TanStack React Query (Server State)
- **Database / Auth**: Supabase

## 2. File and Directory Structure
- **Components**: Place UI components in `/src/components`. Maintain a flat structure unless a specific feature requires deep nesting.
- **Hooks**: Custom React hooks should reside in `/src/lib/hooks/` (e.g., `useTasksQuery.js`).
- **Pages**: Follow Next.js App Router conventions within `/src/app/`. Use localized layout files and parallel routing slots (`@authModal`) when appropriate.

## 3. Component Guidelines
- **Functional Components**: Use arrow functions for component definitions.
- **Client vs Server Components**: By default, components in the App Router are Server Components. Use the `"use client"` directive at the very top of a file only when necessary (e.g., for `useState`, `useEffect`, or event listeners like `onClick`).
- **Props Validation**: As TypeScript is not currently enforced, ensure clear JSDoc comments or default parameters are utilized to document prop expectations.

## 4. State Management (The Hybrid Approach)
- **TanStack Query**: Use for all asynchronous data fetching, caching, and mutations.
  - **Rules**: Always define unique query keys array (e.g., `['tasks', projectId]`). Handle `isLoading` and `isError` states gracefully in the UI.
- **Redux Toolkit**: Use strictly for synchronous, global UI state (e.g., UI theme, active modal identifiers, global filter selections).

## 5. Styling with Tailwind CSS
- Avoid inline CSS. Use utility classes.
- Construct modular class strings using template literals when conditional styling is needed.
- Utilize the design tokens defined in `globals.css` (e.g., `--background`, `--foreground`) for theme consistency (Dark/Light mode).

## 6. Code Formatting and Linting
- Ensure all code passes `eslint` validation (`npm run lint`).
- Use standard camelCase for variables/functions, and PascalCase for React Components.
