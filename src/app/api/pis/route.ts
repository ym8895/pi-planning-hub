import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ art: null, pis: [] });

    const pis = await prisma.pI.findMany({
      where: { artId: art.id },
      orderBy: { startDate: "asc" },
      include: {
        iterations: { orderBy: { startDate: "asc" } },
        _count: { select: { iterations: true } },
      },
    });

    const pisWithStats = await Promise.all(
      pis.map(async (pi) => {
        const storyCount = await prisma.story.count({
          where: { iteration: { piId: pi.id } },
        });
        const doneCount = await prisma.story.count({
          where: { iteration: { piId: pi.id }, status: "DONE" },
        });
        const featureCount = await prisma.feature.count({
          where: { stories: { some: { iteration: { piId: pi.id } } } },
        });
        const objectiveCount = await prisma.objective.count({
          where: { piId: pi.id },
        });
        const riskCount = await prisma.risk.count({
          where: { piId: pi.id },
        });

        return {
          ...pi,
          stats: {
            stories: storyCount,
            doneStories: doneCount,
            features: featureCount,
            objectives: objectiveCount,
            risks: riskCount,
            iterations: pi._count.iterations,
          },
        };
      })
    );

    return NextResponse.json({ art, pis: pisWithStats });
  } catch (error) {
    console.error("PI Management API error:", error);
    return NextResponse.json({ error: "Failed to load PIs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startDate, endDate } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "name, startDate, endDate required" }, { status: 400 });
    }

    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ error: "No ART found" }, { status: 404 });

    const pi = await prisma.pI.create({
      data: {
        name,
        artId: art.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "PLANNING",
      },
    });

    // Create 5 sprints + IP
    const start = new Date(startDate);
    const sprints = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sprint 5", "IP"];
    for (let i = 0; i < sprints.length; i++) {
      const sprintStart = new Date(start.getTime() + i * 14 * 24 * 60 * 60 * 1000);
      const sprintEnd = new Date(sprintStart.getTime() + 13 * 24 * 60 * 60 * 1000);
      await prisma.iteration.create({
        data: {
          name: sprints[i],
          kind: i === 5 ? "IP" : "SPRINT",
          piId: pi.id,
          startDate: sprintStart,
          endDate: sprintEnd,
        },
      });
    }

    return NextResponse.json(pi);
  } catch (error) {
    console.error("PI create error:", error);
    return NextResponse.json({ error: "Failed to create PI" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const validStatuses = ["PLANNING", "EXECUTING", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const pi = await prisma.pI.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(pi);
  } catch (error) {
    console.error("PI update error:", error);
    return NextResponse.json({ error: "Failed to update PI" }, { status: 500 });
  }
}
