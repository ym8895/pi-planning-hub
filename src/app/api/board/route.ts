import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

let cached: { data: unknown; ts: number; key: string } | null = null;
const CACHE_TTL = 15_000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamFilter = searchParams.get("teamId");
    const piFilter = searchParams.get("piId");
    const cacheKey = `board:${teamFilter || ""}:${piFilter || ""}`;

    if (cached && cached.key === cacheKey && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ pi: null, allPIs: [], teams: [], stories: [], dependencies: [] });

    const allPIs = await prisma.pI.findMany({
      where: { artId: art.id },
      orderBy: { startDate: "asc" },
      select: { id: true, name: true, status: true },
    });

    const executingPI = await prisma.pI.findFirst({
      where: { artId: art.id, status: "EXECUTING" },
      select: { id: true, name: true, status: true, startDate: true, endDate: true, iterations: { select: { id: true, name: true, startDate: true, endDate: true }, orderBy: { startDate: "asc" } } },
    });
    const planningPI = await prisma.pI.findFirst({
      where: { artId: art.id, status: "PLANNING" },
      select: { id: true, name: true, status: true, startDate: true, endDate: true, iterations: { select: { id: true, name: true, startDate: true, endDate: true }, orderBy: { startDate: "asc" } } },
    });
    let pi = executingPI ?? planningPI;
    if (piFilter) {
      const filtered = await prisma.pI.findFirst({
        where: { id: piFilter },
        select: { id: true, name: true, status: true, startDate: true, endDate: true, iterations: { select: { id: true, name: true, startDate: true, endDate: true }, orderBy: { startDate: "asc" } } },
      });
      if (filtered) pi = filtered;
    }

    const teamWhere: any = { artId: art.id };
    if (teamFilter) teamWhere.id = teamFilter;

    const teams = await prisma.team.findMany({
      where: teamWhere,
      select: {
        id: true, name: true, color: true, velocity: true,
        stories: {
          where: pi ? { iteration: { piId: pi.id } } : undefined,
          select: { id: true, name: true, status: true, storyPoints: true, teamId: true, iterationId: true, featureId: true,
            iteration: { select: { id: true, name: true } },
            feature: { select: { id: true, name: true, featureType: true, status: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const storyWhere: any = { feature: { artId: art.id } };
    if (pi) storyWhere.iteration = { piId: pi.id };
    if (teamFilter) storyWhere.teamId = teamFilter;

    const stories = await prisma.story.findMany({
      where: storyWhere,
      select: { id: true, name: true, status: true, storyPoints: true, teamId: true, iterationId: true, featureId: true,
        team: { select: { id: true, name: true, color: true } },
        iteration: { select: { id: true, name: true } },
        feature: { select: { id: true, name: true, featureType: true, status: true } },
      },
    });

    const storyIds = stories.map(s => s.id);
    const dependencies = storyIds.length > 0 ? await prisma.dependency.findMany({
      where: {
        OR: [
          { fromStoryId: { in: storyIds } },
          { toStoryId: { in: storyIds } },
        ],
      },
      select: {
        id: true, type: true, status: true, description: true, fromStoryId: true, toStoryId: true,
        fromStory: { select: { id: true, name: true, team: { select: { id: true, name: true, color: true } } } },
        toStory: { select: { id: true, name: true, team: { select: { id: true, name: true, color: true } } } },
      },
    }) : [];

    const result = { pi, allPIs, teams, stories, dependencies };
    cached = { data: result, ts: Date.now(), key: cacheKey };
    return NextResponse.json(result);
  } catch (error) {
    console.error("Board API error:", error);
    return NextResponse.json({ error: "Failed to load board" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { storyId, teamId, iterationId } = body;

    if (!storyId) {
      return NextResponse.json({ error: "storyId is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (teamId !== undefined) updateData.teamId = teamId || null;
    if (iterationId !== undefined) updateData.iterationId = iterationId || null;

    const story = await prisma.story.update({
      where: { id: storyId },
      data: updateData,
      include: { team: true, iteration: true, feature: true },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Board PATCH error:", error);
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
  }
}
