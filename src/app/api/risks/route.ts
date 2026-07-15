import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ risks: [], pi: null });

    const executingPI = await prisma.pI.findFirst({
      where: { artId: art.id, status: "EXECUTING" },
    });
    const planningPI = await prisma.pI.findFirst({
      where: { artId: art.id, status: "PLANNING" },
    });
    const pi = executingPI ?? planningPI;
    if (!pi) return NextResponse.json({ risks: [], pi: null });

    const risks = await prisma.risk.findMany({
      where: { piId: pi.id },
      include: { owner: { include: { user: true } }, team: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ risks, pi: { id: pi.id, name: pi.name, status: pi.status } });
  } catch (error) {
    console.error("Risks API error:", error);
    return NextResponse.json({ error: "Failed to load risks" }, { status: 500 });
  }
}
