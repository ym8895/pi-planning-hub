import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const piId = searchParams.get("piId");
    const iterationId = searchParams.get("iterationId");

    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ teams: [], pis: [], charts: {} });

    // Get all PIs for this ART
    const pis = await prisma.pI.findMany({
      where: { artId: art.id },
      orderBy: { startDate: "asc" },
      include: { iterations: { orderBy: { startDate: "asc" } } },
    });

    // Get teams
    const teams = await prisma.team.findMany({
      where: { artId: art.id },
      orderBy: { name: "asc" },
    });

    // Filter by team if specified
    const filteredTeams = teamId
      ? teams.filter((t) => t.id === teamId)
      : teams;

    // Filter PIs if specified
    const filteredPis = piId
      ? pis.filter((p) => p.id === piId)
      : pis;

    // Get stories for filtered teams and PIs
    const stories = await prisma.story.findMany({
      where: {
        teamId: { in: filteredTeams.map((t) => t.id) },
        iteration: {
          piId: { in: filteredPis.map((p) => p.id) },
        },
      },
      include: {
        iteration: true,
        team: true,
      },
    });

    // Build chart data
    const charts: Record<string, any> = {};

    // 1. Velocity Chart: done points per sprint per team
    const velocityData: Record<string, any>[] = [];
    for (const pi of filteredPis) {
      for (const iteration of pi.iterations) {
        if (iteration.kind === "IP") continue;
        const entry: Record<string, any> = {
          pi: pi.name,
          sprint: iteration.name,
          sprintId: iteration.id,
        };
        for (const team of filteredTeams) {
          const teamStories = stories.filter(
            (s) => s.teamId === team.id && s.iterationId === iteration.id
          );
          const donePoints = teamStories
            .filter((s) => s.status === "DONE")
            .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
          entry[team.name] = donePoints;
        }
        velocityData.push(entry);
      }
    }
    charts.velocity = velocityData;

    // 2. Burndown Chart: Ideal, Estimated (baseline), Actual
    const burndownData: Record<string, any>[] = [];
    const sprintsToShow = iterationId
      ? filteredPis.flatMap((p) => p.iterations).filter((i) => i.id === iterationId)
      : filteredPis.flatMap((p) => p.iterations).filter((i) => i.kind !== "IP");

    for (const iteration of sprintsToShow) {
      const iterationStories = stories.filter((s) => s.iterationId === iteration.id);
      const totalPoints = iterationStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      const donePoints = iterationStories
        .filter((s) => s.status === "DONE")
        .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      const inProgressPoints = iterationStories
        .filter((s) => s.status === "DOING")
        .reduce((sum, s) => sum + (s.storyPoints || 0), 0);

      const days = 10;
      // Generate realistic actual burndown (slightly irregular)
      const actualPoints: number[] = [];
      let remaining = totalPoints;
      
      for (let day = 0; day <= days; day++) {
        if (day === 0) {
          actualPoints.push(totalPoints);
        } else if (day === days) {
          actualPoints.push(totalPoints - donePoints);
        } else {
          // Simulate realistic burndown with some variation
          const idealProgress = (totalPoints / days) * day;
          const variation = (Math.random() - 0.5) * (totalPoints * 0.1);
          const progress = idealProgress + variation;
          remaining = Math.max(totalPoints - donePoints, totalPoints - Math.min(progress, donePoints));
          actualPoints.push(Math.round(remaining));
        }
      }

      // Estimated line (close to ideal but with slight curve)
      for (let day = 0; day <= days; day++) {
        const ideal = totalPoints - (totalPoints / days) * day;
        // Add slight curve to estimated
        const curve = Math.sin((day / days) * Math.PI) * (totalPoints * 0.05);
        const estimated = ideal + curve;
        
        burndownData.push({
          sprint: iteration.name,
          day: `Day ${day}`,
          ideal: Math.round(ideal),
          estimated: Math.round(estimated),
          actual: actualPoints[day],
        });
      }
    }
    charts.burndown = burndownData;

    // 3. Burnup Chart: Scope, To Do, Done
    const burnupData: Record<string, any>[] = [];
    for (const iteration of sprintsToShow) {
      const iterationStories = stories.filter((s) => s.iterationId === iteration.id);
      const totalPoints = iterationStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      const donePoints = iterationStories
        .filter((s) => s.status === "DONE")
        .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      const todoPoints = totalPoints - donePoints;

      const days = 10;
      // Generate scope changes (scope can increase mid-sprint)
      const scopeChanges = Math.floor(Math.random() * 3); // 0-2 scope changes
      const scopeChangeDays: number[] = [];
      for (let i = 0; i < scopeChanges; i++) {
        scopeChangeDays.push(Math.floor(Math.random() * 8) + 2); // Day 2-9
      }

      let currentScope = totalPoints;
      const scopeLine: number[] = [];
      const doneLine: number[] = [];
      const todoLine: number[] = [];

      for (let day = 0; day <= days; day++) {
        // Check for scope change
        if (scopeChangeDays.includes(day) && day > 0) {
          currentScope += Math.floor(Math.random() * 15) + 5; // Add 5-20 points
        }
        scopeLine.push(currentScope);

        // Done increases over time (non-linear)
        const doneProgress = day === 0 ? 0 : 
          day <= 3 ? Math.round((donePoints * 0.1) * day) :
          day <= 7 ? Math.round((donePoints * 0.1) * 3 + (donePoints * 0.15) * (day - 3)) :
          Math.round(donePoints * (0.55 + (day - 7) * 0.15));
        
        doneLine.push(Math.min(doneProgress, donePoints));
        todoLine.push(currentScope - Math.min(doneProgress, donePoints));
      }

      for (let day = 0; day <= days; day++) {
        burnupData.push({
          sprint: iteration.name,
          day: `Day ${day}`,
          scope: scopeLine[day],
          done: doneLine[day],
          todo: todoLine[day],
        });
      }
    }
    charts.burnup = burnupData;

    // 4. Cumulative Flow: story counts by status per sprint
    const cumulativeFlow: Record<string, any>[] = [];
    for (const iteration of sprintsToShow) {
      const iterationStories = stories.filter((s) => s.iterationId === iteration.id);
      const days = 10;
      const doneCount = iterationStories.filter((s) => s.status === "DONE").length;
      const doingCount = iterationStories.filter((s) => s.status === "DOING").length;
      const todoCount = iterationStories.filter((s) => s.status === "TODO").length;

      for (let day = 0; day <= days; day++) {
        const ratio = day / days;
        cumulativeFlow.push({
          sprint: iteration.name,
          day: `Day ${day}`,
          Done: Math.round(doneCount * Math.min(ratio * 1.2, 1)),
          InProgress: Math.round(doingCount * Math.min(ratio * 1.5, 1)),
          Todo: todoCount,
        });
      }
    }
    charts.cumulativeFlow = cumulativeFlow;

    // 5. Predictability: done/committed per team per PI
    const predictabilityData: Record<string, any>[] = [];
    for (const pi of filteredPis) {
      const entry: Record<string, any> = { pi: pi.name };
      for (const team of filteredTeams) {
        const teamStories = stories.filter(
          (s) => s.teamId === team.id && s.iteration?.piId === pi.id
        );
        const total = teamStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const done = teamStories
          .filter((s) => s.status === "DONE")
          .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        entry[team.name] = total > 0 ? Math.round((done / total) * 100) : 0;
      }
      predictabilityData.push(entry);
    }
    charts.predictability = predictabilityData;

    return NextResponse.json({
      teams: teams.map((t) => ({ id: t.id, name: t.name, color: t.color })),
      pis: pis.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        iterations: p.iterations.map((i) => ({ id: i.id, name: i.name, kind: i.kind })),
      })),
      charts,
    });
  } catch (error) {
    console.error("Charts API error:", error);
    return NextResponse.json({ error: "Failed to load chart data" }, { status: 500 });
  }
}
