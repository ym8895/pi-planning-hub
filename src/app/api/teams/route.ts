import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json([]);

    const teams = await prisma.team.findMany({
      where: { artId: art.id },
      include: {
        members: { include: { user: true } },
        stories: true,
        features: true,
        capacities: { include: { iteration: true } },
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Teams API error:", error);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}
