import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ pi: null, teams: [] });

    const pi = await prisma.pI.findFirst({
      where: { artId: art.id, status: "EXECUTING" },
    }) ?? await prisma.pI.findFirst({
      where: { artId: art.id, status: "PLANNING" },
    }) ?? await prisma.pI.findFirst({
      where: { artId: art.id },
      orderBy: { startDate: "desc" },
    });

    if (!pi) return NextResponse.json({ pi: null, teams: [] });

    const teams = await prisma.team.findMany({
      include: {
        members: { include: { user: true } },
        capacities: {
          where: { iteration: { piId: pi.id } },
          include: { iteration: true },
          orderBy: { iteration: { startDate: "asc" } },
        },
        features: {
          where: { status: { in: ["PLANNED", "IN_PROGRESS"] } },
          include: {
            stories: {
              where: { iteration: { piId: pi.id } },
              select: { storyPoints: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const teamsWithMetrics = teams.map((t) => {
      const totalPoints = t.features.reduce(
        (sum, f) => sum + f.stories.reduce((s, st) => s + (st.storyPoints || 0), 0),
        0
      );
      const totalPlanned = t.capacities.reduce((s, c) => s + c.plannedPoints, 0);
      const avgUtil = t.capacities.length > 0
        ? t.capacities.reduce((s, c) => s + c.utilization, 0) / t.capacities.length
        : 0;

      return {
        ...t,
        totalPoints,
        totalPlanned,
        avgUtil,
        overloaded: t.capacities.some((c) => c.overloaded),
      };
    });

    return NextResponse.json({ pi, teams: teamsWithMetrics });
  } catch (error) {
    console.error("Capacity API error:", error);
    return NextResponse.json({ error: "Failed to load capacity" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, plannedPoints, plannedHours, focusFactor, supportPercent, meetingsPercent } = body;

    if (!id) return NextResponse.json({ error: "Capacity ID required" }, { status: 400 });

    const data: Record<string, number> = {};
    if (plannedPoints !== undefined) data.plannedPoints = plannedPoints;
    if (plannedHours !== undefined) data.plannedHours = plannedHours;
    if (focusFactor !== undefined) data.focusFactor = focusFactor;
    if (supportPercent !== undefined) data.supportPercent = supportPercent;
    if (meetingsPercent !== undefined) data.meetingsPercent = meetingsPercent;

    const cap = await prisma.capacity.findUnique({
      where: { id },
      include: { team: true, iteration: true },
    });
    if (!cap) return NextResponse.json({ error: "Capacity not found" }, { status: 404 });

    const updated = await prisma.capacity.update({ where: { id }, data });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Capacity PATCH error:", error);
    return NextResponse.json({ error: "Failed to update capacity" }, { status: 500 });
  }
}
