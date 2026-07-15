import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCached("teams", async () => {
      const art = await prisma.aRT.findFirst();
      if (!art) return [];

      return prisma.team.findMany({
        where: { artId: art.id },
        include: {
          members: { include: { user: true } },
          stories: true,
          features: true,
          capacities: { include: { iteration: true } },
        },
      });
    }, 30);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Teams API error:", error);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}
