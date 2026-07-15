# PI Planning Hub - Architecture Document

## 1. Executive Summary

PI Planning Hub is an enterprise-grade Program Increment (PI) Planning platform built on the Scaled Agile Framework (SAFe®). It replaces traditional spreadsheet-based and PowerPoint-driven PI Planning events with a real-time, collaborative web application. The platform supports multi-ART (Agile Release Train) coordination, role-based dashboards, and comprehensive analytics.

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (Turbopack) | React framework with server-side rendering |
| **UI Components** | Radix UI + TailwindCSS v4 | Accessible, composable UI primitives |
| **State Management** | React Context + Hooks | Role-based context, local state |
| **Charts** | Recharts | Interactive data visualization |
| **Drag & Drop** | @dnd-kit | Program board drag-and-drop |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Backend** | Next.js API Routes | RESTful API endpoints |
| **Database** | Prisma ORM + SQLite | Type-safe database access |
| **Runtime** | Node.js | Server-side execution |

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │Dashboard │  │ Board    │  │ Backlog  │  │ Charts   │       │
│  │  Page    │  │  Page    │  │  Page    │  │  Page    │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │             │
│  ┌────┴──────────────┴──────────────┴──────────────┴─────┐     │
│  │              App Shell (Sidebar + Header)              │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │     │
│  │  │ ART Selector│  │Role Switcher│  │ User Info   │   │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │/api/board│  │/api/features│ │/api/teams│  │/api/charts│      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │             │
│  ┌────┴──────────────┴──────────────┴──────────────┴─────┐     │
│  │              Server Actions (CRUD)                     │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │   │
│  │  │   ART    │  │    PI    │  │  Team    │             │   │
│  │  └──────────┘  └──────────┘  └──────────┘             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │   │
│  │  │ Feature  │  │  Story   │  │Objective │             │   │
│  │  └──────────┘  └──────────┘  └──────────┘             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │   │
│  │  │Dependency│  │   Risk   │  │Capacity  │             │   │
│  │  └──────────┘  └──────────┘  └──────────┘             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SQLite Database                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Data Model

### 3.1 Entity Relationship

```
Organization ─┬─ ART ─┬─ PI ─┬─ Iteration (Sprint/IP)
               │       │      ├─ Objective
               │       │      ├─ Risk
               │       │      └─ ConfidenceVote
               │       │
               │       └─ Team ─┬─ Member
               │                ├─ Feature
               │                ├─ Story
               │                ├─ Capacity
               │                ├─ Risk
               │                └─ ConfidenceVote
               │
               └─ Holiday
```

### 3.2 Core Entities

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **ART** | Agile Release Train | name, organizationId |
| **PI** | Program Increment (quarterly) | name, startDate, endDate, status |
| **Iteration** | Sprint or IP iteration | name, kind (SPRINT/IP), startDate, endDate |
| **Team** | Delivery team within ART | name, velocity, color |
| **Feature** | SAFe Feature with WSJF | name, businessValue, timeCriticality, riskReduction, jobSize, status, featureType |
| **Story** | User story within Feature | name, storyPoints, status, teamId, iterationId |
| **Objective** | PI Objective | title, businessValue, actualValue, completion, kind |
| **Dependency** | Cross-team dependency | type, status, fromStoryId, toStoryId |
| **Risk** | ROAM risk | title, roam, impact, probability, mitigation |
| **Capacity** | Team sprint capacity | plannedPoints, focusFactor, supportPercent, utilization |

### 3.3 Status Enums

**Feature Status:** BACKLOG → REFINING → PLANNED → IN_PROGRESS → DONE

**Story Status:** TODO → DOING → DONE | BLOCKED

**PI Status:** PLANNING → EXECUTING → COMPLETED

**Risk ROAM:** OPEN | OWNED | ACCEPTED | MITIGATED | RESOLVED

## 4. API Architecture

### 4.1 API Endpoints

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/dashboard` | GET | Dashboard metrics and KPIs |
| `/api/features` | GET | Feature list with WSJF scores |
| `/api/teams` | GET | Teams with members and capacities |
| `/api/board` | GET, PATCH | Program board state and DnD updates |
| `/api/objectives` | GET | PI Objectives by team |
| `/api/dependencies` | GET | Cross-team dependencies |
| `/api/risks` | GET | Risk register (ROAM board) |
| `/api/confidence` | GET | Confidence votes (Fist of 5) |
| `/api/capacity` | GET, PATCH | Team sprint capacities |
| `/api/pis` | GET, POST, PATCH | PI management |
| `/api/analytics` | GET | Velocity and predictability |
| `/api/charts` | GET | Burndown, burnup, cumulative flow |
| `/api/arts` | GET, POST, PATCH | ART management |

### 4.2 Data Flow

```
User Action → React Component → API Route → Prisma Query → SQLite → Response → UI Update
```

## 5. Component Architecture

### 5.1 Layout Components

- **AppShell**: Main layout with sidebar + header
- **Sidebar**: Navigation with 13 pages
- **Header**: ART selector, role switcher, user info

### 5.2 Feature Components

- **FeatureForm**: Create/edit features with WSJF scoring
- **StoryForm**: Create/edit stories with acceptance criteria
- **CapacityForm**: Edit team sprint capacity
- **ARTSelector**: Switch between ARTs
- **RoleSwitcher**: Change user role context

### 5.3 Chart Components

- **Velocity Chart**: Bar chart by team/sprint
- **Burndown Chart**: Ideal vs estimated vs actual
- **Burnup Chart**: Scope vs done vs to do
- **Cumulative Flow**: Stacked area by status
- **Predictability**: Done/committed ratio

## 6. Role-Based Access

| Role | Capabilities |
|------|-------------|
| **RTE** | Full visibility, dependency management, ROAM board |
| **SM** | Team-level views, capacity, confidence voting |
| **PO** | Feature prioritization, objectives, backlog |
| **DEV** | Story management, board updates |
| **QA** | Testing views, definition of done |
| **ARCH** | Technical dependencies, enabler features |
| **PM** | Portfolio objectives, business value |

## 7. Deployment

### 7.1 Development

```bash
npm run dev          # Start dev server (port 8001)
node server-control.js  # Control panel (port 8000)
```

### 7.2 Production

```bash
npm run build        # Build optimized bundle
npm start           # Start production server
```

### 7.3 Database

```bash
npx prisma migrate dev  # Apply migrations
npx prisma db seed      # Seed demo data
```

## 8. Security Considerations

- No authentication in MVP (demo purpose)
- Role-based views are context-only (not enforced)
- All data stored locally (SQLite)
- No external API integrations

## 9. Future Enhancements

1. **Jira/Azure DevOps Integration** - Bi-directional sync
2. **Real-time Collaboration** - WebSocket support
3. **User Authentication** - NextAuth.js
4. **Multi-ART Dependencies** - Cross-ART dependency tracking
5. **Export Capabilities** - PDF/CSV export
6. **Mobile Responsive** - Touch-friendly program board
7. **Audit Trail** - Change history tracking
