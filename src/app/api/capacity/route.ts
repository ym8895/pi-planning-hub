import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

let cached: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 300_000;

export async function GET() {
  try {
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

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
      select: {
        id: true,
        name: true,
        color: true,
        velocity: true,
        members: { select: { id: true, user: { select: { name: true } } } },
        capacities: {
          where: { iteration: { piId: pi.id } },
          select: {
            id: true, utilization: true, overloaded: true,
            availableHours: true, plannedHours: true, plannedPoints: true,
            focusFactor: true, supportPercent: true, meetingsPercent: true,
            iterationId: true,
            iteration: { select: { name: true } },
          },
          orderBy: { iteration: { startDate: "asc" } },
        },
      },
      orderBy: { name: "asc" },
    });

    const storyAgg = await prisma.story.groupBy({
      by: ["teamId"],
      where: { feature: { status: { in: ["PLANNED", "IN_PROGRESS"] } }, iteration: { piId: pi.id } },
      _sum: { storyPoints: true },
    });
    const pointsMap = new Map(storyAgg.map((r) => [r.teamId, r._sum.storyPoints ?? 0]));

    const teamsWithMetrics = teams.map((t) => {
      const totalPoints = pointsMap.get(t.id) ?? 0;
      const totalPlanned = t.capacities.reduce((s, c) => s + c.plannedPoints, 0);
      const avgUtil = t.capacities.length > 0
        ? t.capacities.reduce((s, c) => s + (c.availableHours > 0 ? c.plannedHours / c.availableHours : 0), 0) / t.capacities.length
        : 0;

      return {
        ...t,
        totalPoints,
        totalPlanned,
        avgUtil,
        overloaded: t.capacities.some((c) => c.overloaded),
      };
    });

    const result = { pi, teams: teamsWithMetrics };
    cached = { data: result, ts: Date.now() };
    return NextResponse.json(result);
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

    const recalc = await prisma.capacity.findUnique({ where: { id } });
    if (recalc && recalc.availableHours > 0) {
      const newUtil = recalc.plannedHours / recalc.availableHours;
      await prisma.capacity.update({
        where: { id },
        data: { utilization: newUtil * 100, overloaded: newUtil > 1 },
      });
    }

    return NextResponse.json({ ...updated, ...recalc });
  } catch (error) {
    console.error("Capacity PATCH error:", error);
    return NextResponse.json({ error: "Failed to update capacity" }, { status: 500 });
  }
}
