import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCached("features", async () => {
      const art = await prisma.aRT.findFirst();
      if (!art) return [];

      return prisma.feature.findMany({
        where: { artId: art.id },
        include: {
          ownerTeam: true,
          owner: true,
          stories: true,
          dependenciesAsFrom: true,
          dependenciesAsTo: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }, 300);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Features API error:", error);
    return NextResponse.json({ error: "Failed to load features" }, { status: 500 });
  }
}
