"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from "recharts";

interface SprintData {
  piId: string;
  piName: string;
  iterationId: string;
  iterationName: string;
  kind: string;
  totalPoints: number;
  donePoints: number;
  committedPoints: number;
  storyCount: number;
  doneCount: number;
}

interface PiSummary {
  piId: string;
  piName: string;
  piStatus: string;
  totalCommitted: number;
  totalDone: number;
  predictability: number;
  avgVelocity: number;
  sprintCount: number;
}

interface TeamData {
  id: string;
  name: string;
  color: string;
  velocity: number;
  sprints: SprintData[];
  piSummaries: PiSummary[];
}

interface AnalyticsData {
  pis: { id: string; name: string; status: string }[];
  teams: TeamData[];
}

const teamColors = ["#6366f1", "#22c55e", "#eab308", "#3b82f6", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">Loading analytics...</div></AppShell>;
  }

  if (!data) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div></AppShell>;
  }

  // Build velocity chart data: one entry per sprint across PIs
  const piNames = [...new Set(data.teams.flatMap(t => t.piSummaries.map(p => p.piName)))];
  const velocityByPI = piNames.map((piName) => {
    const entry: Record<string, any> = { pi: piName };
    data.teams.forEach((team) => {
      const summary = team.piSummaries.find(p => p.piName === piName);
      entry[team.name] = summary?.avgVelocity ?? 0;
    });
    return entry;
  });

  // Predictability chart
  const predictabilityByPI = piNames.map((piName) => {
    const entry: Record<string, any> = { pi: piName };
    data.teams.forEach((team) => {
      const summary = team.piSummaries.find(p => p.piName === piName);
      entry[team.name] = summary?.predictability ?? 0;
    });
    return entry;
  });

  // Team velocity over sprints (latest PI)
  const latestPI = data.pis.filter(p => p.status !== "COMPLETED").pop() ?? data.pis[data.pis.length - 1];
  const sprintVelocityByTeam = data.teams.map((team) => {
    const piSprints = team.sprints.filter(s => s.piId === latestPI?.id);
    return {
      name: team.name,
      color: team.color,
      data: piSprints.map(s => ({
        sprint: s.iterationName,
        committed: s.committedPoints,
        done: s.donePoints,
      })),
    };
  });

  // Overall stats
  const totalCommitted = data.teams.reduce((s, t) => s + t.piSummaries.reduce((ps, p) => ps + p.totalCommitted, 0), 0);
  const totalDone = data.teams.reduce((s, t) => s + t.piSummaries.reduce((ps, p) => ps + p.totalDone, 0), 0);
  const avgPredictability = totalCommitted > 0 ? Math.round((totalDone / totalCommitted) * 100) : 0;
  const totalVelocity = data.teams.reduce((s, t) => s + t.velocity, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Velocity & Predictability</h1>
          <p className="text-muted-foreground">Team velocity trends and PI predictability metrics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">ART Velocity</p>
              </div>
              <p className="text-2xl font-bold mt-1">{totalVelocity} pts/PI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Avg Predictability</p>
              </div>
              <p className={cn("text-2xl font-bold mt-1",
                avgPredictability >= 80 ? "text-emerald-500" : avgPredictability >= 60 ? "text-amber-500" : "text-red-500"
              )}>{avgPredictability}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Committed</p>
              </div>
              <p className="text-2xl font-bold mt-1">{totalCommitted} pts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Delivered</p>
              </div>
              <p className="text-2xl font-bold mt-1 text-emerald-500">{totalDone} pts</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Velocity by PI */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Velocity by Team (per PI)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={velocityByPI}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="pi" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {data.teams.map((team, i) => (
                  <Bar key={team.id} dataKey={team.name} fill={teamColors[i % teamColors.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Predictability by PI */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Predictability % by Team (Done / Committed)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={predictabilityByPI}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="pi" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 120]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }}
                  labelStyle={{ color: "#e2e8f0" }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {data.teams.map((team, i) => (
                  <Bar key={team.id} dataKey={team.name} fill={teamColors[i % teamColors.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sprint Velocity Trend (Latest PI) */}
        <div className="grid gap-4 md:grid-cols-2">
          {sprintVelocityByTeam.map((team) => (
            <Card key={team.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                  <CardTitle className="text-sm">{team.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={team.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="sprint" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Line type="monotone" dataKey="committed" stroke="#f97316" strokeWidth={2} name="Committed" dot={false} />
                    <Line type="monotone" dataKey="done" stroke="#22c55e" strokeWidth={2} name="Done" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team PI Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">PI Summary by Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Team</th>
                    {data.pis.map(pi => (
                      <th key={pi.id} className="text-center py-2 px-3 text-muted-foreground font-medium">{pi.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.teams.map(team => (
                    <tr key={team.id} className="border-b border-zinc-800/50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: team.color }} />
                          {team.name}
                        </div>
                      </td>
                      {data.pis.map(pi => {
                        const summary = team.piSummaries.find(p => p.piId === pi.id);
                        return (
                          <td key={pi.id} className="text-center py-2 px-3">
                            {summary ? (
                              <div className="space-y-0.5">
                                <div className="font-medium">{summary.avgVelocity} pts/sprint</div>
                                <div className={cn("text-[10px]",
                                  summary.predictability >= 80 ? "text-emerald-400" :
                                  summary.predictability >= 60 ? "text-amber-400" : "text-red-400"
                                )}>{summary.predictability}%</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
