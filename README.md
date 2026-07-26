# TaskFlow & Billing Matrix System

A modern, multi-tenant Next.js application built with **Redux Toolkit**, **MongoDB / In-Memory Store**, and a sleek **Pure Black Dark Theme** for managing dynamic project tasks, hours metrics, custom organization fields, and billing workflows.

---

## 🌟 Key Features

* **Redux Toolkit Architecture**:
  * Centralized state management across 8 specialized slices (`auth`, `org`, `task`, `bill`, `report`, `admin`, `superAdmin`, `ui`).
  * Async thunks for decoupled API interactions and zero prop drilling.

* **Multi-Tenant Workspace Structure**:
  * Intercepted dynamic routes for tasks and authentication (`/[orgId]/[userId]`).
  * Multi-organization tenant isolation with role-based access controls (`superAdmin`, `admin`, `user`).

* **Dynamic Field & Enabled Built-in Fields Schema**:
  * **Org Admin Controls**: Organization admins can toggle standard built-in fields (`allocatedHours`, `billedHours`, `actualHours`, `source`, `typeOfWork`, `project`, `clickupId`) using interactive checkboxes.
  * Custom metadata fields schema with dropdowns, toggles, selectors, and text inputs.

* **Task Lifecycle & Filtering**:
  * Status workflow history tracking (`inprocess`, `dev`, `ready for qa`, `qa complete`, `ready for code review`, `complete`, etc.).
  * Real-time metrics calculations (Allocated, Billed, Actual hours, and Efficiency Variance).
  * Flexible task filtering by source, work type, project, timeframe, and custom fields.

* **Intercepted Route Task Modal**:
  * Native modal overlay via Next.js parallel/intercepted routes (`@taskModal/(.)task-create`) with direct URL bookmarkability.

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: v18.x or higher
* **Package Manager**: npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd bill
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&wfocus=majority
   JWT_SECRET=your_jwt_secret_key_here
   ```
   > **Note**: If `MONGODB_URI` is omitted, the application automatically falls back to an **In-Memory Store** (Demo Mode) with pre-loaded mock data.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── [orgId]/[userId]/              # Dynamic multi-tenant dashboard
│   │   ├── @taskModal/                # Intercepted modal parallel route
│   │   ├── profile/                   # User profile & Org Admin configuration
│   │   ├── project/[name]/            # Project-specific workspace view
│   │   └── task-create/               # Standalone task creation route
│   ├── api/                           # Backend Next.js API route handlers
│   ├── login/                         # Sign-in route
│   ├── register/                      # Organization registration route
│   └── superadmin/                    # Multi-tenant provision controls
├── components/                        # Clean UI components (Table, Cards, Filters, MetricsBar)
├── lib/
│   ├── db/                            # MongoDB Atlas & In-Memory Adapters
│   ├── services/                      # Business logic layer (taskService, userService)
│   └── store/                         # Redux store & 8 slice definitions
```

---

## 🛠️ API & Database Architecture

* **Database Service Abstraction** (`src/lib/db/dbService.js`): Automatically selects between **MongoDB Atlas** (Mongoose) and **In-Memory Store** based on environment connectivity.
* **Redux Store Slices**:
  * `authSlice`: Handles user authentication state and session verification.
  * `orgSlice`: Manages dynamic fields and enabled field checklist configurations.
  * `taskSlice`: Controls task creation, editing, filtering, and metric aggregations.
  * `uiSlice`: Controls active view modes (Table vs. Cards) and toast notification displays.

---

## 📄 License

This project is licensed under the MIT License.
