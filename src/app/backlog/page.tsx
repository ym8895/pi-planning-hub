"use client";

import { useState } from "react";
import { useCachedApi } from "@/lib/use-cached-api";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FeatureForm } from "@/components/feature-form";
import { StoryForm } from "@/components/story-form";
import { Plus, ChevronRight, ChevronDown, Pencil, Search } from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  businessValue: number;
  timeCriticality: number;
  riskReduction: number;
  jobSize: number;
  artId: string;
  ownerTeamId: string | null;
  featureType: string;
  ownerTeam: { name: string; color: string } | null;
  stories: { id: string; name: string; status: string; storyPoints: number; team: { name: string } | null; iteration: { name: string } | null; owner: { user: { name: string } } | null }[];
}

interface Team { id: string; name: string; color: string; members?: Member[]; }
interface Iteration { id: string; name: string; kind: string; }
interface Member { id: string; teamId: string; role: string; user: { name: string }; }

const statusColors: Record<string, string> = {
  BACKLOG: "bg-muted text-muted-foreground",
  REFINING: "bg-blue-500/15 text-blue-400",
  PLANNED: "bg-indigo-500/15 text-indigo-400",
  IN_PROGRESS: "bg-amber-500/15 text-amber-400",
  DONE: "bg-emerald-500/15 text-emerald-400",
  TODO: "bg-muted text-muted-foreground",
  DOING: "bg-blue-500/15 text-blue-400",
  BLOCKED: "bg-rose-500/15 text-rose-400",
};

const priorityColors: Record<string, string> = {
  MUST: "bg-red-500/15 text-red-400",
  SHOULD: "bg-amber-500/15 text-amber-400",
  COULD: "bg-muted text-muted-foreground",
};

function computeWsjf(f: { businessValue: number; timeCriticality: number; riskReduction: number; jobSize: number }) {
  return (f.businessValue + f.timeCriticality + f.riskReduction) / Math.max(f.jobSize, 1);
}

