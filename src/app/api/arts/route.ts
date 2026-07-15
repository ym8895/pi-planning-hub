import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCached("arts", async () => {
      const art = await prisma.aRT.findFirst({
        include: {
          organization: true,
          _count: { select: { teams: true, pis: true } },
        },
      });

      if (!art) return { art: null, arts: [] };

      const arts = await prisma.aRT.findMany({
        include: {
          organization: true,
          teams: { select: { id: true, name: true, color: true, velocity: true } },
          _count: { select: { teams: true, pis: true } },
        },
        orderBy: { name: "asc" },
      });

      return { art, arts };
    }, 300);

    return NextResponse.json(data);
  } catch (error) {
    console.error("ART API error:", error);
    return NextResponse.json({ error: "Failed to load ARTs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, organizationId } = body;

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const org = organizationId
      ? { connect: { id: organizationId } }
      : (await prisma.organization.findFirst()) ? { connect: { id: (await prisma.organization.findFirst())!.id } } : null;

    if (!org) return NextResponse.json({ error: "No organization found" }, { status: 404 });

    const art = await prisma.aRT.create({
      data: {
        name,
        description: description || null,
        organization: org,
      },
    });

    return NextResponse.json(art);
  } catch (error) {
    console.error("ART create error:", error);
    return NextResponse.json({ error: "Failed to create ART" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const data: Record<string, string | null> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;

    const art = await prisma.aRT.update({ where: { id }, data });
    return NextResponse.json(art);
  } catch (error) {
    console.error("ART update error:", error);
    return NextResponse.json({ error: "Failed to update ART" }, { status: 500 });
  }
}
