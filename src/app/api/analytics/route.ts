import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ teams: [], pis: [] });

    const pis = await prisma.pI.findMany({
      where: { artId: art.id },
      orderBy: { startDate: "asc" },
      include: {
        iterations: { orderBy: { startDate: "asc" } },
      },
    });

    const teams = await prisma.team.findMany({
      where: { artId: art.id },
      orderBy: { name: "asc" },
    });

    const teamVelocityData = await Promise.all(
      teams.map(async (team) => {
        const sprintData = await Promise.all(
          pis.flatMap((pi) =>
            pi.iterations.map(async (iter) => {
              const stories = await prisma.story.findMany({
                where: {
                  teamId: team.id,
                  iterationId: iter.id,
                },
              });
              const totalPoints = stories.reduce((s, st) => s + (st.storyPoints || 0), 0);
              const donePoints = stories
                .filter((st) => st.status === "DONE")
                .reduce((s, st) => s + (st.storyPoints || 0), 0);
              const committedPoints = totalPoints;

              return {
                piId: pi.id,
                piName: pi.name,
                iterationId: iter.id,
                iterationName: iter.name,
                kind: iter.kind,
                totalPoints,
                donePoints,
                committedPoints,
                storyCount: stories.length,
                doneCount: stories.filter((st) => st.status === "DONE").length,
              };
            })
          )
        );

        // Calculate predictability (done / committed) per PI
        const piSummaries = pis.map((pi) => {
          const piSprints = sprintData.filter((s) => s.piId === pi.id && s.kind !== "IP");
          const ipSprint = sprintData.find((s) => s.piId === pi.id && s.kind === "IP");
          const allSprints = [...piSprints, ...(ipSprint ? [ipSprint] : [])];

          const totalCommitted = allSprints.reduce((s, sp) => s + sp.committedPoints, 0);
          const totalDone = allSprints.reduce((s, sp) => s + sp.donePoints, 0);
          const avgVelocity = piSprints.length > 0
            ? piSprints.reduce((s, sp) => s + sp.donePoints, 0) / piSprints.length
            : 0;

          return {
            piId: pi.id,
            piName: pi.name,
            piStatus: pi.status,
            totalCommitted,
            totalDone,
            predictability: totalCommitted > 0 ? Math.round((totalDone / totalCommitted) * 100) : 0,
            avgVelocity: Math.round(avgVelocity),
            sprintCount: piSprints.length,
          };
        });

        const teamSprints = sprintData.filter((s) => s.kind !== "IP");

        return {
          id: team.id,
          name: team.name,
          color: team.color,
          velocity: team.velocity,
          sprints: teamSprints,
          piSummaries,
        };
      })
    );

    return NextResponse.json({
      pis: pis.map((p) => ({ id: p.id, name: p.name, status: p.status })),
      teams: teamVelocityData,
    });
  } catch (error) {
    console.error("Velocity API error:", error);
    return NextResponse.json({ error: "Failed to load velocity data" }, { status: 500 });
  }
}
