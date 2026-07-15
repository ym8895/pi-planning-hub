import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const artCount = await prisma.aRT.count();
    if (artCount > 0) {
      return NextResponse.json({ message: "Database already seeded", skipReason: "data_exists" });
    }

    // Inline seed logic (can't use child_process on Vercel)
    // Organization
    const org = await prisma.organization.create({
      data: { name: "Acme Corp", description: "Enterprise SAFe Organization" },
    });

    // ARTs
    const platformART = await prisma.aRT.create({
      data: { name: "Platform ART", organizationId: org.id },
    });
    const mobileART = await prisma.aRT.create({
      data: { name: "Mobile ART", organizationId: org.id },
    });

    // PIs
    const pi1 = await prisma.pI.create({
      data: { name: "PI1 - Q3 2025", artId: platformART.id, startDate: new Date("2025-07-01"), endDate: new Date("2025-09-30"), status: "COMPLETED" },
    });
    const pi2 = await prisma.pI.create({
      data: { name: "PI2 - Q1 2026", artId: platformART.id, startDate: new Date("2026-01-06"), endDate: new Date("2026-03-27"), status: "EXECUTING" },
    });
    const pi3 = await prisma.pI.create({
      data: { name: "PI3 - Q2 2026", artId: platformART.id, startDate: new Date("2026-04-06"), endDate: new Date("2026-06-26"), status: "PLANNING" },
    });
    const mobilePi = await prisma.pI.create({
      data: { name: "Mobile PI1", artId: mobileART.id, startDate: new Date("2026-01-06"), endDate: new Date("2026-03-27"), status: "EXECUTING" },
    });

    // Iterations for each PI
    const makeIterations = async (piId: string) => {
      const sprints = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5", "IP"];
      const start = new Date("2026-01-06");
      const ids: string[] = [];
      for (let i = 0; i < sprints.length; i++) {
        const s = new Date(start.getTime() + i * 14 * 24 * 60 * 60 * 1000);
        const e = new Date(s.getTime() + 13 * 24 * 60 * 60 * 1000);
        const iter = await prisma.iteration.create({
          data: { name: sprints[i], piId, startDate: s, endDate: e, kind: i === 5 ? "IP" : "SPRINT" },
        });
        ids.push(iter.id);
      }
      return ids;
    };

    const pi2Iters = await makeIterations(pi2.id);
    const pi1Iters = await makeIterations(pi1.id);
    const pi3Iters = await makeIterations(pi3.id);
    const mobileIters = await makeIterations(mobilePi.id);

    // Platform teams
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

    const allPlatformTeams = createdPlatformTeams;
    const allMobileTeams = createdMobileTeams;

    // User
    const user = await prisma.user.create({
      data: { email: "admin@pihub.dev", name: "Admin", role: "ADMIN", passwordHash: "$2b$10$placeholder" },
    });

    // Members
    const members = [];
    for (const team of [...allPlatformTeams, ...allMobileTeams]) {
      const member = await prisma.member.create({
        data: { userId: user.id, teamId: team.id, role: "DEV" },
      });
      members.push(member);
    }

    // Features
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
      const team = allPlatformTeams[i % allPlatformTeams.length];
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

    // Stories for PI2 iterations
    const storyStatuses = ["DONE", "DOING", "TODO", "BLOCKED"];
    const storyCount = { total: 0, done: 0 };

    for (const feature of createdFeatures) {
      const numStories = Math.floor(Math.random() * 3) + 2;
      for (let s = 0; s < numStories; s++) {
        const team = allPlatformTeams[Math.floor(Math.random() * allPlatformTeams.length)];
        const iterIdx = Math.floor(Math.random() * 5);
        const iterId = pi2Iters[iterIdx];
        const status = Math.random() > 0.4 ? "DONE" : storyStatuses[Math.floor(Math.random() * storyStatuses.length)];
        const pts = Math.floor(Math.random() * 8) + 1;

        await prisma.story.create({
          data: {
            name: `${feature.name} - Story ${s + 1}`,
            featureId: feature.id,
            teamId: team.id,
            iterationId: iterId,
            storyPoints: pts,
            status,
          },
        });
        storyCount.total++;
        if (status === "DONE") storyCount.done++;
      }
    }

    // Objectives
    const objectiveTitles = [
      "Improve Platform Reliability", "Enhance User Experience", "Reduce Technical Debt",
      "Scale Infrastructure", "Improve Security Posture", "Increase Team Velocity",
      "Reduce Deployment Time", "Improve Code Quality", "Enhance Monitoring",
      "Optimize Database Performance",
    ];
    for (const title of objectiveTitles) {
      const team = allPlatformTeams[Math.floor(Math.random() * allPlatformTeams.length)];
      await prisma.objective.create({
        data: {
          title,
          description: `Objective: ${title}`,
          piId: pi2.id,
          teamId: team.id,
          kind: Math.random() > 0.3 ? "COMMITTED" : "STRETCH",
          businessValue: Math.floor(Math.random() * 10) + 1,
          completion: Math.floor(Math.random() * 80) + 20,
        },
      });
    }

    // Risks
    const riskTitles = [
      "Third-party API dependency", "Resource constraints", "Security vulnerability",
      "Performance bottleneck", "Integration complexity",
    ];
    for (const title of riskTitles) {
      const team = allPlatformTeams[Math.floor(Math.random() * allPlatformTeams.length)];
      await prisma.risk.create({
        data: {
          title,
          description: `Risk: ${title}`,
          piId: pi2.id,
          teamId: team.id,
          roam: ["OPEN", "OWNED", "MITIGATED", "ACCEPTED"][Math.floor(Math.random() * 4)],
          impact: ["HIGH", "MEDIUM", "LOW"][Math.floor(Math.random() * 3)],
          probability: ["HIGH", "MEDIUM", "LOW"][Math.floor(Math.random() * 3)],
        },
      });
    }

    // Confidence votes
    for (const team of allPlatformTeams) {
      await prisma.confidenceVote.create({
        data: {
          piId: pi2.id,
          teamId: team.id,
          score: Math.floor(Math.random() * 3) + 2,
          comment: Math.random() > 0.5 ? "Confident in delivery" : undefined,
        },
      });
    }

    // Capacity records
    for (const team of allPlatformTeams) {
      for (const iterId of pi2Iters) {
        const iter = await prisma.iteration.findUnique({ where: { id: iterId } });
        if (!iter || iter.kind === "IP") continue;
        await prisma.capacity.create({
          data: {
            teamId: team.id,
            iterationId: iterId,
            focusFactor: 0.8,
            supportPercent: 0.1,
            availableHours: team.velocity * 8,
            plannedPoints: team.velocity,
            plannedHours: team.velocity * 6,
            remainingHours: Math.floor(Math.random() * team.velocity * 2),
            utilization: Math.floor(Math.random() * 40) + 60,
            overloaded: Math.random() > 0.8,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Seed complete!",
      stats: {
        orgs: 1, arts: 2, pis: 4,
        teams: allPlatformTeams.length + allMobileTeams.length,
        features: createdFeatures.length,
        stories: storyCount.total,
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
