# PI Planning Hub - Technology Choices

## 1. Next.js 16 with TypeScript

> "I chose Next.js 16 with TypeScript because it provides the full-stack capabilities needed for an enterprise application without the complexity of separate frontend and backend deployments. Next.js 16's App Router with Turbopack gave me server-side rendering for initial page loads, which is critical for dashboards that need to render quickly. The API Routes allowed me to build 13 RESTful endpoints directly within the Next.js project — no separate Express server required. TypeScript was non-negotiable for this project because SAFe data models are complex: Features have WSJF scores calculated from Business Value, Time Criticality, Risk Reduction, and Job Size; PIs have iterations with sprints and IP sprints; Teams have capacities with focus factors and support percentages. TypeScript's type safety caught several bugs during development — like when I accidentally used `prisma.pI` instead of `prisma.pi` (Prisma generates lowercase accessors for models). The combination of Next.js 16's server components and TypeScript's static typing means I can refactor with confidence, knowing the compiler will catch type mismatches across the 18 database models and 13 API endpoints."

---

## 2. Prisma ORM with SQLite

> "Prisma ORM with SQLite was a deliberate choice for rapid prototyping with production-grade patterns. Prisma's schema-first approach means my database structure is documented in `schema.prisma` — 18 models with relationships, indexes, and constraints clearly defined. The Prisma Client generates type-safe queries automatically, so when I write `prisma.story.findMany({ where: { teamId: team.id } })`, TypeScript knows exactly what fields are available. SQLite was chosen for the demo because it requires zero configuration — no Docker containers, no cloud databases, just a single file. However, the Prisma schema is designed for PostgreSQL migration: I used `String` for enums (SQLite doesn't support native enums), documented allowed values in comments, and enforced constraints at the Zod validation layer. This means moving to production PostgreSQL requires only changing the `datasource db` provider and switching String enums to native enums. The seed script populates realistic demo data: 125 features with WSJF scores, 556 stories across 8 teams, 30 capacity records, and 3 PIs with completed sprints — enough to demonstrate all chart types and dashboard metrics."

---

## 3. TailwindCSS v4

> "TailwindCSS v4 was chosen for its utility-first approach that accelerates UI development without sacrificing design quality. In a 3-day sprint, I couldn't afford to write custom CSS for every component — Tailwind's pre-built utilities let me compose dark-mode dashboards, responsive layouts, and interactive states directly in JSX. The dark theme is implemented using CSS custom properties: `--background: 222.2 84% 4.9%` for the base color, with `bg-background text-foreground` classes applied globally. I created 14 reusable UI components (Button, Card, Badge, Input, etc.) using Radix UI primitives styled with Tailwind — this gives accessibility for free (keyboard navigation, ARIA attributes) while maintaining visual consistency. The program board uses Tailwind's `grid` and `flex` utilities for the team-lane layout, with `@dnd-kit` for drag-and-drop. Chart containers use `ResponsiveContainer` from Recharts wrapped in Tailwind cards with `border-white/[.08]` borders and `bg-white/[.03]` backgrounds for the glassmorphism effect. The print stylesheet in `globals.css` uses `@media print` to hide navigation and adjust colors for exported program boards — a feature that would take hours with traditional CSS but was implemented in 20 lines with Tailwind's utility classes."

---

## 4. Recharts for Analytics

> "Recharts was selected over Chart.js and D3.js because it provides React-native components that integrate seamlessly with Next.js's component model. The Charts page implements 5 visualization types: Velocity (BarChart), Burndown (LineChart with 3 lines: Ideal, Estimated, Actual), Burnup (LineChart with Scope, Done, To Do), Cumulative Flow (stacked AreaChart), and Predictability (BarChart with 80% target line). Recharts' `ResponsiveContainer` ensures charts resize correctly across screen sizes — critical for a dashboard that might be viewed on a projector during PI Planning or on a laptop during standup. The burndown chart uses three line styles to differentiate data: dashed cyan for Ideal (straight diagonal), solid blue for Estimated (baseline with slight curve), and thick orange for Actual (realistic irregular progress). The burnup chart shows scope changes — when features are added mid-sprint, the yellow Scope line steps up, while the green Done line shows actual progress. Tooltips are styled with dark backgrounds (`#1e293b`) to match the application's dark theme. The team filter dynamically updates which series appear in the charts — selecting "Team Alpha" shows only their velocity bars, while "All Teams" shows comparative bars side by side. This interactive filtering demonstrates the kind of real-time analytics that RTEs need during PI execution to identify which teams are ahead or behind schedule."

---

## Technology Stack Summary

| Technology | Version | Purpose | Key Benefit |
|------------|---------|---------|-------------|
| **Next.js** | 16.2.10 | Full-stack React framework | SSR + API Routes in one project |
| **TypeScript** | 5.x | Type-safe JavaScript | Catches bugs at compile time |
| **Prisma** | Latest | ORM for database | Type-safe queries, schema-first |
| **SQLite** | 3.x | Database | Zero-config, file-based |
| **TailwindCSS** | 4.x | Utility-first CSS | Rapid UI development |
| **Recharts** | Latest | Chart library | React-native components |
| **Radix UI** | Latest | UI primitives | Accessible by default |
| **@dnd-kit** | Latest | Drag-and-drop | Accessible DnD for program board |

## Architecture Decisions

### Why Not Jira/Azure DevOps Integration?
For a 3-day demo, building a mock integration layer would take longer than implementing the core features. The Prisma schema is designed to support integration — Features have `externalId` fields that could store Jira issue keys, and the API routes follow RESTful patterns that align with Jira's REST API.

### Why SQLite Over PostgreSQL?
SQLite was chosen for zero-configuration deployment. The entire application runs with `npm run dev` — no Docker, no cloud database setup. For production, the Prisma schema requires only changing the `datasource db` provider from `sqlite` to `postgresql`.

### Why Recharts Over D3.js?
D3.js provides more customization but requires significantly more code for standard chart types. Recharts gave us 5 chart types in ~200 lines of code, versus ~500+ lines with D3. For a demo project, development speed was prioritized over ultimate customization.
