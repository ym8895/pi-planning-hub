import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json([]);

    const dependencies = await prisma.dependency.findMany({
      where: {
        OR: [
          { fromFeature: { artId: art.id } },
          { toFeature: { artId: art.id } },
          { fromStory: { feature: { artId: art.id } } },
          { toStory: { feature: { artId: art.id } } },
        ],
      },
      include: {
        fromFeature: true,
        toFeature: true,
        fromStory: { include: { team: true } },
        toStory: { include: { team: true } },
      },
    });

    return NextResponse.json(dependencies);
  } catch (error) {
    console.error("Dependencies API error:", error);
    return NextResponse.json({ error: "Failed to load dependencies" }, { status: 500 });
  }
}
