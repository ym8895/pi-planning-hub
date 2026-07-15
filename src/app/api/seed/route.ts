import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "users" ("id" TEXT NOT NULL,"name" TEXT,"email" TEXT NOT NULL,"passwordHash" TEXT,"role" TEXT NOT NULL DEFAULT 'VIEWER',"image" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "users_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE TABLE IF NOT EXISTS "accounts" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"type" TEXT NOT NULL,"provider" TEXT NOT NULL,"providerAccountId" TEXT NOT NULL,"refresh_token" TEXT,"access_token" TEXT,"expires_at" INTEGER,"token_type" TEXT,"scope" TEXT,"id_token" TEXT,"session_state" TEXT,CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE TABLE IF NOT EXISTS "sessions" ("id" TEXT NOT NULL,"sessionToken" TEXT NOT NULL,"userId" TEXT NOT NULL,"expires" TIMESTAMP(3) NOT NULL,CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");
CREATE TABLE IF NOT EXISTS "verification_tokens" ("identifier" TEXT NOT NULL,"token" TEXT NOT NULL,"expires" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE TABLE IF NOT EXISTS "organizations" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "organizations_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "arts" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,"organizationId" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "arts_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "arts_organizationId_idx" ON "arts"("organizationId");
CREATE TABLE IF NOT EXISTS "pis" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"artId" TEXT NOT NULL,"startDate" TIMESTAMP(3) NOT NULL,"endDate" TIMESTAMP(3) NOT NULL,"status" TEXT NOT NULL DEFAULT 'PLANNING',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "pis_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "pis_artId_idx" ON "pis"("artId");
CREATE TABLE IF NOT EXISTS "iterations" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"piId" TEXT NOT NULL,"startDate" TIMESTAMP(3) NOT NULL,"endDate" TIMESTAMP(3) NOT NULL,"kind" TEXT NOT NULL DEFAULT 'SPRINT',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "iterations_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "iterations_piId_idx" ON "iterations"("piId");
CREATE TABLE IF NOT EXISTS "teams" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,"artId" TEXT NOT NULL,"velocity" DOUBLE PRECISION NOT NULL DEFAULT 0,"color" TEXT NOT NULL DEFAULT '#6366f1',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "teams_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "teams_artId_idx" ON "teams"("artId");
CREATE TABLE IF NOT EXISTS "members" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"teamId" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'DEV',"availabilityPercent" DOUBLE PRECISION NOT NULL DEFAULT 100,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "members_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "members_teamId_idx" ON "members"("teamId");
CREATE UNIQUE INDEX IF NOT EXISTS "members_userId_teamId_key" ON "members"("userId", "teamId");
CREATE TABLE IF NOT EXISTS "features" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,"benefitHypothesis" TEXT,"acceptanceCriteria" TEXT,"artId" TEXT NOT NULL,"ownerTeamId" TEXT,"ownerId" TEXT,"businessValue" DOUBLE PRECISION NOT NULL DEFAULT 1,"timeCriticality" DOUBLE PRECISION NOT NULL DEFAULT 1,"riskReduction" DOUBLE PRECISION NOT NULL DEFAULT 1,"jobSize" DOUBLE PRECISION NOT NULL DEFAULT 1,"priority" TEXT NOT NULL DEFAULT 'SHOULD',"status" TEXT NOT NULL DEFAULT 'BACKLOG',"featureType" TEXT NOT NULL DEFAULT 'BUSINESS',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "features_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "features_artId_idx" ON "features"("artId");
CREATE INDEX IF NOT EXISTS "features_ownerTeamId_idx" ON "features"("ownerTeamId");
CREATE TABLE IF NOT EXISTS "stories" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"description" TEXT,"acceptanceCriteria" TEXT,"featureId" TEXT NOT NULL,"teamId" TEXT,"iterationId" TEXT,"ownerId" TEXT,"storyPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,"status" TEXT NOT NULL DEFAULT 'TODO',"definitionOfReady" BOOLEAN NOT NULL DEFAULT false,"definitionOfDone" BOOLEAN NOT NULL DEFAULT false,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "stories_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "stories_featureId_idx" ON "stories"("featureId");
CREATE INDEX IF NOT EXISTS "stories_teamId_idx" ON "stories"("teamId");
CREATE INDEX IF NOT EXISTS "stories_iterationId_idx" ON "stories"("iterationId");
CREATE TABLE IF NOT EXISTS "objectives" ("id" TEXT NOT NULL,"title" TEXT NOT NULL,"description" TEXT,"piId" TEXT NOT NULL,"teamId" TEXT,"kind" TEXT NOT NULL DEFAULT 'COMMITTED',"businessValue" INTEGER NOT NULL DEFAULT 0,"actualValue" INTEGER NOT NULL DEFAULT 0,"completion" DOUBLE PRECISION NOT NULL DEFAULT 0,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "objectives_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "objectives_piId_idx" ON "objectives"("piId");
CREATE INDEX IF NOT EXISTS "objectives_teamId_idx" ON "objectives"("teamId");
CREATE TABLE IF NOT EXISTS "dependencies" ("id" TEXT NOT NULL,"type" TEXT NOT NULL DEFAULT 'CROSS_TEAM',"status" TEXT NOT NULL DEFAULT 'OPEN',"description" TEXT,"fromStoryId" TEXT,"toStoryId" TEXT,"fromFeatureId" TEXT,"toFeatureId" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "dependencies_pkey" PRIMARY KEY ("id"));
CREATE TABLE IF NOT EXISTS "holidays" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"date" TIMESTAMP(3) NOT NULL,"organizationId" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "holidays_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "holidays_organizationId_idx" ON "holidays"("organizationId");
CREATE TABLE IF NOT EXISTS "leaves" ("id" TEXT NOT NULL,"memberId" TEXT NOT NULL,"startDate" TIMESTAMP(3) NOT NULL,"endDate" TIMESTAMP(3) NOT NULL,"reason" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "leaves_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "leaves_memberId_idx" ON "leaves"("memberId");
CREATE TABLE IF NOT EXISTS "capacities" ("id" TEXT NOT NULL,"teamId" TEXT NOT NULL,"iterationId" TEXT NOT NULL,"focusFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.8,"supportPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.1,"meetingsPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.1,"availableHours" DOUBLE PRECISION NOT NULL DEFAULT 0,"plannedPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,"plannedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,"remainingHours" DOUBLE PRECISION NOT NULL DEFAULT 0,"utilization" DOUBLE PRECISION NOT NULL DEFAULT 0,"overloaded" BOOLEAN NOT NULL DEFAULT false,CONSTRAINT "capacities_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "capacities_teamId_iterationId_key" ON "capacities"("teamId", "iterationId");
CREATE TABLE IF NOT EXISTS "risks" ("id" TEXT NOT NULL,"title" TEXT NOT NULL,"description" TEXT,"roam" TEXT NOT NULL DEFAULT 'OPEN',"impact" TEXT NOT NULL DEFAULT 'MEDIUM',"probability" TEXT NOT NULL DEFAULT 'MEDIUM',"mitigation" TEXT,"ownerId" TEXT,"teamId" TEXT,"piId" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'OPEN',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "risks_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "risks_piId_idx" ON "risks"("piId");
CREATE INDEX IF NOT EXISTS "risks_teamId_idx" ON "risks"("teamId");
CREATE TABLE IF NOT EXISTS "confidence_votes" ("id" TEXT NOT NULL,"piId" TEXT NOT NULL,"teamId" TEXT NOT NULL,"score" INTEGER NOT NULL,"comment" TEXT,"voterId" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "confidence_votes_pkey" PRIMARY KEY ("id"));
CREATE INDEX IF NOT EXISTS "confidence_votes_piId_teamId_idx" ON "confidence_votes"("piId", "teamId");
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "arts" ADD CONSTRAINT "arts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pis" ADD CONSTRAINT "pis_artId_fkey" FOREIGN KEY ("artId") REFERENCES "arts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "iterations" ADD CONSTRAINT "iterations_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teams" ADD CONSTRAINT "teams_artId_fkey" FOREIGN KEY ("artId") REFERENCES "arts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "members" ADD CONSTRAINT "members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "features" ADD CONSTRAINT "features_ownerTeamId_fkey" FOREIGN KEY ("ownerTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "features" ADD CONSTRAINT "features_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stories" ADD CONSTRAINT "stories_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stories" ADD CONSTRAINT "stories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stories" ADD CONSTRAINT "stories_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "iterations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stories" ADD CONSTRAINT "stories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_fromStoryId_fkey" FOREIGN KEY ("fromStoryId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_toStoryId_fkey" FOREIGN KEY ("toStoryId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_fromFeatureId_fkey" FOREIGN KEY ("fromFeatureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_toFeatureId_fkey" FOREIGN KEY ("toFeatureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "capacities" ADD CONSTRAINT "capacities_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "capacities" ADD CONSTRAINT "capacities_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "iterations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "risks" ADD CONSTRAINT "risks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "risks" ADD CONSTRAINT "risks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "risks" ADD CONSTRAINT "risks_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "confidence_votes" ADD CONSTRAINT "confidence_votes_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "confidence_votes" ADD CONSTRAINT "confidence_votes_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "confidence_votes" ADD CONSTRAINT "confidence_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
`;

export async function POST() {
  try {
    // Step 1: Create schema
    const statements = SCHEMA_SQL.split(";").map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (e: any) {
        // Ignore "already exists" errors
        if (!e.message?.includes("already exists")) {
          console.warn("SQL warning:", e.message);
        }
      }
    }

    // Step 2: Check if data exists
    const artCount = await prisma.aRT.count();
    if (artCount > 0) {
      return NextResponse.json({ message: "Database already seeded" });
    }

    // Step 3: Seed data
    const org = await prisma.organization.create({ data: { name: "Acme Corp", description: "Enterprise SAFe Organization" } });
    const platformART = await prisma.aRT.create({ data: { name: "Platform ART", organizationId: org.id } });
    const mobileART = await prisma.aRT.create({ data: { name: "Mobile ART", organizationId: org.id } });

    const pi1 = await prisma.pI.create({ data: { name: "PI1 - Q3 2025", artId: platformART.id, startDate: new Date("2025-07-01"), endDate: new Date("2025-09-30"), status: "COMPLETED" } });
    const pi2 = await prisma.pI.create({ data: { name: "PI2 - Q1 2026", artId: platformART.id, startDate: new Date("2026-01-06"), endDate: new Date("2026-03-27"), status: "EXECUTING" } });
    const pi3 = await prisma.pI.create({ data: { name: "PI3 - Q2 2026", artId: platformART.id, startDate: new Date("2026-04-06"), endDate: new Date("2026-06-26"), status: "PLANNING" } });
    const mobilePi = await prisma.pI.create({ data: { name: "Mobile PI1", artId: mobileART.id, startDate: new Date("2026-01-06"), endDate: new Date("2026-03-27"), status: "EXECUTING" } });

    const makeIterations = async (piId: string, start: string) => {
      const sprints = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5", "IP"];
      const s = new Date(start);
      const ids: string[] = [];
      for (let i = 0; i < sprints.length; i++) {
        const ss = new Date(s.getTime() + i * 14 * 86400000);
        const se = new Date(ss.getTime() + 13 * 86400000);
        const iter = await prisma.iteration.create({ data: { name: sprints[i], piId, startDate: ss, endDate: se, kind: i === 5 ? "IP" : "SPRINT" } });
        ids.push(iter.id);
      }
      return ids;
    };

    const pi1Iters = await makeIterations(pi1.id, "2025-07-01");
    const pi2Iters = await makeIterations(pi2.id, "2026-01-06");
    const pi3Iters = await makeIterations(pi3.id, "2026-04-06");
    const mobileIters = await makeIterations(mobilePi.id, "2026-01-06");

    const platformTeams = [
      { name: "Alpha", color: "#6366f1", velocity: 40 },
      { name: "Bravo", color: "#22c55e", velocity: 35 },
      { name: "Charlie", color: "#eab308", velocity: 30 },
      { name: "Delta", color: "#3b82f6", velocity: 35 },
      { name: "Echo", color: "#ec4899", velocity: 30 },
    ];
    const mobileTeams = [
      { name: "iOS Squad", color: "#14b8a6", velocity: 25 },
      { name: "Android Squad", color: "#f97316", velocity: 25 },
      { name: "Shared Libs", color: "#8b5cf6", velocity: 20 },
    ];

    const createdPlatformTeams = [];
    for (const t of platformTeams) {
      const team = await prisma.team.create({ data: { ...t, artId: platformART.id } });
      createdPlatformTeams.push(team);
    }
    const createdMobileTeams = [];
    for (const t of mobileTeams) {
      const team = await prisma.team.create({ data: { ...t, artId: mobileART.id } });
      createdMobileTeams.push(team);
    }

    const user = await prisma.user.create({ data: { email: "admin@pihub.dev", name: "Admin", role: "ADMIN", passwordHash: "$2b$10$placeholder" } });

    const members = [];
    for (const team of [...createdPlatformTeams, ...createdMobileTeams]) {
      const member = await prisma.member.create({ data: { userId: user.id, teamId: team.id, role: "DEV" } });
      members.push(member);
    }

    const featureNames = [
      "User Authentication", "Dashboard Analytics", "API Gateway", "Payment Integration",
      "Search Engine", "Notification Service", "File Upload", "Reporting Module",
      "Real-time Chat", "Data Export", "Role Management", "Audit Logging",
      "Email Templates", "Webhook System", "Cache Layer", "CDN Integration",
      "Mobile Push", "SSO Integration", "Batch Processing", "Workflow Engine",
      "Document Management", "Calendar Integration", "Task Scheduler", "Metrics Dashboard",
      "Admin Panel",
    ];

    const statuses = ["DONE", "PLANNED", "PLANNED", "PLANNED", "BACKLOG", "REFINING"];
    const createdFeatures = [];

    for (let i = 0; i < featureNames.length; i++) {
      const team = createdPlatformTeams[i % createdPlatformTeams.length];
      const feature = await prisma.feature.create({
        data: {
          name: featureNames[i],
          description: `${featureNames[i]} implementation for the platform`,
          artId: platformART.id,
          ownerTeamId: team.id,
          businessValue: Math.floor(Math.random() * 5) + 1,
          timeCriticality: Math.floor(Math.random() * 5) + 1,
          riskReduction: Math.floor(Math.random() * 5) + 1,
          jobSize: Math.floor(Math.random() * 8) + 1,
          status: statuses[i % statuses.length],
          featureType: i % 5 === 0 ? "ENABLER" : "BUSINESS",
        },
      });
      createdFeatures.push(feature);
    }

    let storyCount = 0;
    for (const feature of createdFeatures) {
      const numStories = Math.floor(Math.random() * 3) + 2;
      for (let s = 0; s < numStories; s++) {
        const team = createdPlatformTeams[Math.floor(Math.random() * createdPlatformTeams.length)];
        const iterIdx = Math.floor(Math.random() * 5);
        const status = Math.random() > 0.4 ? "DONE" : ["TODO", "DOING", "BLOCKED"][Math.floor(Math.random() * 3)];
        const pts = Math.floor(Math.random() * 8) + 1;
        await prisma.story.create({
          data: { name: `${feature.name} - Story ${s + 1}`, featureId: feature.id, teamId: team.id, iterationId: pi2Iters[iterIdx], storyPoints: pts, status },
        });
        storyCount++;
      }
    }

    const objectiveTitles = ["Improve Platform Reliability", "Enhance User Experience", "Reduce Technical Debt", "Scale Infrastructure", "Improve Security Posture", "Increase Team Velocity", "Reduce Deployment Time", "Improve Code Quality", "Enhance Monitoring", "Optimize Database Performance"];
    for (const title of objectiveTitles) {
      const team = createdPlatformTeams[Math.floor(Math.random() * createdPlatformTeams.length)];
      await prisma.objective.create({ data: { title, description: `Objective: ${title}`, piId: pi2.id, teamId: team.id, kind: Math.random() > 0.3 ? "COMMITTED" : "STRETCH", businessValue: Math.floor(Math.random() * 10) + 1, completion: Math.floor(Math.random() * 80) + 20 } });
    }

    const riskTitles = ["Third-party API dependency", "Resource constraints", "Security vulnerability", "Performance bottleneck", "Integration complexity"];
    for (const title of riskTitles) {
      const team = createdPlatformTeams[Math.floor(Math.random() * createdPlatformTeams.length)];
      await prisma.risk.create({ data: { title, description: `Risk: ${title}`, piId: pi2.id, teamId: team.id, roam: ["OPEN", "OWNED", "MITIGATED", "ACCEPTED"][Math.floor(Math.random() * 4)], impact: ["HIGH", "MEDIUM", "LOW"][Math.floor(Math.random() * 3)], probability: ["HIGH", "MEDIUM", "LOW"][Math.floor(Math.random() * 3)] } });
    }

    for (const team of createdPlatformTeams) {
      await prisma.confidenceVote.create({ data: { piId: pi2.id, teamId: team.id, score: Math.floor(Math.random() * 3) + 2, comment: Math.random() > 0.5 ? "Confident in delivery" : undefined } });
    }

    for (const team of createdPlatformTeams) {
      for (const iterId of pi2Iters) {
        const iter = await prisma.iteration.findUnique({ where: { id: iterId } });
        if (!iter || iter.kind === "IP") continue;
        await prisma.capacity.create({ data: { teamId: team.id, iterationId: iterId, focusFactor: 0.8, supportPercent: 0.1, availableHours: team.velocity * 8, plannedPoints: team.velocity, plannedHours: team.velocity * 6, remainingHours: Math.floor(Math.random() * team.velocity * 2), utilization: Math.floor(Math.random() * 40) + 60, overloaded: Math.random() > 0.8 } });
      }
    }

    // Cross-team dependencies
    const allStories = await prisma.story.findMany({ take: 20 });
    if (allStories.length >= 4) {
      await prisma.dependency.create({ data: { type: "CROSS_TEAM", status: "OPEN", description: "Auth depends on API Gateway", fromStoryId: allStories[0].id, toStoryId: allStories[2].id } });
      await prisma.dependency.create({ data: { type: "CROSS_TEAM", status: "BLOCKED", description: "Payment depends on Auth", fromStoryId: allStories[4].id, toStoryId: allStories[0].id } });
    }

    return NextResponse.json({
      message: "Seed complete!",
      stats: { arts: 2, pis: 4, teams: createdPlatformTeams.length + createdMobileTeams.length, features: createdFeatures.length, stories: storyCount },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
