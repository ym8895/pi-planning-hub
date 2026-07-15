"use client";

import { useState } from "react";
import { useCachedApi } from "@/lib/use-cached-api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { updateTeam } from "@/server/actions";
import { Users, Zap, Pencil, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  role: string;
  user: { id: string; name: string; email: string; image: string | null };
}

interface Team {
  id: string;
  name: string;
  color: string;
  velocity: number;
  members: TeamMember[];
  stories: { id: string; status: string; storyPoints: number }[];
  features: { id: string; name: string; status: string }[];
  capacities: { id: string; utilization: number; overloaded: boolean; availableHours: number; plannedHours: number; iteration: { name: string } }[];
}

const roleColors: Record<string, string> = {
  SM: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  PO: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  PM: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  RTE: "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  DEV: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  QA: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  UX: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  ARCH: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function TeamsPage() {
  const { data: teamsData, loading, invalidate } = useCachedApi<Team[]>("/api/teams");
  const teams = teamsData ?? [];
  const [editOpen, setEditOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editVelocity, setEditVelocity] = useState(0);
  const [saving, setSaving] = useState(false);

  const openEdit = (team: Team) => {
    setEditTeam(team);
    setEditName(team.name);
    setEditColor(team.color);
    setEditVelocity(team.velocity);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editTeam) return;
    setSaving(true);
    try {
      await updateTeam(editTeam.id, { name: editName, color: editColor, velocity: editVelocity });
      invalidate();
      setEditOpen(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <AppShell>
      <div className="space-y-6">
          <div>
            <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
            <h1 className="text-lg md:text-2xl font-bold">Teams</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Team management and members</p>
          </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">No teams found</div>
          ) : (
            teams.map((team) => {
              const doneCount = team.stories.filter(s => s.status === "DONE").length;
              const totalPoints = team.stories.reduce((sum, s) => sum + s.storyPoints, 0);
              const latestCapacity = team.capacities[0];
              const utilization = latestCapacity && latestCapacity.availableHours > 0
                ? Math.round((latestCapacity.plannedHours / latestCapacity.availableHours) * 100)
                : 0;

              return (
                <Card key={team.id} className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: team.color }} />
                  <CardHeader className="pb-2 pt-3 md:pb-3 md:pt-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="h-2 w-2 md:h-3 md:w-3 rounded-full" style={{ backgroundColor: team.color }} />
                        <CardTitle className="text-sm md:text-lg">{team.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <Badge variant="outline" className="gap-1 text-[9px] md:text-[10px]">
                          <Zap className="h-3 w-3" />
                          {team.velocity} vel
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 md:h-7 md:w-7" onClick={() => openEdit(team)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4 p-2 md:p-4">
                    <div className="grid grid-cols-3 gap-1.5 md:gap-2 text-center text-[10px] md:text-sm">
                      <div className="rounded bg-zinc-800/50 p-1.5 md:p-2">
                        <p className="text-sm md:text-lg font-bold">{team.stories.length}</p>
                        <p className="text-[9px] md:text-xs text-muted-foreground">Stories</p>
                      </div>
                      <div className="rounded bg-zinc-800/50 p-1.5 md:p-2">
                        <p className="text-sm md:text-lg font-bold text-emerald-400">{doneCount}</p>
                        <p className="text-[9px] md:text-xs text-muted-foreground">Done</p>
                      </div>
                      <div className="rounded bg-zinc-800/50 p-1.5 md:p-2">
                        <p className="text-sm md:text-lg font-bold">{totalPoints}</p>
                        <p className="text-[9px] md:text-xs text-muted-foreground">Points</p>
                      </div>
                    </div>

                    {latestCapacity && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] md:text-sm">
                          <span className="text-muted-foreground">Utilization</span>
                          <span className={cn("font-medium", utilization > 100 ? "text-red-400" : utilization > 85 ? "text-amber-400" : "text-emerald-400")}>
                            {utilization}%
                          </span>
                        </div>
                        <div className="h-1 md:h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", utilization > 100 ? "bg-red-500" : utilization > 85 ? "bg-amber-500" : "bg-emerald-500")}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                        {latestCapacity.overloaded && (
                          <div className="flex items-center gap-1 text-[10px] md:text-xs text-red-400 mt-1">
                            <AlertTriangle className="h-3 w-3" /> Overloaded
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <p className="text-xs md:text-sm font-medium mb-2">Members ({team.members.length})</p>
                      <div className="space-y-1">
                        {team.members.map(m => (
                          <div key={m.id} className="flex items-center justify-between text-[10px] md:text-sm">
                            <span className="truncate">{m.user.name}</span>
                            <Badge className={cn("text-[9px] md:text-[10px]", roleColors[m.role] ?? "bg-zinc-500/15 text-zinc-400")}>
                              {m.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm font-medium">Features ({team.features.length})</p>
                        {team.features.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {team.features.filter(f => f.status === "DONE").length} done
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        {team.features.slice(0, 4).map(f => (
                          <div key={f.id} className="flex items-center justify-between text-[10px] md:text-sm">
                            <span className="truncate">{f.name}</span>
                            <Badge variant="outline" className="text-[9px] md:text-[10px]">{f.status.replace("_", " ")}</Badge>
                          </div>
                        ))}
                        {team.features.length > 4 && (
                          <p className="text-[9px] md:text-xs text-muted-foreground">+{team.features.length - 4} more</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <Dialog open={editOpen} onOpenChange={(v) => !v && setEditOpen(false)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      className={cn("h-7 w-7 rounded-full border-2 transition-all", editColor === c ? "border-white scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }}
                      onClick={() => setEditColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Velocity (pts/sprint)</Label>
                <Input type="number" min={0} value={editVelocity} onChange={(e) => setEditVelocity(Number(e.target.value))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
