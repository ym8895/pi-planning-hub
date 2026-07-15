import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ pi: null, objectives: [] });

    const pi = await prisma.pI.findFirst({
      where: { artId: art.id, status: "EXECUTING" },
      include: { iterations: true },
    }) ?? await prisma.pI.findFirst({
      where: { artId: art.id, status: "PLANNING" },
      include: { iterations: true },
    }) ?? await prisma.pI.findFirst({
      where: { artId: art.id },
      orderBy: { startDate: "desc" },
      include: { iterations: true },
    });

    if (!pi) return NextResponse.json({ pi: null, objectives: [] });

    const objectives = await prisma.objective.findMany({
      where: { piId: pi.id },
      include: { pi: true },
    });

    return NextResponse.json({ pi, objectives });
  } catch (error) {
    console.error("Objectives API error:", error);
    return NextResponse.json({ error: "Failed to load objectives" }, { status: 500 });
  }
}
