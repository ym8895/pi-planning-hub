"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThumbsUp, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TeamConfidence {
  teamId: string;
  teamName: string;
  teamColor: string;
  voteCount: number;
  average: number;
  latestComment: string | null;
}

interface ConfidenceData {
  votes: any[];
  pi: { id: string; name: string; status: string } | null;
  teamConfidence: TeamConfidence[];
  overallAverage: number;
  totalVotes: number;
}

const scoreConfig: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "1 — Very Low", color: "text-red-400", bg: "bg-red-500/15" },
  2: { label: "2 — Low", color: "text-orange-400", bg: "bg-orange-500/15" },
  3: { label: "3 — Medium", color: "text-amber-400", bg: "bg-amber-500/15" },
  4: { label: "4 — High", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  5: { label: "5 — Very High", color: "text-green-400", bg: "bg-green-500/15" },
};

function getScoreInfo(score: number) {
  if (score <= 1.5) return scoreConfig[1];
  if (score <= 2.5) return scoreConfig[2];
  if (score <= 3.5) return scoreConfig[3];
  if (score <= 4.5) return scoreConfig[4];
  return scoreConfig[5];
}

function getTrendIcon(score: number) {
  if (score >= 4) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  if (score >= 3) return <Minus className="h-4 w-4 text-amber-400" />;
  return <TrendingDown className="h-4 w-4 text-red-400" />;
}

export default function ConfidencePage() {
  const [data, setData] = useState<ConfidenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/confidence")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">Loading confidence data...</div></AppShell>;
  }

  if (!data || !data.pi) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">No PI found</div></AppShell>;
  }

  const overallInfo = getScoreInfo(data.overallAverage);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Confidence Voting</h1>
          <p className="text-muted-foreground mt-1">{data.pi.name} — PI Confidence Assessment</p>
        </div>

        {/* Overall Confidence */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className={cn("rounded-2xl p-6", overallInfo.bg)}>
                <div className={cn("text-4xl font-bold", overallInfo.color)}>
                  {data.overallAverage}
                </div>
                <div className="text-xs text-muted-foreground mt-1">/5.0</div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Overall ART Confidence</h2>
                <p className={cn("text-sm font-medium mt-1", overallInfo.color)}>{overallInfo.label}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {data.totalVotes} votes across {data.teamConfidence.length} teams
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {getTrendIcon(data.overallAverage)}
                  <span className="text-xs text-muted-foreground">
                    {data.overallAverage >= 4 ? "Teams are confident in PI delivery" :
                     data.overallAverage >= 3 ? "Moderate confidence — some risks to monitor" :
                     "Low confidence — action needed to address blockers"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Confidence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {data.teamConfidence.map(tc => {
            const info = getScoreInfo(tc.average);
            return (
              <Card key={tc.teamId}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tc.teamColor }} />
                    <span className="font-medium text-sm">{tc.teamName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={cn("rounded-lg px-3 py-2", info.bg)}>
                      <span className={cn("text-2xl font-bold", info.color)}>{tc.average}</span>
                    </div>
                    {getTrendIcon(tc.average)}
                  </div>
                  <div className="text-xs text-muted-foreground">{tc.voteCount} vote(s)</div>
                  {tc.latestComment && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                      "{tc.latestComment}"
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Votes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">All Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.votes.map((vote) => {
                const info = getScoreInfo(vote.score);
                return (
                  <div key={vote.id} className="flex items-start gap-4 rounded-lg border border-zinc-800 p-4">
                    <div className={cn("rounded-lg px-2 py-1 text-sm font-bold shrink-0", info.bg, info.color)}>
                      {vote.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: vote.team.color }} />
                          {vote.team.name}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{vote.voter?.user?.name}</span>
                      </div>
                      {vote.comment && (
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{vote.comment}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-xs flex-wrap">
              <span className="font-medium text-muted-foreground">Scale:</span>
              {Object.entries(scoreConfig).map(([score, cfg]) => (
                <div key={score} className="flex items-center gap-1.5">
                  <span className={cn("h-3 w-3 rounded", cfg.bg)} />
                  <span>{cfg.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
