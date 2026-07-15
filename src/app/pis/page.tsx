"use client";

import { useState } from "react";
import { useCachedApi } from "@/lib/use-cached-api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, CheckCircle2, Clock, Archive, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface PIStats {
  stories: number;
  doneStories: number;
  features: number;
  objectives: number;
  risks: number;
  iterations: number;
}

interface PI {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  stats: PIStats;
  iterations: { id: string; name: string; kind: string; startDate: string; endDate: string }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PLANNING: { label: "Planning", color: "bg-blue-500/15 text-blue-400", icon: Clock },
  EXECUTING: { label: "Executing", color: "bg-amber-500/15 text-amber-400", icon: Play },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
};

export default function PIManagementPage() {
  const { data: piResponse, loading, invalidate } = useCachedApi<{ pis: PI[] }>("/api/pis");
  const pis = piResponse?.pis ?? [];
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName || !newStart || !newEnd) return;
    setCreating(true);
    try {
      await fetch("/api/pis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, startDate: newStart, endDate: newEnd }),
      });
      setCreateOpen(false);
      setNewName("");
      setNewStart("");
      setNewEnd("");
      invalidate();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const handleStatusChange = async (piId: string, newStatus: string) => {
    try {
      await fetch("/api/pis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: piId, status: newStatus }),
      });
      invalidate();
    } catch (e) { console.error(e); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
            <h1 className="text-lg md:text-2xl font-bold">PI Management</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Create and manage Program Increments</p>
          </div>
          <Button className="h-7 md:h-8 text-[10px] md:text-xs gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create PI
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-6 md:py-12 text-[10px] md:text-xs text-muted-foreground">Loading PIs...</div>
        ) : (
          <div className="space-y-4">
            {pis.map((pi) => {
              const cfg = statusConfig[pi.status] ?? statusConfig.PLANNING;
              const Icon = cfg.icon;
              const progress = pi.stats.stories > 0 ? (pi.stats.doneStories / pi.stats.stories) * 100 : 0;

              return (
                <Card key={pi.id} className={cn("overflow-hidden", pi.status === "EXECUTING" && "ring-1 ring-amber-500/30")}>
                  <CardHeader className="pb-2 md:pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={cn("rounded-lg p-1.5 md:p-2", cfg.color)}>
                          <Icon className="h-3 w-3 md:h-4 md:w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm md:text-lg">{pi.name}</CardTitle>
                          <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                            <Badge className={cn("text-[9px] md:text-[10px]", cfg.color)}>{cfg.label}</Badge>
                            <span className="text-[9px] md:text-xs text-muted-foreground">
                              {formatDate(pi.startDate)} — {formatDate(pi.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        {pi.status === "PLANNING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 md:h-7 text-[9px] md:text-[10px] gap-1"
                            onClick={() => handleStatusChange(pi.id, "EXECUTING")}
                          >
                            <Play className="h-3 w-3 md:h-3.5 md:w-3.5" /> Start PI
                          </Button>
                        )}
                        {pi.status === "EXECUTING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 md:h-7 text-[9px] md:text-[10px] gap-1"
                            onClick={() => handleStatusChange(pi.id, "COMPLETED")}
                          >
                            <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5" /> Complete PI
                          </Button>
                        )}
                        {pi.status === "COMPLETED" && (
                          <Badge variant="outline" className="text-[9px] md:text-xs gap-1">
                            <Archive className="h-2.5 w-2.5 md:h-3 md:w-3" /> Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4 p-2 md:p-4">
                    <div className="grid grid-cols-5 gap-1.5 md:gap-3 text-[10px] md:text-sm">
                      <div>
                        <p className="text-muted-foreground">Features</p>
                        <p className="font-bold">{pi.stats.features}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stories</p>
                        <p className="font-bold">{pi.stats.stories}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Done</p>
                        <p className="font-bold text-emerald-400">{pi.stats.doneStories}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Objectives</p>
                        <p className="font-bold">{pi.stats.objectives}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risks</p>
                        <p className="font-bold">{pi.stats.risks}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] md:text-xs text-muted-foreground">Story Completion</span>
                        <span className="text-[9px] md:text-xs font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 md:h-2" />
                    </div>

                    <div>
                      <p className="text-[9px] md:text-xs text-muted-foreground mb-1.5 md:mb-2">Sprints ({pi.iterations.length})</p>
                      <div className="flex flex-wrap gap-1 md:gap-1.5">
                        {pi.iterations.map(it => (
                          <Badge key={it.id} variant="outline" className="text-[8px] md:text-[10px]">
                            {it.name}
                            <span className="text-muted-foreground ml-0.5 md:ml-1">{it.kind === "IP" ? "IP" : ""}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={(v) => !v && setCreateOpen(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm md:text-base">Create New PI</DialogTitle>
              <DialogDescription className="text-[10px] md:text-xs">
                Create a new Program Increment with 5 sprints + IP sprint.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label className="text-[10px] md:text-xs">PI Name *</Label>
                <Input
                  placeholder="PI 2026.3"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-7 md:h-8 text-[10px] md:text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-[10px] md:text-xs">Start Date *</Label>
                  <Input
                    type="date"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="h-7 md:h-8 text-[10px] md:text-xs"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label className="text-[10px] md:text-xs">End Date *</Label>
                  <Input
                    type="date"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="h-7 md:h-8 text-[10px] md:text-xs"
                  />
                </div>
              </div>
              <p className="text-[9px] md:text-xs text-muted-foreground">
                6 iterations (5 sprints + IP) will be auto-created, each 2 weeks.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="h-7 md:h-8 text-[10px] md:text-xs">Cancel</Button>
              <Button onClick={handleCreate} disabled={creating || !newName || !newStart || !newEnd} className="h-7 md:h-8 text-[10px] md:text-xs">
                {creating ? "Creating..." : "Create PI"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
