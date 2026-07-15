// Seed — Realistic PI Planning scenario
// We are in IP sprint of PI1 (Q1 2026), preparing for PI2 (Q2 2026)
// 5 teams, 20 features per team = 100 features total in backlog
// 5-8 stories per feature (for features being planned in PI2)
// Run: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

async function main() {
  console.log("Seeding database...");

  const tables = [
    "dependencies","objectives","leaves","holidays","capacities",
    "stories","features","members","teams","iterations","pis",
    "arts","organizations","sessions","accounts","users",
  ];
  for (const t of tables) await prisma.$executeRawUnsafe(`DELETE FROM "${t}";`);

  const pw = await bcrypt.hash("password", 10);
  const mk = (n: string, e: string, r: string) => prisma.user.create({ data: { name: n, email: e, role: r, passwordHash: pw } });

  // ── Users ──────────────────────────────────────────────
  const admin = await mk("Alex Admin", "admin@pihub.dev", "ADMIN");
  const rte   = await mk("Riley RTE", "rte@pihub.dev", "RTE");
  const po    = await mk("Peyton PO", "po@pihub.dev", "PO");

  // SM per team
  const smA = await mk("Sam Alpha",    "sm-a@pihub.dev", "SM");
  const smB = await mk("Jordan Bravo",  "sm-b@pihub.dev", "SM");
  const smC = await mk("Morgan Charlie","sm-c@pihub.dev", "SM");
  const smD = await mk("Casey Delta",   "sm-d@pihub.dev", "SM");
  const smE = await mk("Taylor Echo",   "sm-e@pihub.dev", "SM");

  // 2 devs + 1 QA per team = 15 devs + 5 QA
  const devA1=await mk("Alice A1","dev-a1@pihub.dev","DEV");
  const devA2=await mk("Alice A2","dev-a2@pihub.dev","DEV");
  const devB1=await mk("Bob B1","dev-b1@pihub.dev","DEV");
  const devB2=await mk("Bob B2","dev-b2@pihub.dev","DEV");
  const devC1=await mk("Charlie C1","dev-c1@pihub.dev","DEV");
  const devC2=await mk("Charlie C2","dev-c2@pihub.dev","DEV");

  // POs per team + ARCH for Bravo
  const poB = await mk("Pat Bravo","po-b@pihub.dev","PO");
  const poC = await mk("Pat Charlie","po-c@pihub.dev","PO");
  const poD = await mk("Pat Delta","po-d@pihub.dev","PO");
  const poE = await mk("Pat Echo","po-e@pihub.dev","PO");
  const archB = await mk("Arch Bravo","arch-b@pihub.dev","ARCH");
  const devD1=await mk("Dana D1","dev-d1@pihub.dev","DEV");
  const devD2=await mk("Dana D2","dev-d2@pihub.dev","DEV");
  const devE1=await mk("Evan E1","dev-e1@pihub.dev","DEV");
  const devE2=await mk("Evan E2","dev-e2@pihub.dev","DEV");
  const qaA=await mk("QA Alpha","qa-a@pihub.dev","QA");
  const qaB=await mk("QA Bravo","qa-b@pihub.dev","QA");
  const qaC=await mk("QA Charlie","qa-c@pihub.dev","QA");
  const qaD=await mk("QA Delta","qa-d@pihub.dev","QA");
  const qaE=await mk("QA Echo","qa-e@pihub.dev","QA");

  // Mobile ART users
  const smM1=await mk("SM iOS","sm-m1@pihub.dev","SM");
  const smM2=await mk("SM Android","sm-m2@pihub.dev","SM");
  const smM3=await mk("SM Shared","sm-m3@pihub.dev","SM");
  const devM1=await mk("Dev iOS","dev-m1@pihub.dev","DEV");
  const devM2=await mk("Dev Android","dev-m2@pihub.dev","DEV");
  const devM3=await mk("Dev Shared","dev-m3@pihub.dev","DEV");
  const poM=await mk("PO Mobile","po-m@pihub.dev","PO");

  // ── Org ────────────────────────────────────────────────
  const org = await prisma.organization.create({ data: { name: "Acme Corporation", description: "Enterprise SaaS platform" } });
  const art = await prisma.aRT.create({ data: { name: "Platform ART", description: "Core Product ART", organizationId: org.id } });

  // ── PI1 (COMPLETED) ────────────────────────────────────
  const pi1Start = new Date("2025-10-06");
  const pi1 = await prisma.pI.create({
    data: { name: "PI 2025.4", artId: art.id, startDate: pi1Start, endDate: addDays(pi1Start, 84), status: "COMPLETED" },
  });
  const pi1Iterations = await Promise.all(
    ["Sprint 1","Sprint 2","Sprint 3","Sprint 4","Sprint 5","IP"].map((n, i) =>
      prisma.iteration.create({ data: { name: n, kind: i===5?"IP":"SPRINT", piId: pi1.id, startDate: addDays(pi1Start, i*14), endDate: addDays(pi1Start, i*14+13) } })
    )
  );

  // ── PI2 (PLANNING — current, in IP sprint) ─────────────
  const pi2Start = new Date("2026-01-05");
  const pi2 = await prisma.pI.create({
    data: { name: "PI 2026.1", artId: art.id, startDate: pi2Start, endDate: addDays(pi2Start, 84), status: "EXECUTING" },
  });
  const pi2Iterations = await Promise.all(
    ["Sprint 1","Sprint 2","Sprint 3","Sprint 4","Sprint 5","IP"].map((n, i) =>
      prisma.iteration.create({ data: { name: n, kind: i===5?"IP":"SPRINT", piId: pi2.id, startDate: addDays(pi2Start, i*14), endDate: addDays(pi2Start, i*14+13) } })
    )
  );
  const [pi2s1, pi2s2, pi2s3, pi2s4, pi2s5, pi2ip] = pi2Iterations;

  // ── PI3 (future) ───────────────────────────────────────
  const pi3Start = new Date("2026-04-06");
  const pi3 = await prisma.pI.create({
    data: { name: "PI 2026.2", artId: art.id, startDate: pi3Start, endDate: addDays(pi3Start, 84), status: "PLANNING" },
  });
  await Promise.all(
    ["Sprint 1","Sprint 2","Sprint 3","Sprint 4","Sprint 5","IP"].map((n, i) =>
      prisma.iteration.create({ data: { name: n, kind: i===5?"IP":"SPRINT", piId: pi3.id, startDate: addDays(pi3Start, i*14), endDate: addDays(pi3Start, i*14+13) } })
    )
  );

  // Holidays
  await prisma.holiday.createMany({ data: [
    { name: "Christmas", date: new Date("2025-12-25"), organizationId: org.id },
    { name: "New Year", date: new Date("2026-01-01"), organizationId: org.id },
    { name: "MLK Day", date: new Date("2026-01-19"), organizationId: org.id },
    { name: "Presidents Day", date: new Date("2026-02-16"), organizationId: org.id },
  ]});

  // ── Teams (Platform ART) ─────────────────────────────
  const mkT = (n: string, c: string, v: number, artId: string) => prisma.team.create({ data: { name: n, color: c, velocity: v, artId } });
  const teamA = await mkT("Team Alpha",   "#6366f1", 38, art.id);
  const teamB = await mkT("Team Bravo",   "#10b981", 34, art.id);
  const teamC = await mkT("Team Charlie", "#f59e0b", 36, art.id);

  // ── Mobile ART (second ART for Multi-ART demo) ─────────
  const mobileART = await prisma.aRT.create({ data: { name: "Mobile ART", description: "Mobile & Cross-Platform", organizationId: org.id } });
  const teamM1 = await mkT("iOS Squad",     "#ec4899", 22, mobileART.id);
  const teamM2 = await mkT("Android Squad", "#f97316", 20, mobileART.id);
  const teamM3 = await mkT("Shared Libs",   "#14b8a6", 18, mobileART.id);

  const piM1Start = new Date("2026-01-12");
  const piM1 = await prisma.pI.create({
    data: { name: "Mobile PI 2026.1", artId: mobileART.id, startDate: piM1Start, endDate: addDays(piM1Start, 84), status: "EXECUTING" },
  });
  await Promise.all(
    ["Sprint 1","Sprint 2","Sprint 3","Sprint 4","Sprint 5","IP"].map((n, i) =>
      prisma.iteration.create({ data: { name: n, kind: i===5?"IP":"SPRINT", piId: piM1.id, startDate: addDays(piM1Start, i*14), endDate: addDays(piM1Start, i*14+13) } })
    )
  );

  // Mobile ART stories
  const mFeatures = [
    { name: "iOS app rewrite in SwiftUI", desc: "Complete rewrite using SwiftUI and async/await.", team: teamM1.id, bv: 9, tc: 8, rr: 7, js: 8, status: "IN_PROGRESS", priority: "MUST", featureType: "BUSINESS" },
    { name: "Android Material You", desc: "Adopt Material You dynamic theming.", team: teamM2.id, bv: 7, tc: 6, rr: 4, js: 5, status: "PLANNED", priority: "MUST", featureType: "BUSINESS" },
    { name: "Shared networking layer", desc: "KMM shared networking for iOS/Android.", team: teamM3.id, bv: 8, tc: 7, rr: 6, js: 6, status: "IN_PROGRESS", priority: "MUST", featureType: "ENABLER" },
    { name: "Push notification service", desc: "Unified push notification infrastructure.", team: teamM1.id, bv: 6, tc: 5, rr: 5, js: 4, status: "PLANNED", priority: "SHOULD", featureType: "BUSINESS" },
    { name: "Offline sync engine", desc: "Conflict-free replicated data types for offline.", team: teamM3.id, bv: 9, tc: 8, rr: 7, js: 9, status: "BACKLOG", priority: "MUST", featureType: "ENABLER" },
  ];
  for (const f of mFeatures) {
    await prisma.feature.create({
      data: {
        name: f.name, description: f.desc, artId: mobileART.id,
        ownerTeamId: f.team, businessValue: f.bv, timeCriticality: f.tc,
        riskReduction: f.rr, jobSize: f.js, status: f.status, priority: f.priority,
        featureType: f.featureType,
      },
    });
  }

  // ── Teams (Platform ART continued) ─────────────────────
  const teamD = await mkT("Team Delta",   "#3b82f6", 32, art.id);
  const teamE = await mkT("Team Echo",    "#8b5cf6", 30, art.id);

  // Members
  const mkM = (u: string, t: string, r: string) => prisma.member.create({ data: { userId: u, teamId: t, role: r } });
  await mkM(smA.id,teamA.id,"SM"); await mkM(devA1.id,teamA.id,"DEV"); await mkM(devA2.id,teamA.id,"DEV"); await mkM(qaA.id,teamA.id,"QA");
  await mkM(smB.id,teamB.id,"SM"); await mkM(devB1.id,teamB.id,"DEV"); await mkM(devB2.id,teamB.id,"DEV"); await mkM(qaB.id,teamB.id,"QA");
  await mkM(smC.id,teamC.id,"SM"); await mkM(devC1.id,teamC.id,"DEV"); await mkM(devC2.id,teamC.id,"DEV"); await mkM(qaC.id,teamC.id,"QA");
  await mkM(smD.id,teamD.id,"SM"); await mkM(devD1.id,teamD.id,"DEV"); await mkM(devD2.id,teamD.id,"DEV"); await mkM(qaD.id,teamD.id,"QA");
  await mkM(smE.id,teamE.id,"SM"); await mkM(devE1.id,teamE.id,"DEV"); await mkM(devE2.id,teamE.id,"DEV"); await mkM(qaE.id,teamE.id,"QA");
  await mkM(rte.id,teamA.id,"RTE");
  await mkM(po.id,teamA.id,"PO");
  await mkM(poB.id,teamB.id,"PO");
  await mkM(poC.id,teamC.id,"PO");
  await mkM(poD.id,teamD.id,"PO");
  await mkM(poE.id,teamE.id,"PO");
  await mkM(archB.id,teamB.id,"ARCH");

  // Mobile ART members
  await mkM(smM1.id,teamM1.id,"SM"); await mkM(devM1.id,teamM1.id,"DEV");
  await mkM(smM2.id,teamM2.id,"SM"); await mkM(devM2.id,teamM2.id,"DEV");
  await mkM(smM3.id,teamM3.id,"SM"); await mkM(devM3.id,teamM3.id,"DEV");
  await mkM(poM.id,teamM1.id,"PO");

  // ── Features: 20 per team = 100 total ──────────────────
  // Statuses: DONE (from PI1), PLANNED/BACKLOG/REFINING (for PI2)
  type FD = { name:string; desc:string; team:string; bv:number; tc:number; rr:number; js:number; status:string; priority:string; };
  const allFeatures: FD[] = [
    // ── Team Alpha: Identity & Access Management ──
    // PI1 DONE: basic auth, user mgmt, password reset, session mgmt, login audit
    { name:"Basic email/password auth", desc:"Email and password authentication with bcrypt hashing.", team:teamA.id, bv:9,tc:9,rr:8,js:3, status:"DONE", priority:"MUST" },
    { name:"User management CRUD", desc:"Admin user creation, edit, deactivate, and role assignment.", team:teamA.id, bv:8,tc:7,rr:6,js:4, status:"DONE", priority:"MUST" },
    { name:"Password reset flow", desc:"Self-service password reset via email with token expiry.", team:teamA.id, bv:7,tc:6,rr:5,js:3, status:"DONE", priority:"MUST" },
    { name:"Session management", desc:"JWT session tokens with refresh and revoke capabilities.", team:teamA.id, bv:7,tc:6,rr:6,js:4, status:"DONE", priority:"MUST" },
    { name:"Login audit log", desc:"Track all login attempts with IP and device info.", team:teamA.id, bv:6,tc:5,rr:7,js:2, status:"DONE", priority:"MUST" },
    // PI2 PLANNED
    { name:"SSO via SAML/OIDC", desc:"Enterprise SSO for B2B customers using SAML 2.0 and OIDC protocols.", team:teamA.id, bv:9,tc:8,rr:5,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Multi-factor authentication", desc:"MFA with TOTP, SMS, and hardware key support.", team:teamA.id, bv:9,tc:7,rr:8,js:4, status:"PLANNED", priority:"MUST" },
    { name:"Role-based access control", desc:"Granular RBAC with custom roles and permissions.", team:teamA.id, bv:8,tc:6,rr:7,js:5, status:"REFINING", priority:"MUST" },
    { name:"Self-service onboarding", desc:"Automated customer onboarding without sales involvement.", team:teamA.id, bv:8,tc:7,rr:4,js:4, status:"PLANNED", priority:"MUST" },
    { name:"Account provisioning API", desc:"SCIM-based automatic user provisioning from IdPs.", team:teamA.id, bv:7,tc:5,rr:3,js:6, status:"BACKLOG", priority:"SHOULD" },
    { name:"Session management dashboard", desc:"Admin view of active sessions with remote revoke.", team:teamA.id, bv:5,tc:4,rr:4,js:3, status:"BACKLOG", priority:"SHOULD" },
    { name:"Audit trail for auth events", desc:"Log all authentication events for compliance.", team:teamA.id, bv:7,tc:6,rr:8,js:3, status:"PLANNED", priority:"MUST" },
    { name:"Password policies engine", desc:"Configurable password complexity and rotation rules.", team:teamA.id, bv:4,tc:3,rr:5,js:2, status:"BACKLOG", priority:"COULD" },
    { name:"IP whitelist management", desc:"Restrict access by IP range for enterprise tenants.", team:teamA.id, bv:6,tc:5,rr:6,js:3, status:"BACKLOG", priority:"SHOULD" },
    { name:"OAuth app marketplace", desc:"Third-party OAuth app integration catalog.", team:teamA.id, bv:5,tc:3,rr:2,js:7, status:"BACKLOG", priority:"COULD" },
    { name:"Delegated admin roles", desc:"Allow tenant admins to delegate user management.", team:teamA.id, bv:6,tc:4,rr:3,js:4, status:"BACKLOG", priority:"SHOULD" },
    { name:"Login anomaly detection", desc:"ML-based detection of suspicious login patterns.", team:teamA.id, bv:7,tc:5,rr:7,js:6, status:"BACKLOG", priority:"SHOULD" },
    { name:"Just-in-time access provisioning", desc:"Elevated access with time-bound approval workflows.", team:teamA.id, bv:6,tc:4,rr:5,js:5, status:"BACKLOG", priority:"COULD" },
    { name:"Certificate-based auth", desc:"mTLS certificate authentication for service accounts.", team:teamA.id, bv:5,tc:3,rr:4,js:4, status:"BACKLOG", priority:"COULD" },
    { name:"Auth event webhook notifications", desc:"Real-time webhooks for authentication events.", team:teamA.id, bv:4,tc:3,rr:2,js:3, status:"BACKLOG", priority:"COULD" },
    { name:"Tenant isolation enforcement", desc:"Strict data isolation between enterprise tenants.", team:teamA.id, bv:9,tc:8,rr:9,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Service account management", desc:"API key and service account lifecycle management.", team:teamA.id, bv:5,tc:4,rr:3,js:4, status:"BACKLOG", priority:"SHOULD" },
    { name:"Auth rate limiting", desc:"Brute-force protection with adaptive rate limiting.", team:teamA.id, bv:6,tc:5,rr:7,js:3, status:"PLANNED", priority:"SHOULD" },
    { name:"Compliance auth report", desc:"SOC2/HIPAA authentication compliance reports.", team:teamA.id, bv:7,tc:6,rr:8,js:4, status:"BACKLOG", priority:"SHOULD" },
    { name:"Auth SDK for mobile", desc:"Native SDK for iOS/Android authentication flows.", team:teamA.id, bv:6,tc:4,rr:2,js:5, status:"BACKLOG", priority:"COULD" },

    // ── Team Bravo: Analytics & Business Intelligence ──
    // PI1 DONE: basic metrics, event tracking, simple dashboard, CSV export, page views
    { name:"Basic metrics dashboard", desc:"Core metrics: DAU, MAU, session duration, bounce rate.", team:teamB.id, bv:9,tc:8,rr:6,js:4, status:"DONE", priority:"MUST" },
    { name:"Event tracking pipeline", desc:"Client-side event collection with batching and retry.", team:teamB.id, bv:8,tc:7,rr:5,js:5, status:"DONE", priority:"MUST" },
    { name:"Simple line/bar charts", desc:"Reusable chart components for metrics visualization.", team:teamB.id, bv:7,tc:5,rr:3,js:3, status:"DONE", priority:"MUST" },
    { name:"CSV data export", desc:"Export any dataset to CSV with date range filter.", team:teamB.id, bv:6,tc:4,rr:3,js:3, status:"DONE", priority:"MUST" },
    { name:"Page view analytics", desc:"Track page views, unique visitors, and time on page.", team:teamB.id, bv:7,tc:5,rr:4,js:3, status:"DONE", priority:"MUST" },
    // PI2 PLANNED
    { name:"Usage analytics dashboard", desc:"Real-time product usage metrics and trends.", team:teamB.id, bv:8,tc:6,rr:5,js:4, status:"PLANNED", priority:"MUST" },
    { name:"Custom report builder", desc:"Drag-and-drop report builder for power users.", team:teamB.id, bv:7,tc:5,rr:3,js:7, status:"PLANNED", priority:"MUST" },
    { name:"Revenue analytics", desc:"MRR, ARR, churn, and expansion revenue tracking.", team:teamB.id, bv:9,tc:7,rr:4,js:6, status:"REFINING", priority:"MUST" },
    { name:"Cohort analysis", desc:"User retention and behavior cohort analysis.", team:teamB.id, bv:7,tc:4,rr:3,js:5, status:"PLANNED", priority:"SHOULD" },
    { name:"Funnel visualization", desc:"Conversion funnel analysis with drop-off tracking.", team:teamB.id, bv:7,tc:5,rr:4,js:4, status:"PLANNED", priority:"MUST" },
    { name:"Scheduled report emails", desc:"Automated report delivery via email on schedule.", team:teamB.id, bv:5,tc:3,rr:2,js:3, status:"BACKLOG", priority:"SHOULD" },
    { name:"Real-time data pipeline", desc:"Event streaming pipeline with sub-second latency.", team:teamB.id, bv:8,tc:7,rr:6,js:8, status:"PLANNED", priority:"MUST" },
    { name:"Data export API", desc:"Bulk data export in CSV/Parquet formats.", team:teamB.id, bv:6,tc:4,rr:3,js:4, status:"BACKLOG", priority:"SHOULD" },
    { name:"KPI scorecards", desc:"Executive KPI dashboards with drill-down.", team:teamB.id, bv:7,tc:5,rr:3,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Anomaly detection alerts", desc:"Automated alerts for metric anomalies.", team:teamB.id, bv:6,tc:4,rr:5,js:6, status:"BACKLOG", priority:"SHOULD" },
    { name:"Embedded analytics widgets", desc:"Embeddable chart components for customer apps.", team:teamB.id, bv:6,tc:3,rr:2,js:7, status:"BACKLOG", priority:"SHOULD" },
    { name:"A/B test analytics", desc:"Statistical significance testing for experiments.", team:teamB.id, bv:7,tc:4,rr:3,js:5, status:"BACKLOG", priority:"SHOULD" },
    { name:"Data warehouse integration", desc:"Direct connectors to Snowflake/BigQuery/Redshift.", team:teamB.id, bv:8,tc:5,rr:4,js:6, status:"PLANNED", priority:"MUST" },
    { name:"Metric definitions registry", desc:"Centralized business metric definitions and glossary.", team:teamB.id, bv:5,tc:3,rr:4,js:4, status:"BACKLOG", priority:"COULD" },
    { name:"Custom dashboard themes", desc:"Branded dashboard themes for enterprise tenants.", team:teamB.id, bv:3,tc:2,rr:1,js:3, status:"BACKLOG", priority:"COULD" },
    { name:"Performance analytics", desc:"App performance metrics: load time, errors, API latency.", team:teamB.id, bv:7,tc:6,rr:5,js:5, status:"PLANNED", priority:"MUST" },
    { name:"User journey mapping", desc:"Visual user journey flows with drop-off analysis.", team:teamB.id, bv:6,tc:4,rr:3,js:6, status:"BACKLOG", priority:"SHOULD" },
    { name:"Predictive analytics engine", desc:"ML-powered forecasting for revenue and usage.", team:teamB.id, bv:8,tc:5,rr:4,js:8, status:"BACKLOG", priority:"SHOULD" },
    { name:"Data lineage tracking", desc:"Track data transformations and source lineage.", team:teamB.id, bv:5,tc:3,rr:5,js:5, status:"BACKLOG", priority:"COULD" },
    { name:"Executive summary AI", desc:"AI-generated executive summaries of key metrics.", team:teamB.id, bv:6,tc:3,rr:2,js:6, status:"BACKLOG", priority:"COULD" },

    // ── Team Charlie: API Platform & Integrations ──
    // PI1 DONE: REST API v1, API keys, rate limiting v1, docs, health checks
    { name:"REST API v1", desc:"Initial public REST API with CRUD operations.", team:teamC.id, bv:9,tc:9,rr:6,js:5, status:"DONE", priority:"MUST" },
    { name:"API key management", desc:"Generate, rotate, and revoke API keys per tenant.", team:teamC.id, bv:8,tc:7,rr:7,js:3, status:"DONE", priority:"MUST" },
    { name:"Basic rate limiting", desc:"Simple per-tenant request rate limiting.", team:teamC.id, bv:7,tc:6,rr:7,js:3, status:"DONE", priority:"MUST" },
    { name:"API documentation v1", desc:"OpenAPI 3.0 spec with Swagger UI.", team:teamC.id, bv:6,tc:4,rr:3,js:3, status:"DONE", priority:"MUST" },
    { name:"Health check endpoints", desc:"/health and /ready endpoints for load balancers.", team:teamC.id, bv:5,tc:4,rr:5,js:2, status:"DONE", priority:"MUST" },
    // PI2 PLANNED
    { name:"REST API v3", desc:"Next-gen public API with improved pagination and filtering.", team:teamC.id, bv:9,tc:8,rr:5,js:7, status:"PLANNED", priority:"MUST" },
    { name:"GraphQL API", desc:"Full GraphQL API with subscriptions and schema stitching.", team:teamC.id, bv:8,tc:6,rr:4,js:8, status:"PLANNED", priority:"MUST" },
    { name:"Webhook reliability v2", desc:"Guaranteed delivery with retries and dead-letter queue.", team:teamC.id, bv:7,tc:7,rr:8,js:4, status:"PLANNED", priority:"MUST" },
    { name:"Rate limiting gateway", desc:"Per-tenant adaptive rate limiting with quotas.", team:teamC.id, bv:7,tc:6,rr:7,js:4, status:"PLANNED", priority:"MUST" },
    { name:"API versioning strategy", desc:"Sunset policy and version negotiation headers.", team:teamC.id, bv:6,tc:5,rr:4,js:3, status:"REFINING", priority:"MUST" },
    { name:"Developer portal", desc:"Self-service API documentation and sandbox.", team:teamC.id, bv:7,tc:4,rr:3,js:7, status:"PLANNED", priority:"SHOULD" },
    { name:"OAuth 2.1 migration", desc:"Migrate from OAuth 2.0 to 2.1 with PKCE enforcement.", team:teamC.id, bv:6,tc:5,rr:6,js:4, status:"PLANNED", priority:"MUST" },
    { name:"API analytics dashboard", desc:"API usage, latency, and error rate monitoring.", team:teamC.id, bv:6,tc:4,rr:4,js:5, status:"BACKLOG", priority:"SHOULD" },
    { name:"Event-driven webhooks", desc:"Publish/subscribe event system with filtering.", team:teamC.id, bv:7,tc:5,rr:5,js:6, status:"BACKLOG", priority:"SHOULD" },
    { name:"API key rotation", desc:"Automated API key rotation with zero-downtime.", team:teamC.id, bv:5,tc:4,rr:5,js:3, status:"PLANNED", priority:"SHOULD" },
    { name:"Batch operations API", desc:"Bulk create/update/delete operations for efficiency.", team:teamC.id, bv:5,tc:3,rr:3,js:5, status:"BACKLOG", priority:"SHOULD" },
    { name:"Real-time streaming API", desc:"Server-sent events for real-time data streaming.", team:teamC.id, bv:7,tc:5,rr:4,js:7, status:"BACKLOG", priority:"SHOULD" },
    { name:"API mocking service", desc:"Mock API responses for integration testing.", team:teamC.id, bv:4,tc:2,rr:2,js:4, status:"BACKLOG", priority:"COULD" },
    { name:"OpenAPI spec generator", desc:"Auto-generate OpenAPI specs from code annotations.", team:teamC.id, bv:4,tc:2,rr:3,js:3, status:"BACKLOG", priority:"COULD" },
    { name:"API compliance validator", desc:"Automated API design and security compliance checks.", team:teamC.id, bv:5,tc:3,rr:5,js:4, status:"BACKLOG", priority:"COULD" },
    { name:"Multi-region API routing", desc:"Geo-aware API routing for latency optimization.", team:teamC.id, bv:7,tc:5,rr:4,js:6, status:"PLANNED", priority:"MUST" },
    { name:"API circuit breaker", desc:"Automatic circuit breaking for downstream failures.", team:teamC.id, bv:6,tc:5,rr:7,js:4, status:"BACKLOG", priority:"SHOULD" },
    { name:"Integration marketplace", desc:"Pre-built connectors for popular SaaS tools.", team:teamC.id, bv:7,tc:4,rr:2,js:7, status:"BACKLOG", priority:"SHOULD" },
    { name:"API request/response logging", desc:"Full request/response logging for debugging.", team:teamC.id, bv:5,tc:3,rr:4,js:3, status:"BACKLOG", priority:"COULD" },
    { name:"GraphQL federation", desc:"Federated GraphQL gateway for microservices.", team:teamC.id, bv:8,tc:5,rr:3,js:8, status:"BACKLOG", priority:"SHOULD" },

    // ── Team Delta: Mobile & Frontend Experience ──
    // PI1 DONE: mobile app v1, responsive web, basic nav, forms, error handling
    { name:"Mobile app v1", desc:"Initial React Native app with core screens and auth.", team:teamD.id, bv:8,tc:8,rr:4,js:7, status:"DONE", priority:"MUST" },
    { name:"Responsive web layout", desc:"Mobile-first responsive layout with sidebar navigation.", team:teamD.id, bv:7,tc:6,rr:3,js:4, status:"DONE", priority:"MUST" },
    { name:"Navigation system", desc:"Tab and stack navigation for mobile and web.", team:teamD.id, bv:6,tc:5,rr:2,js:3, status:"DONE", priority:"MUST" },
    { name:"Form components", desc:"Reusable form inputs with validation and error states.", team:teamD.id, bv:6,tc:4,rr:2,js:4, status:"DONE", priority:"MUST" },
    { name:"Error boundary handling", desc:"Global error boundaries with retry and report.", team:teamD.id, bv:5,tc:4,rr:5,js:2, status:"DONE", priority:"MUST" },
    // PI2 PLANNED
    { name:"Mobile app v2", desc:"Complete rebuild on React Native with new design system.", team:teamD.id, bv:8,tc:6,rr:3,js:8, status:"PLANNED", priority:"MUST" },
    { name:"Offline sync engine", desc:"Full offline support with conflict resolution.", team:teamD.id, bv:8,tc:7,rr:5,js:7, status:"PLANNED", priority:"MUST" },
    { name:"Push notifications", desc:"Rich push notifications with deep linking.", team:teamD.id, bv:7,tc:5,rr:3,js:4, status:"PLANNED", priority:"MUST" },
    { name:"In-app onboarding tour", desc:"Interactive product tour for new users.", team:teamD.id, bv:6,tc:4,rr:2,js:4, status:"PLANNED", priority:"SHOULD" },
    { name:"Design system v2", desc:"Unified component library with dark mode support.", team:teamD.id, bv:7,tc:5,rr:4,js:6, status:"PLANNED", priority:"MUST" },
    { name:"Accessibility audit WCAG 2.1 AA", desc:"Full WCAG 2.1 AA compliance across all screens.", team:teamD.id, bv:7,tc:6,rr:8,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Progressive Web App", desc:"PWA with service worker and app manifest.", team:teamD.id, bv:7,tc:4,rr:3,js:5, status:"PLANNED", priority:"SHOULD" },
    { name:"Mobile analytics SDK", desc:"In-app analytics collection for mobile events.", team:teamD.id, bv:6,tc:4,rr:3,js:4, status:"BACKLOG", priority:"SHOULD" },
    { name:"Biometric authentication", desc:"Face ID / fingerprint authentication on mobile.", team:teamD.id, bv:6,tc:4,rr:5,js:3, status:"PLANNED", priority:"SHOULD" },
    { name:"Dark mode", desc:"System-aware dark mode with manual toggle.", team:teamD.id, bv:5,tc:3,rr:2,js:4, status:"PLANNED", priority:"SHOULD" },
    { name:"Keyboard shortcuts", desc:"Global keyboard shortcuts for power users.", team:teamD.id, bv:4,tc:2,rr:1,js:3, status:"BACKLOG", priority:"COULD" },
    { name:"Multi-language support i18n", desc:"Internationalization with RTL support.", team:teamD.id, bv:6,tc:4,rr:3,js:6, status:"PLANNED", priority:"MUST" },
    { name:"Performance optimization", desc:"Core Web Vitals optimization: LCP, FID, CLS.", team:teamD.id, bv:7,tc:6,rr:5,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Mobile crash reporting", desc:"Real-time crash analytics with symbolication.", team:teamD.id, bv:5,tc:4,rr:5,js:3, status:"BACKLOG", priority:"SHOULD" },
    { name:"Responsive table component", desc:"Virtualized tables with sorting, filtering, export.", team:teamD.id, bv:5,tc:3,rr:2,js:4, status:"BACKLOG", priority:"COULD" },
    { name:"File upload drag-drop", desc:"Drag-and-drop file upload with preview and progress.", team:teamD.id, bv:4,tc:2,rr:1,js:3, status:"BACKLOG", priority:"COULD" },
    { name:"Notification center", desc:"In-app notification center with read/unread state.", team:teamD.id, bv:5,tc:3,rr:2,js:4, status:"PLANNED", priority:"SHOULD" },
    { name:"Contextual help system", desc:"Contextual tooltips and help modals across app.", team:teamD.id, bv:4,tc:2,rr:1,js:3, status:"BACKLOG", priority:"COULD" },
    { name:"Command palette", desc:"Spotlight-style command palette for navigation.", team:teamD.id, bv:5,tc:3,rr:1,js:4, status:"BACKLOG", priority:"COULD" },
    { name:"Mobile widget support", desc:"iOS/Android home screen widgets for key metrics.", team:teamD.id, bv:4,tc:2,rr:1,js:5, status:"BACKLOG", priority:"COULD" },

    // ── Team Echo: Security, Compliance & Infrastructure ──
    // PI1 DONE: HTTPS/TLS, basic logging, containerization, CI/CD pipeline, env mgmt
    { name:"HTTPS/TLS encryption", desc:"TLS 1.3 for all endpoints with automated cert renewal.", team:teamE.id, bv:9,tc:9,rr:9,js:3, status:"DONE", priority:"MUST" },
    { name:"Centralized logging", desc:"Structured logging with ELK stack integration.", team:teamE.id, bv:8,tc:7,rr:7,js:4, status:"DONE", priority:"MUST" },
    { name:"Docker containerization", desc:"Dockerfiles and docker-compose for all services.", team:teamE.id, bv:7,tc:6,rr:5,js:3, status:"DONE", priority:"MUST" },
    { name:"CI/CD pipeline v1", desc:"GitHub Actions pipeline: lint, test, build, deploy.", team:teamE.id, bv:8,tc:7,rr:6,js:4, status:"DONE", priority:"MUST" },
    { name:"Environment config mgmt", desc:".env-based config with validation and secrets injection.", team:teamE.id, bv:6,tc:5,rr:6,js:2, status:"DONE", priority:"MUST" },
    // PI2 PLANNED
    { name:"Audit log export", desc:"SIEM-compatible audit trail export (Splunk, Datadog).", team:teamE.id, bv:8,tc:8,rr:9,js:4, status:"PLANNED", priority:"MUST" },
    { name:"SOC2 compliance automation", desc:"Automated evidence collection for SOC2 audits.", team:teamE.id, bv:9,tc:7,rr:9,js:6, status:"PLANNED", priority:"MUST" },
    { name:"Data encryption at rest", desc:"AES-256 encryption for all stored customer data.", team:teamE.id, bv:9,tc:8,rr:9,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Vulnerability scanning pipeline", desc:"Automated SAST/DAST scanning in CI/CD.", team:teamE.id, bv:8,tc:7,rr:8,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Secrets management", desc:"HashiCorp Vault integration for secrets rotation.", team:teamE.id, bv:8,tc:6,rr:8,js:5, status:"PLANNED", priority:"MUST" },
    { name:"DDoS protection", desc:"Edge-level DDoS mitigation and traffic scrubbing.", team:teamE.id, bv:8,tc:7,rr:9,js:6, status:"PLANNED", priority:"MUST" },
    { name:"Penetration test remediation", desc:"Remediate findings from Q4 2025 pen test.", team:teamE.id, bv:9,tc:8,rr:9,js:5, status:"PLANNED", priority:"MUST" },
    { name:"GDPR data subject requests", desc:"Automated DSAR processing and data deletion.", team:teamE.id, bv:8,tc:7,rr:8,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Network segmentation", desc:"Micro-segmentation for multi-tenant isolation.", team:teamE.id, bv:7,tc:5,rr:7,js:6, status:"REFINING", priority:"MUST" },
    { name:"Disaster recovery drill", desc:"Quarterly DR testing with RTO/RPO validation.", team:teamE.id, bv:7,tc:6,rr:8,js:4, status:"PLANNED", priority:"MUST" },
    { name:"Security incident playbook", desc:"Documented IR playbooks with automated response.", team:teamE.id, bv:6,tc:5,rr:7,js:3, status:"BACKLOG", priority:"SHOULD" },
    { name:"Compliance dashboard", desc:"Real-time compliance posture dashboard.", team:teamE.id, bv:7,tc:5,rr:6,js:5, status:"PLANNED", priority:"MUST" },
    { name:"Infrastructure as code", desc:"Terraform modules for all cloud infrastructure.", team:teamE.id, bv:7,tc:4,rr:5,js:7, status:"PLANNED", priority:"MUST" },
    { name:"Container orchestration", desc:"Kubernetes migration with Helm charts.", team:teamE.id, bv:8,tc:5,rr:4,js:8, status:"PLANNED", priority:"MUST" },
    { name:"Observability platform", desc:"Centralized logging, metrics, and tracing.", team:teamE.id, bv:7,tc:5,rr:5,js:6, status:"PLANNED", priority:"MUST" },
    { name:"Chaos engineering", desc:"Controlled failure injection for resilience testing.", team:teamE.id, bv:5,tc:3,rr:4,js:5, status:"BACKLOG", priority:"SHOULD" },
    { name:"Cost optimization", desc:"Cloud spend monitoring and right-sizing recommendations.", team:teamE.id, bv:6,tc:4,rr:3,js:5, status:"PLANNED", priority:"SHOULD" },
    { name:"API security hardening", desc:"OWASP API Security Top 10 remediation.", team:teamE.id, bv:8,tc:7,rr:9,js:4, status:"PLANNED", priority:"MUST" },
    { name:"Data retention policies", desc:"Automated data lifecycle and retention enforcement.", team:teamE.id, bv:6,tc:5,rr:6,js:4, status:"BACKLOG", priority:"SHOULD" },
    { name:"Threat modeling review", desc:"Annual threat modeling exercise with updates.", team:teamE.id, bv:7,tc:5,rr:7,js:3, status:"BACKLOG", priority:"SHOULD" },
  ];

  const features = await Promise.all(
    allFeatures.map(f =>
      prisma.feature.create({
        data: {
          name: f.name, description: f.desc, benefitHypothesis: f.desc,
          acceptanceCriteria: `Done when ${f.name.toLowerCase()} meets acceptance criteria.`,
          artId: art.id, ownerTeamId: f.team,
          businessValue: f.bv, timeCriticality: f.tc, riskReduction: f.rr, jobSize: f.js,
          status: f.status, priority: f.priority,
        },
      })
    )
  );

  // ── Stories ─────────────────────────────────────────────
  // DONE features: 3-5 stories in PI1, status DONE
  // PLANNED/REFINING: 7-10 stories in PI2, spread across ALL 6 sprints (5 + IP)
  const doneFeatures = features.filter(f => f.status === "DONE");
  const plannedFeatures = features.filter(f => ["PLANNED","REFINING"].includes(f.status));
  const storyPoints = [3,5,5,8,5,3,5,8];
  let storyCount = 0;

  // Stories for DONE features (PI1)
  const pi1Iters = await prisma.iteration.findMany({ where: { piId: pi1.id }, orderBy: { startDate: "asc" } });
  for (const feat of doneFeatures) {
    const numStories = 3 + Math.floor(Math.random() * 3); // 3-5
    const teamId = feat.ownerTeamId;
    for (let i = 0; i < numStories; i++) {
      const sprintIdx = i < 2 ? 0 : i < 4 ? 1 : 2;
      const sprint = pi1Iters[sprintIdx];
      await prisma.story.create({
        data: {
          name: `${feat.name} — Story ${i+1}`,
          description: `Implementation detail ${i+1} for ${feat.name}`,
          acceptanceCriteria: `Story ${i+1} for ${feat.name} meets definition of done.`,
          featureId: feat.id,
          teamId,
          iterationId: sprint.id,
          storyPoints: storyPoints[i % storyPoints.length],
          status: "DONE",
        },
      });
      storyCount++;
    }
  }

  // Stories for PLANNED/REFINING features (PI2) — round-robin across ALL 6 sprints
  let ipCounter = 0;
  for (const feat of plannedFeatures) {
    const numStories = 7 + Math.floor(Math.random() * 4); // 7-10
    const teamId = feat.ownerTeamId;
    for (let i = 0; i < numStories; i++) {
      const sprintIdx = i % 6;
      const sprint = pi2Iterations[sprintIdx];
      const isIP = sprint.kind === "IP";
      let storyName: string;
      let storyDesc: string;
      let storyAC: string;
      if (isIP) {
        const ipTopics = [
          { name: "Spike", desc: `Research and spike for ${feat.name} next iteration`, ac: `Spike complete with recommendation document` },
          { name: "Tech Debt", desc: `Refactoring and tech debt reduction for ${feat.name}`, ac: `Tech debt items resolved, tests passing` },
          { name: "Carry-over", desc: `Remaining work from earlier sprint for ${feat.name}`, ac: `Story meets definition of done` },
          { name: "PI Prep", desc: `Backlog refinement and story splitting for ${feat.name} in next PI`, ac: `Features refined, stories estimated, acceptance criteria ready for PI planning` },
        ];
        const topic = ipTopics[ipCounter % 4];
        ipCounter++;
        storyName = `${feat.name} — ${topic.name}`;
        storyDesc = topic.desc;
        storyAC = topic.ac;
      } else {
        storyName = `${feat.name} — Story ${i+1}`;
        storyDesc = `Implementation detail ${i+1} for ${feat.name}`;
        storyAC = `Story ${i+1} for ${feat.name} meets definition of done.`;
      }
      await prisma.story.create({
        data: {
          name: storyName,
          description: storyDesc,
          acceptanceCriteria: storyAC,
          featureId: feat.id,
          teamId,
          iterationId: sprint.id,
          storyPoints: isIP ? 3 : storyPoints[i % storyPoints.length],
          status: isIP ? "TODO" : i < 2 ? "DOING" : "TODO",
        },
      });
      storyCount++;
    }
  }

  // ── Dependencies (cross-team) ──
  const findS = (n: string) => prisma.story.findFirst({ where: { name: { contains: n } } });
  const sso = await findS("SSO via SAML");
  const api = await findS("REST API v3");
  const analytics = await findS("Usage analytics");
  const audit = await findS("Audit log export");
  const mobile = await findS("Mobile app v2");
  const design = await findS("Design system v2");
  const graphql = await findS("GraphQL API");
  const compliance = await findS("SOC2 compliance");

  if (sso && api) await prisma.dependency.create({ data: { type:"CROSS_TEAM", status:"OPEN", description:"API v3 requires SSO token validation from Alpha.", fromStoryId: api.id, toStoryId: sso.id }});
  if (analytics && audit) await prisma.dependency.create({ data: { type:"CROSS_TEAM", status:"OPEN", description:"Analytics dashboard needs audit event stream from Echo.", fromStoryId: analytics.id, toStoryId: audit.id }});
  if (mobile && design) await prisma.dependency.create({ data: { type:"CROSS_TEAM", status:"OPEN", description:"Mobile v2 depends on Design System v2 components.", fromStoryId: mobile.id, toStoryId: design.id }});
  if (graphql && api) await prisma.dependency.create({ data: { type:"CROSS_TEAM", status:"OPEN", description:"GraphQL API builds on REST API v3 schema.", fromStoryId: graphql.id, toStoryId: api.id }});
  if (compliance && sso) await prisma.dependency.create({ data: { type:"CROSS_TEAM", status:"OPEN", description:"SOC2 compliance requires SSO audit logging.", fromStoryId: compliance.id, toStoryId: sso.id }});

  // ── PI Objectives ─────────────────────────────────────
  // PI1 objectives (COMPLETED)
  await prisma.objective.createMany({ data: [
    { title:"Launch basic auth & user management", piId:pi1.id, teamId:teamA.id, kind:"COMMITTED", businessValue:9, actualValue:9, completion:100 },
    { title:"Implement session & audit logging", piId:pi1.id, teamId:teamA.id, kind:"COMMITTED", businessValue:8, actualValue:8, completion:100 },
    { title:"Ship MVP analytics dashboard", piId:pi1.id, teamId:teamB.id, kind:"COMMITTED", businessValue:8, actualValue:8, completion:100 },
    { title:"Deliver event tracking pipeline", piId:pi1.id, teamId:teamB.id, kind:"COMMITTED", businessValue:7, actualValue:7, completion:100 },
    { title:"Launch REST API v1 with docs", piId:pi1.id, teamId:teamC.id, kind:"COMMITTED", businessValue:9, actualValue:9, completion:100 },
    { title:"API key management & rate limiting", piId:pi1.id, teamId:teamC.id, kind:"COMMITTED", businessValue:8, actualValue:8, completion:100 },
    { title:"Ship mobile app v1", piId:pi1.id, teamId:teamD.id, kind:"COMMITTED", businessValue:8, actualValue:7, completion:100 },
    { title:"Responsive web layout & navigation", piId:pi1.id, teamId:teamD.id, kind:"COMMITTED", businessValue:7, actualValue:7, completion:100 },
    { title:"CI/CD pipeline & containerization", piId:pi1.id, teamId:teamE.id, kind:"COMMITTED", businessValue:9, actualValue:9, completion:100 },
    { title:"HTTPS/TLS & centralized logging", piId:pi1.id, teamId:teamE.id, kind:"COMMITTED", businessValue:8, actualValue:8, completion:100 },
  ]});

  // PI2 objectives (IN PROGRESS — current PI)
  await prisma.objective.createMany({ data: [
    { title:"Enterprise SSO generally available", piId:pi2.id, teamId:teamA.id, kind:"COMMITTED", businessValue:9, completion:65 },
    { title:"Zero critical auth vulnerabilities", piId:pi2.id, teamId:teamA.id, kind:"COMMITTED", businessValue:9, completion:80 },
    { title:"Usage analytics MVP shipped", piId:pi2.id, teamId:teamB.id, kind:"COMMITTED", businessValue:8, completion:40 },
    { title:"Revenue analytics beta", piId:pi2.id, teamId:teamB.id, kind:"STRETCH", businessValue:7, completion:10 },
    { title:"API v3 public launch", piId:pi2.id, teamId:teamC.id, kind:"COMMITTED", businessValue:9, completion:55 },
    { title:"GraphQL API beta", piId:pi2.id, teamId:teamC.id, kind:"STRETCH", businessValue:7, completion:5 },
    { title:"Mobile app v2 foundation", piId:pi2.id, teamId:teamD.id, kind:"COMMITTED", businessValue:8, completion:30 },
    { title:"WCAG 2.1 AA compliance", piId:pi2.id, teamId:teamD.id, kind:"COMMITTED", businessValue:7, completion:20 },
    { title:"SOC2 Type II audit ready", piId:pi2.id, teamId:teamE.id, kind:"COMMITTED", businessValue:10, completion:45 },
    { title:"Zero high-severity incidents", piId:pi2.id, teamId:teamE.id, kind:"COMMITTED", businessValue:9, completion:90 },
  ]});

  // ── Risks (ROAM board for PI2) ────────────────────────
  console.log("Creating risks...");
  const members = await prisma.member.findMany();
  const getMember = (role: string, teamId: string) => members.find(m => m.role === role && m.teamId === teamId) ?? members[0];

  await prisma.risk.createMany({ data: [
    { title:"SSO integration timeline at risk", description:"SAML provider certification may take 3+ weeks, impacting SSO GA target.", roam:"MITIGATED", impact:"HIGH", probability:"MEDIUM", mitigation:"Parallel OIDC implementation as fallback. Daily sync with IdP vendor.", ownerId:getMember("DEV", teamA.id).id, teamId:teamA.id, piId:pi2.id, status:"MITIGATED" },
    { title:"Analytics pipeline latency SLA", description:"Real-time pipeline may not meet sub-second SLA at scale.", roam:"OWNED", impact:"MEDIUM", probability:"HIGH", mitigation:"Implementing tiered caching layer. Spike in IP sprint.", ownerId:getMember("ARCH", teamB.id).id, teamId:teamB.id, piId:pi2.id, status:"OPEN" },
    { title:"GraphQL federation complexity", description:"Schema stitching across microservices may cause N+1 query issues.", roam:"ACCEPTED", impact:"MEDIUM", probability:"MEDIUM", mitigation:"Accepted risk. DataLoader pattern planned for Q3.", ownerId:getMember("DEV", teamC.id).id, teamId:teamC.id, piId:pi2.id, status:"OPEN" },
    { title:"React Native bridge performance", description:"Native module bridge may cause jank on older Android devices.", roam:"MITIGATED", impact:"HIGH", probability:"LOW", mitigation:"Benchmarking complete. New Architecture (TurboModules) adopted.", ownerId:getMember("DEV", teamD.id).id, teamId:teamD.id, piId:pi2.id, status:"MITIGATED" },
    { title:"SOC2 evidence collection gaps", description:"Manual evidence collection may miss automated controls.", roam:"OWNED", impact:"CRITICAL", probability:"MEDIUM", mitigation:"Automated evidence collector built. Running weekly dry-run audits.", ownerId:getMember("DEV", teamE.id).id, teamId:teamE.id, piId:pi2.id, status:"OPEN" },
    { title:"Key person dependency — RTE", description:"Single RTE across 5 teams creates bus factor risk.", roam:"ACCEPTED", impact:"HIGH", probability:"LOW", mitigation:"Accepted. SM backup rotation established.", ownerId:getMember("SM", teamA.id).id, teamId:teamA.id, piId:pi2.id, status:"OPEN" },
    { title:"Mobile app store review delay", description:"Apple review process may delay release by 1-2 weeks.", roam:"RESOLVED", impact:"MEDIUM", probability:"MEDIUM", mitigation:"Prepared for expedited review. Staged rollout plan ready.", ownerId:getMember("PM", teamD.id).id, teamId:teamD.id, piId:pi2.id, status:"CLOSED" },
    { title:"API rate limiting edge cases", description:"Adaptive rate limiting algorithm may have false positives.", roam:"MITIGATED", impact:"MEDIUM", probability:"HIGH", mitigation:"Canary deployment with 10% traffic. Monitoring dashboards live.", ownerId:getMember("DEV", teamC.id).id, teamId:teamC.id, piId:pi2.id, status:"MITIGATED" },
  ]});
  console.log("Risks created.");

  // ── Confidence Votes (PI2) ─────────────────────────────
  console.log("Creating confidence votes...");
  await prisma.confidenceVote.createMany({ data: [
    { piId:pi2.id, teamId:teamA.id, score:4, comment:"SSO on track, MFA may slip 1 week. High confidence in auth core.", voterId:getMember("SM", teamA.id).id },
    { piId:pi2.id, teamId:teamB.id, score:3, comment:"Analytics pipeline needs more spike work. Data warehouse connector risky.", voterId:getMember("SM", teamB.id).id },
    { piId:pi2.id, teamId:teamC.id, score:4, comment:"API v3 solid. GraphQL beta may need more time for schema design.", voterId:getMember("SM", teamC.id).id },
    { piId:pi2.id, teamId:teamD.id, score:3, comment:"Mobile v2 foundation started. Offline sync is the biggest unknown.", voterId:getMember("SM", teamD.id).id },
    { piId:pi2.id, teamId:teamE.id, score:4, comment:"SOC2 automation ahead of schedule. Zero incidents so far.", voterId:getMember("SM", teamE.id).id },
    { piId:pi2.id, teamId:teamA.id, score:4, comment:"PO confidence: SSO and RBAC are top priorities. Team velocity stable.", voterId:getMember("PO", teamA.id).id },
    { piId:pi2.id, teamId:teamB.id, score:3, comment:"PO confidence: Revenue analytics is stretch. Core analytics on track.", voterId:getMember("PO", teamB.id).id },
  ]});

  // ── Capacity Planning (PI2 sprints) ──────────────────
  console.log("Creating capacity records...");
  const teams = [teamA, teamB, teamC, teamD, teamE];

  for (const team of teams) {
    const vel = team.velocity;
    const ptsPerSprint = Math.round(vel / 5);
    for (const iter of [pi2s1, pi2s2, pi2s3, pi2s4, pi2s5, pi2ip]) {
      const focusFactor = 0.75 + Math.random() * 0.1;
      const supportPercent = iter.kind === "IP" ? 0.3 : 0.1;
      const meetingsPercent = 0.1;
      const workDays = iter.kind === "IP" ? 10 : 10;
      const hoursPerDay = 6;
      const availableHours = Math.round(workDays * hoursPerDay * focusFactor * (1 - supportPercent - meetingsPercent));
      const plannedHours = Math.round(availableHours * (0.7 + Math.random() * 0.25));
      await prisma.capacity.create({
        data: {
          teamId: team.id,
          iterationId: iter.id,
          focusFactor,
          supportPercent,
          meetingsPercent,
          availableHours,
          plannedPoints: ptsPerSprint + Math.round((Math.random() - 0.5) * 4),
          plannedHours,
          remainingHours: Math.max(0, availableHours - plannedHours),
        }
      });
    }
  }

  const totalFeatures = features.length;
  const doneCount = features.filter(f => f.status === "DONE").length;
  const plannedCount = features.filter(f => f.status === "PLANNED").length;
  const refiningCount = features.filter(f => f.status === "REFINING").length;
  const backlogCount = features.filter(f => f.status === "BACKLOG").length;

  console.log("Seed complete.");
  console.log(`  Features: ${totalFeatures} (DONE: ${doneCount}, PLANNED: ${plannedCount}, REFINING: ${refiningCount}, BACKLOG: ${backlogCount})`);
  console.log(`  Stories: ${storyCount} (${doneCount > 0 ? "PI1: " + Math.round(storyCount * 0.2) + " DONE, " : ""}PI2: remaining)`);
  console.log(`  Teams: 5 | Velocity: ${38+34+36+32+30} total`);
  console.log(`  PIs: PI1(COMPLETED) → IP Sprint(now) → PI2(PLANNING) → PI3(future)`);
  console.log("  Login: admin@pihub.dev / password");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
