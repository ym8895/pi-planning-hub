import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCached("dashboard", async () => {
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

      if (!art) return null;

      const currentPI = art.pis.find(p => p.status === "EXECUTING") ?? art.pis.find(p => p.status === "PLANNING") ?? art.pis[0];
      const artId = art.id;

      const [features, stories] = await Promise.all([
        prisma.feature.groupBy({
          by: ["status", "featureType"],
          where: { artId },
          _count: true,
        }),
        prisma.story.groupBy({
          by: ["status"],
          where: { feature: { artId } },
          _count: true,
          _sum: { storyPoints: true },
        }),
      ]);

      const featureCounts: Record<string, number> = {};
      const typeCounts: Record<string, number> = {};
      features.forEach(f => {
        featureCounts[f.status] = (featureCounts[f.status] || 0) + f._count;
        typeCounts[f.featureType] = (typeCounts[f.featureType] || 0) + f._count;
      });

      const storyCounts: Record<string, number> = {};
      let totalPoints = 0, completedPoints = 0;
      stories.forEach(s => {
        storyCounts[s.status] = (storyCounts[s.status] || 0) + s._count;
        totalPoints += s._sum.storyPoints || 0;
        if (s.status === "DONE") completedPoints += s._sum.storyPoints || 0;
      });

      const depCounts = await prisma.dependency.groupBy({
        by: ["status"],
        _count: true,
      });
      const depMap: Record<string, number> = {};
      depCounts.forEach(d => { depMap[d.status] = d._count; });

      const objectives = currentPI?.objectives ?? [];
      const committedObjectives = objectives.filter(o => o.kind === "COMMITTED").length;
      const stretchObjectives = objectives.filter(o => o.kind === "STRETCH").length;
      const avgCompletion = objectives.length > 0
        ? objectives.reduce((sum, o) => sum + o.completion, 0) / objectives.length
        : 0;

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

      return {
        art, currentPI,
        features: featureCounts["BACKLOG"] || 0,
        featuresDone: featureCounts["DONE"] || 0,
        featuresInProgress: featureCounts["IN_PROGRESS"] || 0,
        featuresPlanned: featureCounts["PLANNED"] || 0,
        featuresBacklog: featureCounts["BACKLOG"] || 0,
        featuresRefining: featureCounts["REFINING"] || 0,
        featuresBusiness: typeCounts["BUSINESS"] || 0,
        featuresEnabler: typeCounts["ENABLER"] || 0,
        stories: storyCounts["TODO"] + storyCounts["DOING"] + storyCounts["DONE"] + storyCounts["BLOCKED"] || 0,
        done: storyCounts["DONE"] || 0,
        inProgress: storyCounts["DOING"] || 0,
        blocked: storyCounts["BLOCKED"] || 0,
        todo: storyCounts["TODO"] || 0,
        totalPoints, completedPoints,
        teams: art.teams.length,
        velocity: art.teams.reduce((sum, t) => sum + t.velocity, 0),
        objectives: objectives.length, committedObjectives, stretchObjectives, completion: avgCompletion,
        openDependencies: depMap["OPEN"] || 0,
        blockedDependencies: depMap["BLOCKED"] || 0,
        piDaysTotal, piDaysElapsed, piDaysRemaining,
        currentIteration, totalIterations, completedIterations,
      };
    }, 300);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
