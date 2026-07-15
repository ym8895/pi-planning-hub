import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamFilter = searchParams.get("teamId");
    const piFilter = searchParams.get("piId");

    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ pi: null, allPIs: [], teams: [], stories: [], dependencies: [] });

    const allPIs = await prisma.pI.findMany({
      where: { artId: art.id },
      orderBy: { startDate: "asc" },
      select: { id: true, name: true, status: true },
    });

    const executingPI = await prisma.pI.findFirst({
      where: { artId: art.id, status: "EXECUTING" },
      include: { iterations: { orderBy: { startDate: "asc" } } },
    });
    const planningPI = await prisma.pI.findFirst({
      where: { artId: art.id, status: "PLANNING" },
      include: { iterations: { orderBy: { startDate: "asc" } } },
    });
    let pi = executingPI ?? planningPI;
    if (piFilter) {
      const filtered = await prisma.pI.findFirst({
        where: { id: piFilter },
        include: { iterations: { orderBy: { startDate: "asc" } } },
      });
      if (filtered) pi = filtered;
    }

    const teamWhere: any = { artId: art.id };
    if (teamFilter) teamWhere.id = teamFilter;

    const teams = await prisma.team.findMany({
      where: teamWhere,
      include: {
        stories: {
          where: pi ? { iteration: { piId: pi.id } } : undefined,
          include: { iteration: true, feature: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const storyWhere: any = { feature: { artId: art.id } };
    if (pi) storyWhere.iteration = { piId: pi.id };
    if (teamFilter) storyWhere.teamId = teamFilter;

    const stories = await prisma.story.findMany({
      where: storyWhere,
      include: { team: true, iteration: true, feature: true },
    });

    const storyIds = stories.map(s => s.id);
    const dependencies = await prisma.dependency.findMany({
      where: {
        OR: [
          { fromStoryId: { in: storyIds } },
          { toStoryId: { in: storyIds } },
        ],
      },
      include: {
        fromStory: { include: { team: true } },
        toStory: { include: { team: true } },
      },
    });

    return NextResponse.json({ pi, allPIs, teams, stories, dependencies });
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
