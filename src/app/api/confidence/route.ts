import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const art = await prisma.aRT.findFirst();
    if (!art) return NextResponse.json({ votes: [], pi: null, teams: [] });

    const executingPI = await prisma.pI.findFirst({
      where: { artId: art.id, status: "EXECUTING" },
    });
    const planningPI = await prisma.pI.findFirst({
      where: { artId: art.id, status: "PLANNING" },
    });
    const pi = executingPI ?? planningPI;
    if (!pi) return NextResponse.json({ votes: [], pi: null, teams: [] });

    const teams = await prisma.team.findMany({
      where: { artId: art.id },
      orderBy: { name: "asc" },
    });

    const votes = await prisma.confidenceVote.findMany({
      where: { piId: pi.id },
      include: { team: true, voter: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average confidence per team
    const teamConfidence = teams.map(t => {
      const teamVotes = votes.filter(v => v.teamId === t.id);
      const avg = teamVotes.length > 0 ? teamVotes.reduce((s, v) => s + v.score, 0) / teamVotes.length : 0;
      return {
        teamId: t.id,
        teamName: t.name,
        teamColor: t.color,
        voteCount: teamVotes.length,
        average: Math.round(avg * 10) / 10,
        latestComment: teamVotes[0]?.comment ?? null,
      };
    });

    const overallAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.score, 0) / votes.length : 0;

    return NextResponse.json({
      votes,
      pi: { id: pi.id, name: pi.name, status: pi.status },
      teamConfidence,
      overallAverage: Math.round(overallAvg * 10) / 10,
      totalVotes: votes.length,
    });
  } catch (error) {
    console.error("Confidence API error:", error);
    return NextResponse.json({ error: "Failed to load confidence data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { piId, teamId, score, comment, voterId } = body;

    const vote = await prisma.confidenceVote.create({
      data: { piId, teamId, score, comment, voterId },
      include: { team: true },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error("Confidence vote error:", error);
    return NextResponse.json({ error: "Failed to save vote" }, { status: 500 });
  }
}