export default function BacklogPage() {
  const { data: featuresData, loading: featuresLoading, invalidate: invalidateFeatures } = useCachedApi<Feature[]>("/api/features");
  const { data: teamsData, loading: teamsLoading, invalidate: invalidateTeams } = useCachedApi<Team[]>("/api/teams");
  const { data: boardData, loading: boardLoading, invalidate: invalidateBoard } = useCachedApi<{ pi?: { iterations: Iteration[] } }>("/api/board");
  const loading = featuresLoading || teamsLoading || boardLoading;
  const features = featuresData ?? [];
  const teams = teamsData ?? [];
  const iterations = boardData?.pi?.iterations ?? [];
  const members = teams.flatMap(t => t.members ?? []);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [featureFormOpen, setFeatureFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [storyFormOpen, setStoryFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);
  const [storyFormContext, setStoryFormContext] = useState<{ featureId?: string; teamId?: string; iterationId?: string }>({});

  const refetchAll = () => {
    invalidateFeatures();
    invalidateTeams();
    invalidateBoard();
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = features
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase()))
    .map(f => ({ ...f, wsjf: computeWsjf(f) }))
    .sort((a, b) => b.wsjf - a.wsjf);

  const totalStories = features.reduce((s, f) => s + f.stories.length, 0);
  const mustHave = features.filter(f => f.priority === "MUST").length;
  const inProgress = features.filter(f => f.status === "IN_PROGRESS").length;
  const done = features.filter(f => f.status === "DONE").length;

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
            <h1 className="text-lg md:text-2xl font-bold">Program Backlog</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">WSJF-ranked features with stories</p>
          </div>
          <Button className="h-7 md:h-8 text-[10px] md:text-xs gap-2" onClick={() => { setEditingFeature(null); setFeatureFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Feature
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-3">
          <Card><CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold">{features.length}</div><div className="text-[10px] md:text-xs text-muted-foreground">Total Features</div>
          </CardContent></Card>
          <Card><CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-red-400">{mustHave}</div><div className="text-[10px] md:text-xs text-muted-foreground">Must Have</div>
          </CardContent></Card>
          <Card><CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-amber-400">{inProgress}</div><div className="text-[10px] md:text-xs text-muted-foreground">In Progress</div>
          </CardContent></Card>
          <Card><CardContent className="p-2 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-emerald-400">{done}</div><div className="text-[10px] md:text-xs text-muted-foreground">Done</div>
          </CardContent></Card>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search features..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-7 md:h-8 text-[10px] md:text-xs" />
          </div>
          <span className="text-[10px] md:text-xs text-muted-foreground">{filtered.length} features • {totalStories} stories</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-1">
            {filtered.map((f, idx) => {
              const isExpanded = expanded.has(f.id);
              return (
                <div key={f.id} className="rounded-lg border border-border overflow-hidden">
                  <div
                    className={cn(
                      "flex items-center gap-2 md:gap-3 px-2 py-2 md:px-4 md:py-3 cursor-pointer hover:bg-accent/50 transition-colors",
                      isExpanded && "bg-accent/30"
                    )}
                    onClick={() => toggleExpand(f.id)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className="text-[10px] md:text-xs text-muted-foreground w-6 shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs md:text-sm truncate">{f.name}</div>
                      {f.description && <div className="text-[10px] md:text-xs text-muted-foreground truncate">{f.description}</div>}
                    </div>
                    {f.ownerTeam && (
                      <span className="flex items-center gap-1.5 text-[10px] md:text-xs shrink-0 hidden md:flex">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.ownerTeam.color }} />
                        {f.ownerTeam.name}
                      </span>
                    )}
                    <Badge className={cn("text-[9px] md:text-[10px] shrink-0", statusColors[f.status])}>{f.status}</Badge>
                    <Badge className={cn("text-[9px] md:text-[10px] shrink-0 hidden md:flex", priorityColors[f.priority])}>{f.priority}</Badge>
                    {f.featureType === "ENABLER" && (
                      <Badge className="text-[9px] md:text-[10px] shrink-0 bg-violet-500/15 text-violet-400 hidden md:flex">ENABLER</Badge>
                    )}
                    <span className="text-[10px] md:text-xs text-muted-foreground w-8 text-right shrink-0 hidden md:block" title="Business Value">{f.businessValue}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground w-8 text-right shrink-0 hidden md:block" title="Time Criticality">{f.timeCriticality}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground w-8 text-right shrink-0 hidden md:block" title="Risk Reduction">{f.riskReduction}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground w-8 text-right shrink-0 hidden md:block" title="Job Size">{f.jobSize}</span>
                    <span className="text-[10px] md:text-xs font-bold text-indigo-400 w-10 text-right shrink-0">{computeWsjf(f).toFixed(1)}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground w-16 text-right shrink-0 hidden md:block">{f.stories.length} stories</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 md:h-7 md:w-7 shrink-0"
                      onClick={(e) => { e.stopPropagation(); setEditingFeature(f); setFeatureFormOpen(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 px-2 py-2 md:px-4 md:py-3">
                      {f.stories.length === 0 ? (
                        <div className="text-center py-2 md:py-4">
                          <p className="text-[10px] md:text-xs text-muted-foreground mb-2">No stories yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 md:h-7 text-[9px] md:text-[10px] gap-1"
                            onClick={() => { setStoryFormContext({ featureId: f.id }); setEditingStory(null); setStoryFormOpen(true); }}
                          >
                            <Plus className="h-3 w-3" /> Add Story
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {f.stories.map(s => (
                            <div key={s.id} className="flex items-center gap-2 md:gap-3 px-2 py-1.5 md:px-3 md:py-2 rounded-md bg-card hover:bg-accent transition-colors">
                              <Badge className={cn("text-[9px] md:text-[10px] w-16 justify-center", statusColors[s.status])}>{s.status}</Badge>
                              <span className="text-[10px] md:text-sm flex-1 truncate">{s.name}</span>
                              {s.team && <span className="text-[10px] md:text-xs text-muted-foreground hidden md:block">{s.team.name}</span>}
                              {s.iteration && <span className="text-[10px] md:text-xs text-muted-foreground hidden md:block">{s.iteration.name}</span>}
                              {s.owner && <span className="text-[10px] md:text-xs text-muted-foreground hidden md:block">{s.owner.user.name}</span>}
                              <span className="text-[10px] md:text-xs font-mono text-muted-foreground">{s.storyPoints}pt</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 md:h-6 md:w-6"
                                onClick={() => { setEditingStory(s); setStoryFormContext({}); setStoryFormOpen(true); }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 md:h-7 text-[9px] md:text-[10px] gap-1 mt-2"
                            onClick={() => { setStoryFormContext({ featureId: f.id }); setEditingStory(null); setStoryFormOpen(true); }}
                          >
                            <Plus className="h-3 w-3" /> Add Story
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <FeatureForm
          open={featureFormOpen}
          onClose={() => { setFeatureFormOpen(false); setEditingFeature(null); }}
          feature={editingFeature}
          artId={features[0]?.artId ?? ""}
          teams={teams}
          onSaved={refetchAll}
        />

        <StoryForm
          open={storyFormOpen}
          onClose={() => { setStoryFormOpen(false); setEditingStory(null); setStoryFormContext({}); }}
          story={editingStory}
          featureId={storyFormContext.featureId}
          teamId={storyFormContext.teamId}
          iterationId={storyFormContext.iterationId}
          features={features.map(f => ({ id: f.id, name: f.name }))}
          teams={teams}
          iterations={iterations}
          members={members}
          onSaved={refetchAll}
        />
      </div>
    </AppShell>
  );
}
