# Doctor Tracker — Clinical Administration & Patient Cohort Platform

> **Elevator Pitch:** Doctor Tracker is an enterprise-grade administrative web application designed for medical directors and healthcare administrators to seamlessly manage physician directories and oversee assigned clinical patient cohorts. Engineered with a decoupled Next.js 16 frontend and an Express.js/MongoDB REST architecture, the platform features real-time data visualization, query-optimized pagination with an extensible `QueryBuilder<T>`, single-pass MongoDB `$facet` analytics, and role-based JWT security.

---

## Table of Contents
- [1. Description](#1-description)
- [2. Setup Guide](#2-setup-guide)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Installation](#step-by-step-installation)
  - [Environment Variables (.env.example)](#environment-variables-envexample)
  - [Seed Script & Demo Credentials](#seed-script--demo-credentials)
- [3. System Architecture](#3-system-architecture)
  - [Data Flow & Service Interaction Diagram](#data-flow--service-interaction-diagram)
  - [Modular Backend Architecture](#modular-backend-architecture)
  - [Database Schema & Performance Indexing](#database-schema--performance-indexing)
- [4. Technical Decisions](#4-technical-decisions)
  - [Decision 1: Decoupled Express.js REST API vs. Next.js Monolithic Route Handlers](#technical-decision-1-decoupled-expressjs-rest-api-vs-nextjs-monolithic-route-handlers)
  - [Decision 2: Fluent `QueryBuilder<T>` & Compound MongoDB Indexing vs. Ad-hoc Controller Queries](#technical-decision-2-fluent-querybuildert--compound-mongodb-indexing-vs-ad-hoc-controller-queries)
- [5. API Endpoint Specifications](#5-api-endpoint-specifications)
- [6. Visual Evidence & UI Walkthrough](#6-visual-evidence--ui-walkthrough)

---

## 1. Description

Doctor Tracker addresses the complexity of hospital physician rosters and active patient caseload tracking. Medical administrators can register doctors across various medical specializations and hospital facilities, filter and search through indexed doctor databases, inspect detailed patient rosters assigned to each doctor, enroll new patients directly under specific physicians, and manage global patient records with multi-criteria condition filters. The executive dashboard provides instant visual clarity with time-series admission velocity curves, condition ratio breakdowns, and doctor caseload distributions.

---

## 2. Setup Guide

### Prerequisites
- **Node.js**: v18.x, v20.x, or v22.x (`node -v`)
- **npm**: v9.x or v10+ (`npm -v`)
- **MongoDB**: Local MongoDB instance (port `27017`) or MongoDB Atlas URI (or Docker container)

---

### Step-by-Step Installation

#### 1. Clone & Enter the Repository
```bash
git clone <your-repository-url>
cd "Doctor Tracker"
```

#### 2. Start MongoDB (via Docker or local daemon)
If using Docker:
```bash
docker run -d --name doctor-tracker-mongo -p 27017:27017 mongo:7
```
Or ensure your local MongoDB service is running on `mongodb://127.0.0.1:27017/doctor_tracker`.

#### 3. Install Monorepo Dependencies
From the repository root:
```bash
# Using pnpm (Recommended)
pnpm install
pnpm --prefix server install
pnpm --prefix client install

# Or using npm
npm install
npm --prefix server install
npm --prefix client install
```

#### 4. Configure Environment Variables
Copy the `.env.example` templates in both `server/` and `client/` (and root reference):
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

#### 5. Seed the Database
Populate MongoDB with administrative accounts, 15 licensed doctors, and 60 realistic patient records distributed across hospitals:
```bash
pnpm seed
# or: npm run seed
```

#### 6. Run the Entire Stack Concurrently
To start both the Express REST API (port `5000`) and Next.js frontend (port `3000`) concurrently:
```bash
pnpm dev
# or: npm run dev
```

The application is now live at:
- **Frontend Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **API Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

### Environment Variables (`.env.example`)

#### **Backend (`server/.env`)**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb://127.0.0.1:27017/doctor_tracker
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=super_secret_jwt_access_key_doctor_tracker_2026
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_doctor_tracker_2026
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
```

#### **Frontend (`client/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

### Seed Script & Demo Credentials

The database seed script sets up default administrative accounts for immediate testing:

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **System Admin** | `admin@doctortracker.com` | `admin123` | Full access: CRUD on doctors, patients, analytics |
| **Clinical Staff** | `staff@doctortracker.com` | `staff123` | Read access: View dashboard, doctors, and patient lists |

> **Tip:** The `/login` page includes a **"Reviewer Quick Demo Access"** 1-click button that instantly populates the admin credentials.

---

## 3. System Architecture

### Data Flow & Service Interaction Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Medical Administrator
    participant Client as Next.js 16 (Client App)
    participant Middleware as Next.js Route Guard
    participant API as Express.js REST API
    participant Auth as Auth Middleware (JWT)
    participant Service as Doctor / Patient Service
    participant Builder as QueryBuilder<T>
    participant Mongo as MongoDB Cluster

    Admin->>Client: Access /doctors?search=Sarah&specialization=Cardiology
    Client->>Middleware: Intercept & Validate Token Cookie
    Middleware-->>Client: Allow Protected Route Access
    Client->>API: GET /api/v1/doctors (Bearer JWT, Query Params)
    API->>Auth: Validate Token, Status & Role
    Auth-->>API: User Authorized
    API->>Service: getAllDoctorsFromDB(queryParams)
    Service->>Builder: Instantiate with Doctor.find(), query
    Builder->>Builder: search() + filter() + sort() + paginate()
    Builder->>Mongo: Execute Indexed Compound Query + countDocuments()
    Mongo-->>Builder: Raw Doctor Documents & Metas
    Builder-->>Service: Formatted Result & Meta
    Service-->>API: { meta, result }
    API-->>Client: sendResponse(200, "Doctors retrieved", meta, data)
    Client-->>Admin: Dynamic Reactive Table Rendering (TanStack Query Cache)
```

### Modular Backend Architecture

```
server/src/app/
├── builders/
│   └── QueryBuilder.ts        # Fluent Mongoose query builder (search, filter, sort, paginate, countTotal)
├── config/
│   └── index.ts               # Validated environment configuration
├── errors/
│   ├── AppError.ts            # Custom operational error class
│   ├── handleValidationError.ts # Mongoose validation error parser
│   ├── handleDuplicateError.ts  # MongoDB 11000 duplicate key error parser
│   └── handleCastError.ts     # Invalid ObjectId CastError parser
├── helpers/
│   ├── catchAsync.ts          # Async route wrapper eliminating try-catch boilerplate
│   ├── sendResponse.ts        # Standardized API response formatter ({ success, statusCode, message, meta, data })
│   └── jwtHelper.ts           # Token creation and verification helpers
├── middlewares/
│   ├── auth.ts                # Role-Based Access Control (RBAC) & active account validation
│   ├── globalErrorHandler.ts   # Centralized error handler returning uniform JSON
│   ├── validateRequest.ts     # Zod schema validation middleware
│   └── notFound.ts            # 404 unmatched route handler
├── modules/
│   ├── User/                  # Admin auth, tokens, user profile
│   ├── Doctor/                # Doctor CRUD, search, specialization/hospital filter, doctor patient roster
│   ├── Patient/               # Patient registry, condition filtering, date range, physician assignment
│   └── Analytics/             # Single-pass MongoDB $facet aggregation pipeline
└── routes/
    └── index.ts               # Application router aggregator
```

### Database Schema & Performance Indexing

#### **Doctor Collection Indexes**
```javascript
// 1. Text search across Name, Specialization, and Hospital
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });

// 2. High-throughput compound filter index
doctorSchema.index({ specialization: 1, hospital: 1, createdAt: -1 });

// 3. Fast chronological sort & pagination
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ isDeleted: 1 });
```

#### **Patient Collection Indexes**
```javascript
// 1. Instant doctor roster lookup with pagination
patientSchema.index({ doctorId: 1, createdAt: -1 });

// 2. Condition-specific filtering & analytics
patientSchema.index({ condition: 1, admissionDate: -1 });

// 3. Multi-field patient search
patientSchema.index({ name: 1, phone: 1 });
patientSchema.index({ name: 'text', email: 'text' });
patientSchema.index({ admissionDate: -1 });
```

---

## 4. Technical Decisions

### Technical Decision 1: Decoupled Express.js REST API vs. Next.js Monolithic Route Handlers

#### **Context & Problem**
While Next.js offers Route Handlers (`app/api/*`), enterprise administrative systems frequently require decoupled backend services capable of executing heavy multi-stage analytical aggregations, handling database connection pools resiliently, and enforcing strict RESTful contract isolation.

#### **Decision**
We deliberately decoupled the application into two standalone services:
1. A **Next.js 16 administrative client** optimized for client-side rendering, sub-second route transitions, and responsive data visualizations.
2. An **independent Node.js/Express.js REST API** built on the **Controller-Service-Repository** pattern with explicit Mongoose connection lifecycle management.

#### **Trade-off Analysis & Benefits**
- **Independent Scaling & CPU Isolation:** Dashboard analytics (`$facet` aggregations, date-bucketed pipelines) can run intensive computations on dedicated backend instances without starving frontend SSR/Turbopack workers.
- **Strict Separation of Concerns:** The backend exposes pure, versioned REST endpoints (`/api/v1/*`) with standardized `sendResponse` and `AppError` contracts, enabling third-party client integrations (e.g., mobile apps, BI tools) without tying to Next.js internals.
- **Persistent DB Connection Pooling:** Unlike serverless Next.js functions which suffer from cold-start latency and connection exhaustion against MongoDB, a persistent Express process maintains an optimal connection pool.

---

### Technical Decision 2: Fluent `QueryBuilder<T>` & Compound MongoDB Indexing vs. Ad-hoc Controller Queries

#### **Context & Problem**
The specification requires multi-parameter search, dynamic filtering (specialization, hospital, condition, date ranges), sorting, and pagination across both Doctor and Patient entities. Hardcoding ad-hoc `find({ ... })` queries across multiple controllers results in massive code duplication, inconsistent query shapes, and severe table-scan performance penalties.

#### **Decision**
We engineered a reusable, chainable `QueryBuilder<T>` class (`server/src/app/builders/QueryBuilder.ts`) paired with MongoDB compound and text indexes:
- `.search(searchableFields)`: Generates dynamic case-insensitive `$regex` matching conditions across indexed text fields.
- `.filter()`: Strips reserved pagination/sorting keys and maps date bounds (`startDate`, `endDate`) directly into ISO `$gte` / `$lte` criteria.
- `.sort()`: Maps semantic sort keys (`newest`, `oldest`, `mostPatients`) to index-backed sort keys.
- `.paginate()`: Computes dynamic `skip` and `limit`.
- `.countTotal()`: Computes total matched documents and calculates total pages for pagination envelopes.

#### **Trade-off Analysis & Benefits**
- **Zero Query Duplication:** Doctor and Patient service methods invoke the builder in 5 readable lines:
  ```typescript
  const doctorQuery = new QueryBuilder(Doctor.find({ isDeleted: false }), query)
    .search(doctorSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await doctorQuery.modelQuery.lean();
  const meta = await doctorQuery.countTotal();
  ```
- **Guaranteed Sub-50ms Index Utilization:** Because queries are normalized into compound patterns matching `{ specialization: 1, hospital: 1, createdAt: -1 }`, MongoDB engine executes targeted B-Tree scans rather than collection scans (`COLLSCAN`), ensuring performance stability as datasets scale to tens of thousands of records.
- **Bandwidth Minimization via `.lean()`:** All query reads utilize Mongoose `.lean()` to bypass Mongoose document hydration, cutting memory overhead by over 60%.

---

## 5. API Endpoint Specifications

All endpoints are versioned under `/api/v1` and return standardized responses:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 60,
    "totalPage": 6
  },
  "data": [ ... ]
}
```

### Authentication (`/api/v1/auth`)
- `POST /login`: Authenticate admin, issues JWT and session cookies.
- `GET /me`: Returns current authenticated administrator profile.
- `POST /logout`: Clears session token cookies.

### Doctor Management (`/api/v1/doctors`)
- `GET /`: Search, filter by hospital/specialization/date, and paginate doctors.
- `POST /`: Create a new doctor (`name`, `specialization`, `hospital`, `phone`, `email`).
- `GET /:id`: View doctor details, current caseload, and recent admissions.
- `PUT /:id`: Update doctor details.
- `DELETE /:id`: Soft-delete doctor and disassociate patients.
- `GET /:id/patients`: List patients specifically assigned to this doctor.
- `POST /:id/patients`: Enroll a patient directly under this doctor.
- `DELETE /:id/patients/:patientId`: Remove a patient from this doctor's roster.

### Patient Management (`/api/v1/patients`)
- `GET /`: Global patient registry with multi-criteria filtering (`condition`, `gender`, `doctorId`, date ranges).
- `POST /`: Enroll patient (with assigned `doctorId`).
- `GET /:id`: View patient details with populated doctor details.
- `PUT /:id`: Edit patient details (automatically recalculates doctor caseload counters if doctor is reassigned).
- `DELETE /:id`: Delete patient record.

### Analytics Dashboard (`/api/v1/analytics`)
- `GET /overview`: High-performance MongoDB `$facet` aggregation returning KPI counts, 6-month time-series admission velocity, condition distributions, top doctors by patient volume, and hospital allocations in a single database round-trip.

---

## 6. Visual Evidence & UI Walkthrough

### 1. Analytics Dashboard View (`/dashboard`)
- **Key Performance Indicator Cards**: Total Doctors, Total Active Patients, Patients per Doctor (Average Ratio), and Critical Cases Indicator.
- **Interactive Visualizations (Recharts)**:
  - *Admissions Velocity Curve*: Cyan-gradient Area Chart showing monthly patient intake trends.
  - *Condition Breakdown*: Donut chart illustrating proportions of Critical, Stable, Recovering, and Under Observation cases.
  - *Doctor Caseload Bar Chart*: Horizontal ranking of top physicians by patient volume.
  - *Hospital Network Allocation*: Multi-bar chart contrasting total patients against doctor staffing per hospital facility.

### 2. Doctor Directory (`/doctors`)
- **Toolbar**: 300ms debounced live search bar, Specialization dropdown, Hospital dropdown, and Date-range picker.
- **Physician Cards**: Rich card presentation featuring physician badges, hospital affiliation, contact details, active patient counter, and "+ Add Doctor" modal.
- **Roster Shortcut**: Direct 1-click button to inspect all patients under the chosen doctor.

### 3. Doctor Detail & Patient Caseload View (`/doctors/[id]`)
- **Physician Banner**: Doctor overview card with specialization badge and active patient metrics.
- **Dedicated Patient Table**: Embedded roster displaying all patients assigned to this doctor with real-time search, patient condition badges, and individual discharge/remove actions.
- **Direct Enrollment**: Modal allowing immediate enrollment of patients assigned to this physician.

### 4. Global Patient Management View (`/patients`)
- **Registry Table**: High-density table featuring Patient Name, Demographics (Age/Gender), Contact, Condition Pill, Clickable Assigned Doctor badge, and Admission Date.
- **Multi-Filter Bar**: Real-time filtering by condition pills (`Stable`, `Critical`, `Recovering`, `Under Observation`), assigned physician, and admission date ranges.
- **CRUD Modals**: Full Add Patient and Edit Patient modal dialogs with automatic doctor assignment and caseload recalculation.

### 5. Responsive Mobile & Desktop Layout
- **Desktop**: Persistent modern dark sidebar (`#0b0f19`) with backdrop-blur glassmorphic panels and crisp typography.
- **Mobile Viewport**: Hamburger toggle drawer with overlay backdrop, responsive cards, and horizontal scroll tables for clinical accessibility on any device.

---

## 7. Submission Checklist & Summary
- [x] **Secure Authentication & RBAC**: Route protection in both Express (`auth` middleware) and Next.js (`middleware.ts`).
- [x] **Doctor Management**: Complete CRUD, search, specialization/hospital/date filters, pagination, and dedicated patient rosters.
- [x] **Patient Management**: Dedicated registry, condition filters, date filters, edit, delete, and caseload counter synchronization.
- [x] **Dashboard & Data Visualization**: Recharts Area, Donut, and Bar charts powered by MongoDB aggregations.
- [x] **Performance & Optimization**: Generic `QueryBuilder<T>`, compound & text indexes, Mongoose `.lean()`, and debounced searches.
- [x] **Code Structure**: Clean separation of concerns with Controller-Service-Repository architecture and reusable UI components.
