"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Zap, AlertTriangle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { CapacityForm } from "@/components/capacity-form";

interface CapacityData {
  id: string;
  utilization: number;
  overloaded: boolean;
  availableHours: number;
  plannedHours: number;
  plannedPoints: number;
  focusFactor: number;
  supportPercent: number;
  meetingsPercent: number;
  iterationId: string;
  iteration: { name: string };
}

interface Team {
  id: string;
  name: string;
  color: string;
  velocity: number;
  members: { id: string; user: { name: string } }[];
  capacities: CapacityData[];
  totalPoints: number;
  totalPlanned: number;
  avgUtil: number;
  overloaded: boolean;
}

interface PiData {
  pi: { name: string } | null;
  teams: Team[];
}

export default function CapacityPage() {
  const [data, setData] = useState<PiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCap, setSelectedCap] = useState<CapacityData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<{ name: string; color: string; velocity: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/capacity").then((r) => r.json());
      setData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const teams = data?.teams ?? [];
  const totalMembers = teams.reduce((s, t) => s + t.members.length, 0);
  const totalVelocity = teams.reduce((s, t) => s + t.velocity, 0);
  const overloadedCount = teams.filter((t) => t.overloaded).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Capacity Planning</h1>
          <p className="text-muted-foreground">{data?.pi?.name ?? "Loading..."} — Sprint-level allocation</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <p className="text-2xl font-bold mt-1">{totalMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Velocity</p>
              </div>
              <p className="text-2xl font-bold mt-1">{totalVelocity} pts/PI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Overloaded Teams</p>
              </div>
              <p className={cn("text-2xl font-bold mt-1", overloadedCount > 0 ? "text-red-500" : "")}>
                {overloadedCount}
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading capacity data...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">{team.velocity} pts/PI</Badge>
                    </div>
                    {team.overloaded && <Badge variant="destructive">Overloaded</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Members</p>
                      <p className="font-bold">{team.members.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Util</p>
                      <p className={cn("font-bold",
                        team.avgUtil > 1 ? "text-red-500" : team.avgUtil > 0.85 ? "text-amber-500" : "text-emerald-500"
                      )}>{Math.round(team.avgUtil * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Committed</p>
                      <p className="font-bold">{team.totalPoints} pts</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {team.capacities.map((cap) => {
                      const util = cap.availableHours > 0 ? cap.plannedHours / cap.availableHours : 0;
                      return (
                        <div
                          key={cap.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-900/50 hover:bg-zinc-900 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedCap(cap);
                            setSelectedTeam({ name: team.name, color: team.color, velocity: team.velocity });
                            setFormOpen(true);
                          }}
                        >
                          <span className="text-xs text-muted-foreground w-16">{cap.iteration.name}</span>
                          <Progress value={Math.min(util * 100, 100)} className="flex-1 h-2" />
                          <span className={cn("text-xs font-medium w-10 text-right",
                            util > 1 ? "text-red-500" : util > 0.85 ? "text-amber-500" : "text-emerald-500"
                          )}>{Math.round(util * 100)}%</span>
                          <span className="text-xs text-muted-foreground w-10 text-right">{cap.plannedPoints}pts</span>
                          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedCap && selectedTeam && (
          <CapacityForm
            open={formOpen}
            onClose={() => { setFormOpen(false); setSelectedCap(null); setSelectedTeam(null); }}
            capacity={selectedCap}
            teamName={selectedTeam.name}
            teamColor={selectedTeam.color}
            teamVelocity={selectedTeam.velocity}
            onSaved={fetchData}
          />
        )}
      </div>
    </AppShell>
  );
}
