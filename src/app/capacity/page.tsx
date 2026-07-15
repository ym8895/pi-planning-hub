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
          <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
          <h1 className="text-lg md:text-2xl font-bold">Capacity Planning</h1>
          <p className="text-xs md:text-sm text-muted-foreground">{data?.pi?.name ?? "Loading..."} — Sprint-level allocation</p>
        </div>

        <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <p className="text-[10px] md:text-sm text-muted-foreground">Total Members</p>
              </div>
              <p className="text-lg md:text-2xl font-bold mt-1">{totalMembers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Zap className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <p className="text-[10px] md:text-sm text-muted-foreground">Total Velocity</p>
              </div>
              <p className="text-lg md:text-2xl font-bold mt-1">{totalVelocity} pts/PI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                <p className="text-[10px] md:text-sm text-muted-foreground">Overloaded Teams</p>
              </div>
              <p className={cn("text-lg md:text-2xl font-bold mt-1", overloadedCount > 0 ? "text-red-500" : "")}>
                {overloadedCount}
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-6 md:py-12 text-[10px] md:text-xs text-muted-foreground">Loading capacity data...</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className="h-2 w-2 md:h-3 md:w-3 rounded-full" style={{ backgroundColor: team.color }} />
                      <CardTitle className="text-sm md:text-lg">{team.name}</CardTitle>
                      <Badge variant="outline" className="text-[9px] md:text-xs">{team.velocity} pts/PI</Badge>
                    </div>
                    {team.overloaded && <Badge variant="destructive" className="text-[8px] md:text-[10px]">Overloaded</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3 p-2 md:p-4">
                  <div className="grid grid-cols-3 gap-1.5 md:gap-2 text-[10px] md:text-sm">
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

                  <div className="space-y-1 md:space-y-1.5">
                    {team.capacities.map((cap) => {
                      const util = cap.availableHours > 0 ? cap.plannedHours / cap.availableHours : 0;
                      return (
                        <div
                          key={cap.id}
                          className="flex items-center gap-1.5 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-md bg-zinc-900/50 hover:bg-zinc-900 transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedCap(cap);
                            setSelectedTeam({ name: team.name, color: team.color, velocity: team.velocity });
                            setFormOpen(true);
                          }}
                        >
                          <span className="text-[9px] md:text-xs text-muted-foreground w-12 md:w-16 truncate">{cap.iteration.name}</span>
                          <Progress value={Math.min(util * 100, 100)} className="flex-1 h-1.5 md:h-2" />
                          <span className={cn("text-[9px] md:text-xs font-medium w-8 md:w-10 text-right",
                            util > 1 ? "text-red-500" : util > 0.85 ? "text-amber-500" : "text-emerald-500"
                          )}>{Math.round(util * 100)}%</span>
                          <span className="text-[9px] md:text-xs text-muted-foreground w-8 md:w-10 text-right">{cap.plannedPoints}pts</span>
                          <Pencil className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
