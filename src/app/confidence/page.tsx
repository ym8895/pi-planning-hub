"use client";

import { useCachedApi } from "@/lib/use-cached-api";
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
  const { data, loading } = useCachedApi<ConfidenceData>("/api/confidence");

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
          <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
          <h1 className="text-lg md:text-2xl font-bold">Confidence Voting</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{data.pi.name} — PI Confidence Assessment</p>
        </div>

        {/* Overall Confidence */}
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center gap-3 md:gap-6">
              <div className={cn("rounded-xl md:rounded-2xl p-3 md:p-6", overallInfo.bg)}>
                <div className={cn("text-2xl md:text-4xl font-bold", overallInfo.color)}>
                  {data.overallAverage}
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-1">/5.0</div>
              </div>
              <div>
                <h2 className="text-sm md:text-lg font-semibold">Overall ART Confidence</h2>
                <p className={cn("text-[10px] md:text-sm font-medium mt-1", overallInfo.color)}>{overallInfo.label}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-2">
                  {data.totalVotes} votes across {data.teamConfidence.length} teams
                </p>
                <div className="flex items-center gap-1.5 md:gap-2 mt-2 md:mt-3">
                  {getTrendIcon(data.overallAverage)}
                  <span className="text-[10px] md:text-xs text-muted-foreground">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
          {data.teamConfidence.map(tc => {
            const info = getScoreInfo(tc.average);
            return (
              <Card key={tc.teamId}>
                <CardContent className="p-2 md:p-4 space-y-2 md:space-y-3">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="h-2 w-2 md:h-3 md:w-3 rounded-full" style={{ backgroundColor: tc.teamColor }} />
                    <span className="font-medium text-[10px] md:text-sm truncate">{tc.teamName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={cn("rounded-lg px-2 py-1 md:px-3 md:py-2", info.bg)}>
                      <span className={cn("text-lg md:text-2xl font-bold", info.color)}>{tc.average}</span>
                    </div>
                    {getTrendIcon(tc.average)}
                  </div>
                  <div className="text-[9px] md:text-xs text-muted-foreground">{tc.voteCount} vote(s)</div>
                  {tc.latestComment && (
                    <p className="text-[9px] md:text-[11px] text-zinc-400 leading-relaxed italic hidden md:block">
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
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm">All Votes</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-4">
            <div className="space-y-2 md:space-y-3">
              {data.votes.map((vote) => {
                const info = getScoreInfo(vote.score);
                return (
                  <div key={vote.id} className="flex items-start gap-2 md:gap-4 rounded-lg border border-zinc-800 p-2 md:p-4">
                    <div className={cn("rounded-lg px-1.5 py-1 md:px-2 md:py-1 text-[10px] md:text-sm font-bold shrink-0", info.bg, info.color)}>
                      {vote.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-sm font-medium">
                          <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full" style={{ backgroundColor: vote.team.color }} />
                          {vote.team.name}
                        </span>
                        <span className="text-[9px] md:text-xs text-muted-foreground">•</span>
                        <span className="text-[9px] md:text-xs text-muted-foreground">{vote.voter?.user?.name}</span>
                      </div>
                      {vote.comment && (
                        <p className="text-[9px] md:text-xs text-zinc-400 mt-1 md:mt-1.5 leading-relaxed hidden md:block">{vote.comment}</p>
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
          <CardContent className="p-2 md:p-4">
            <div className="flex items-center gap-2 md:gap-4 text-[9px] md:text-xs flex-wrap">
              <span className="font-medium text-muted-foreground">Scale:</span>
              {Object.entries(scoreConfig).map(([score, cfg]) => (
                <div key={score} className="flex items-center gap-1 md:gap-1.5">
                  <span className={cn("h-2 w-2 md:h-3 md:w-3 rounded", cfg.bg)} />
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
