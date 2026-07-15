"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Flame, Layers, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area,
} from "recharts";

interface Team {
  id: string;
  name: string;
  color: string;
}

interface Pi {
  id: string;
  name: string;
  status: string;
  iterations: { id: string; name: string; kind: string }[];
}

interface ChartsData {
  teams: Team[];
  pis: Pi[];
  charts: {
    velocity: Record<string, any>[];
    burndown: Record<string, any>[];
    burnup: Record<string, any>[];
    cumulativeFlow: Record<string, any>[];
    predictability: Record<string, any>[];
  };
}

const teamColors = ["#6366f1", "#22c55e", "#eab308", "#3b82f6", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6"];

const chartTypes = [
  { id: "velocity", label: "Velocity", icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
  { id: "burndown", label: "Burndown", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  { id: "burnup", label: "Burnup", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { id: "cumulative", label: "Cumulative Flow", icon: Layers, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  { id: "predictability", label: "Predictability", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
];

export default function ChartsPage() {
  const [data, setData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPi, setSelectedPi] = useState<string>("all");
  const [selectedSprint, setSelectedSprint] = useState<string>("all");
  const [activeChart, setActiveChart] = useState<string>("velocity");

  useEffect(() => {
    fetch("/api/charts")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">Loading charts...</div></AppShell>;
  }

  if (!data) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div></AppShell>;
  }

  // Get available sprints based on selected PI
  const availableSprints = selectedPi === "all"
    ? data.pis.flatMap((p) => p.iterations.filter((i) => i.kind !== "IP"))
    : data.pis.find((p) => p.id === selectedPi)?.iterations.filter((i) => i.kind !== "IP") ?? [];

  // Filter velocity data
  const filteredVelocity = data.charts.velocity.filter((entry) => {
    if (selectedPi !== "all") {
      const pi = data.pis.find((p) => p.id === selectedPi);
      if (pi && entry.pi !== pi.name) return false;
    }
    if (selectedSprint !== "all") {
      if (entry.sprintId !== selectedSprint) return false;
    }
    return true;
  });

  // Get selected team names for chart series
  const selectedTeamNames = selectedTeam === "all"
    ? data.teams.map((t) => t.name)
    : [data.teams.find((t) => t.id === selectedTeam)?.name ?? ""];

  // Filter burndown data
  const filteredBurndown = data.charts.burndown.filter((entry) => {
    if (selectedSprint !== "all") {
      const sprint = availableSprints.find((s) => s.id === selectedSprint);
      if (sprint && entry.sprint !== sprint.name) return false;
    }
    return true;
  });

  // Filter burnup data
  const filteredBurnup = data.charts.burnup.filter((entry) => {
    if (selectedSprint !== "all") {
      const sprint = availableSprints.find((s) => s.id === selectedSprint);
      if (sprint && entry.sprint !== sprint.name) return false;
    }
    return true;
  });

  // Get unique sprints from burndown data for multi-sprint view
  const burndownSprints = [...new Set(filteredBurndown.map((d) => d.sprint))];
  const burnupSprints = [...new Set(filteredBurnup.map((d) => d.sprint))];

  // Filter predictability
  const filteredPredictability = data.charts.predictability.filter((entry) => {
    if (selectedPi !== "all") {
      const pi = data.pis.find((p) => p.id === selectedPi);
      if (pi && entry.pi !== pi.name) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Charts & Analytics</h1>
          <p className="text-muted-foreground">Select a chart type and filter by team, PI, or sprint</p>
        </div>

        {/* Chart Selector Cards */}
        <div className="grid grid-cols-5 gap-3">
          {chartTypes.map((chart) => {
            const Icon = chart.icon;
            const isActive = activeChart === chart.id;
            return (
              <button
                key={chart.id}
                onClick={() => setActiveChart(chart.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                  isActive
                    ? `${chart.bg} ${chart.border} border`
                    : "bg-white/[.02] border-white/5 hover:bg-white/[.04]"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? chart.color : "text-muted-foreground")} />
                <span className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {chart.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Team:</span>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {data.teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">PI:</span>
            <Select value={selectedPi} onValueChange={(v) => { setSelectedPi(v); setSelectedSprint("all"); }}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PIs</SelectItem>
                {data.pis.map((pi) => (
                  <SelectItem key={pi.id} value={pi.id}>{pi.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sprint:</span>
            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sprints</SelectItem>
                {availableSprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {chartTypes.find((c) => c.id === activeChart) && (() => {
                const Icon = chartTypes.find((c) => c.id === activeChart)!.icon;
                return <Icon className={cn("h-4 w-4", chartTypes.find((c) => c.id === activeChart)!.color)} />;
              })()}
              <CardTitle className="text-sm">{chartTypes.find((c) => c.id === activeChart)?.label}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Velocity */}
            {activeChart === "velocity" && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={filteredVelocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="sprint" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: "15px" }} />
                  {selectedTeamNames.map((name, i) => (
                    <Bar key={name} dataKey={name} fill={teamColors[i % teamColors.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Burndown */}
            {activeChart === "burndown" && (
              burndownSprints.length > 1 ? (
                <div className="space-y-4">
                  {burndownSprints.map((sprintName) => {
                    const sprintData = filteredBurndown.filter((d) => d.sprint === sprintName);
                    return (
                      <div key={sprintName}>
                        <p className="text-xs text-muted-foreground mb-2">{sprintName}</p>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={sprintData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                            <YAxis label={{ value: "Work Remaining", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
                              labelStyle={{ color: "#e2e8f0" }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: "10px" }} />
                            <Line type="monotone" dataKey="ideal" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" name="Ideal" dot={false} />
                            <Line type="monotone" dataKey="estimated" stroke="#3b82f6" strokeWidth={2} name="Estimated" dot={false} />
                            <Line type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={2.5} name="Actual" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={filteredBurndown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} label={{ value: "Date", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis label={{ value: "Work Remaining", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: "15px" }} />
                    <Line type="monotone" dataKey="ideal" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" name="Ideal" dot={false} />
                    <Line type="monotone" dataKey="estimated" stroke="#3b82f6" strokeWidth={2} name="Estimated" dot={false} />
                    <Line type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={2.5} name="Actual" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )
            )}

            {/* Burnup */}
            {activeChart === "burnup" && (
              burnupSprints.length > 1 ? (
                <div className="space-y-4">
                  {burnupSprints.map((sprintName) => {
                    const sprintData = filteredBurnup.filter((d) => d.sprint === sprintName);
                    return (
                      <div key={sprintName}>
                        <p className="text-xs text-muted-foreground mb-2">{sprintName}</p>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={sprintData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                            <YAxis label={{ value: "Story Points", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
                              labelStyle={{ color: "#e2e8f0" }}
                            />
                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: "10px" }} />
                            <Line type="monotone" dataKey="scope" stroke="#eab308" strokeWidth={2} name="Scope" dot={false} />
                            <Line type="monotone" dataKey="done" stroke="#22c55e" strokeWidth={2} name="Done" dot={false} />
                            <Line type="monotone" dataKey="todo" stroke="#ef4444" strokeWidth={2} name="To Do" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={filteredBurnup}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} label={{ value: "Date", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis label={{ value: "Story Points", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: "15px" }} />
                    <Line type="monotone" dataKey="scope" stroke="#eab308" strokeWidth={2.5} name="Scope" dot={false} />
                    <Line type="monotone" dataKey="done" stroke="#22c55e" strokeWidth={2.5} name="Done" dot={false} />
                    <Line type="monotone" dataKey="todo" stroke="#ef4444" strokeWidth={2} name="To Do" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )
            )}

            {/* Cumulative Flow */}
            {activeChart === "cumulative" && (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data.charts.cumulativeFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: "15px" }} />
                  <Area type="monotone" dataKey="Done" stackId="1" stroke="#22c55e" fill="#22c55e33" />
                  <Area type="monotone" dataKey="InProgress" stackId="1" stroke="#f97316" fill="#f9731633" />
                  <Area type="monotone" dataKey="Todo" stackId="1" stroke="#6b7280" fill="#6b728033" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Predictability */}
            {activeChart === "predictability" && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={filteredPredictability}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="pi" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[0, 120]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: "15px" }} />
                  {selectedTeamNames.map((name, i) => (
                    <Bar key={name} dataKey={name} fill={teamColors[i % teamColors.length]} radius={[4, 4, 0, 0]} />
                  ))}
                  <Line type="monotone" dataKey={() => 80} stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" name="Target 80%" dot={false} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
