import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json([]);

    const features = await prisma.feature.findMany({
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

    return NextResponse.json(features);
  } catch (error) {
    console.error("Features API error:", error);
    return NextResponse.json({ error: "Failed to load features" }, { status: 500 });
  }
}
