import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get the active PI (EXECUTING or PLANNING), fallback to most recent
    const art = await prisma.aRT.findFirst({
      include: {
        organization: true,
        teams: true,
        pis: {
          orderBy: { createdAt: "desc" },
          include: {
            iterations: { orderBy: { startDate: "asc" } },
            objectives: true,
          },
        },
      },
    });

    if (!art) return NextResponse.json(null);

    const currentPI = art.pis.find(p => p.status === "EXECUTING") ?? art.pis.find(p => p.status === "PLANNING") ?? art.pis[0];
    const artId = art.id;

    const [
      features, featuresDone, featuresInProgress, featuresPlanned, featuresBacklog, featuresRefining,
      featuresBusiness, featuresEnabler,
      stories, done, inProgress, blocked, todo,
      totalPointsResult, completedPointsResult,
    ] = await Promise.all([
      prisma.feature.count({ where: { artId } }),
      prisma.feature.count({ where: { artId, status: "DONE" } }),
      prisma.feature.count({ where: { artId, status: "IN_PROGRESS" } }),
      prisma.feature.count({ where: { artId, status: "PLANNED" } }),
      prisma.feature.count({ where: { artId, status: "BACKLOG" } }),
      prisma.feature.count({ where: { artId, status: "REFINING" } }),
      prisma.feature.count({ where: { artId, featureType: "BUSINESS" } }),
      prisma.feature.count({ where: { artId, featureType: "ENABLER" } }),
      prisma.story.count({ where: { feature: { artId } } }),
      prisma.story.count({ where: { feature: { artId }, status: "DONE" } }),
      prisma.story.count({ where: { feature: { artId }, status: "DOING" } }),
      prisma.story.count({ where: { feature: { artId }, status: "BLOCKED" } }),
      prisma.story.count({ where: { feature: { artId }, status: "TODO" } }),
      prisma.story.aggregate({ where: { feature: { artId } }, _sum: { storyPoints: true } }),
      prisma.story.aggregate({ where: { feature: { artId }, status: "DONE" }, _sum: { storyPoints: true } }),
    ]);

    // Dependencies - fetch all and count in JS to avoid complex nested OR on SQLite
    const allDeps = await prisma.dependency.findMany({
      where: {
        OR: [
          { fromFeatureId: { not: null } },
          { toFeatureId: { not: null } },
          { fromStoryId: { not: null } },
          { toStoryId: { not: null } },
        ],
      },
      include: {
        fromFeature: { select: { artId: true } },
        toFeature: { select: { artId: true } },
        fromStory: { select: { feature: { select: { artId: true } } } },
        toStory: { select: { feature: { select: { artId: true } } } },
      },
    });
    const artDeps = allDeps.filter(d =>
      d.fromFeature?.artId === artId || d.toFeature?.artId === artId ||
      d.fromStory?.feature?.artId === artId || d.toStory?.feature?.artId === artId
    );
    const openDependencies = artDeps.filter(d => d.status === "OPEN").length;
    const blockedDependencies = artDeps.filter(d => d.status === "BLOCKED").length;

    // Objectives
    const objectives = currentPI?.objectives.length ?? 0;
    const committedObjectives = currentPI?.objectives.filter(o => o.kind === "COMMITTED").length ?? 0;
    const stretchObjectives = currentPI?.objectives.filter(o => o.kind === "STRETCH").length ?? 0;
    const avgCompletion = objectives > 0
      ? (currentPI?.objectives.reduce((sum, o) => sum + o.completion, 0) ?? 0) / objectives
      : 0;

    // PI Timeline
    let piDaysTotal = 0, piDaysElapsed = 0, piDaysRemaining = 0;
    let currentIteration = "", totalIterations = 0, completedIterations = 0;

    if (currentPI) {
      const start = new Date(currentPI.startDate).getTime();
      const end = new Date(currentPI.endDate).getTime();
      const now = Date.now();
      piDaysTotal = Math.max(1, Math.ceil((end - start) / 86400000));
      piDaysElapsed = Math.min(piDaysTotal, Math.max(0, Math.ceil((now - start) / 86400000)));
      piDaysRemaining = Math.max(0, Math.ceil((end - now) / 86400000));
      totalIterations = currentPI.iterations.length;
      completedIterations = currentPI.iterations.filter(it => new Date(it.endDate).getTime() < now).length;
      currentIteration = currentPI.iterations.find(it => {
        const itStart = new Date(it.startDate).getTime();
        const itEnd = new Date(it.endDate).getTime();
        return now >= itStart && now <= itEnd;
      })?.name ?? "";
    }

    return NextResponse.json({
      art, currentPI,
      features, featuresDone, featuresInProgress, featuresPlanned, featuresBacklog, featuresRefining,
      featuresBusiness, featuresEnabler,
      stories, done, inProgress, blocked, todo,
      totalPoints: totalPointsResult._sum.storyPoints ?? 0,
      completedPoints: completedPointsResult._sum.storyPoints ?? 0,
      teams: art.teams.length,
      velocity: art.teams.reduce((sum, t) => sum + t.velocity, 0),
      objectives, committedObjectives, stretchObjectives, completion: avgCompletion,
      openDependencies, blockedDependencies,
      piDaysTotal, piDaysElapsed, piDaysRemaining,
      currentIteration, totalIterations, completedIterations,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
