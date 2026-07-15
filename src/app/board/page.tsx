"use client";

import { useState, useCallback, useRef, useLayoutEffect, useMemo, useEffect } from "react";
import { useCachedApi } from "@/lib/use-cached-api";
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StoryForm } from "@/components/story-form";
import { ArrowRight, Filter, Plus, Eye, EyeOff, Printer } from "lucide-react";

interface PI { id: string; name: string; status: string; }
interface Iteration { id: string; name: string; startDate: string; endDate: string; kind: string; }
interface Team {
  id: string; name: string; color: string;
  stories: {
    id: string; name: string; status: string; storyPoints: number;
    iteration: { id: string; name: string; kind: string } | null;
    feature: { name: string } | null;
  }[];
}
interface Dependency {
  id: string; status: string; description: string;
  fromStory: { id: string; name: string; team: { name: string; color: string } } | null;
  toStory: { id: string; name: string; team: { name: string; color: string } } | null;
}
interface BoardData {
  pi: { id: string; name: string; startDate: string; endDate: string; status: string; iterations: Iteration[] } | null;
  allPIs: PI[];
  teams: Team[];
  stories: { id: string; name: string; teamId: string | null; iterationId: string | null; status: string; storyPoints: number; feature: { name: string } | null }[];
  dependencies: Dependency[];
}

const statusColors: Record<string, string> = {
  TODO: "bg-zinc-500/15 border-zinc-500/30 text-zinc-400",
  DOING: "bg-blue-500/15 border-blue-500/30 text-blue-400",
  DONE: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
  BLOCKED: "bg-red-500/15 border-red-500/30 text-red-400",
};

const sprintColors = [
  "from-blue-500/20 to-blue-600/5 border-blue-500/20",
  "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
  "from-violet-500/20 to-violet-600/5 border-violet-500/20",
  "from-purple-500/20 to-purple-600/5 border-purple-500/20",
  "from-pink-500/20 to-pink-600/5 border-pink-500/20",
  "from-amber-500/20 to-amber-600/5 border-amber-500/20",
];

const depStatusColors: Record<string, string> = {
  OPEN: "#f97316",
  BLOCKED: "#ef4444",
  RESOLVED: "#22c55e",
};

function DraggableStoryCard({ story, onClick, depFrom, depTo }: { story: any; onClick: () => void; depFrom?: boolean; depTo?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: story.id,
    data: { story },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      data-story-id={story.id}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded border px-1.5 py-1 text-[11px] leading-tight cursor-grab active:cursor-grabbing relative",
        statusColors[story.status] ?? statusColors.TODO,
        isDragging && "z-50",
        depFrom && "ring-1 ring-inset ring-amber-500/50",
        depTo && "ring-1 ring-inset ring-blue-500/50"
      )}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <p className="font-medium line-clamp-1">{story.name}</p>
      <div className="flex items-center justify-between opacity-60 mt-0.5">
        <span className="truncate max-w-[70%]">{story.feature?.name}</span>
        <span className="font-mono shrink-0">{story.storyPoints}pt</span>
      </div>
      {(depFrom || depTo) && (
        <span className={cn(
          "absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full text-[7px] flex items-center justify-center font-bold",
          depFrom ? "bg-amber-500 text-black" : "bg-blue-500 text-white"
        )}>
          {depFrom ? "F" : "T"}
        </span>
      )}
    </div>
  );
}

function DroppableCell({ cellId, children, isOver }: { cellId: string; children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: cellId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] p-1.5 border-r border-zinc-800 last:border-r-0 transition-colors",
        isOver ? "bg-blue-500/10 ring-1 ring-inset ring-blue-500/30" : "bg-zinc-950/20"
      )}
    >
      {children}
    </div>
  );
}

export default function BoardPage() {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPI, setSelectedPI] = useState<string>("");
  const [activeStory, setActiveStory] = useState<any>(null);
  const [overCellId, setOverCellId] = useState<string | null>(null);
  const [showDependencies, setShowDependencies] = useState(true);

  const [storyFormOpen, setStoryFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);
  const [storyFormContext, setStoryFormContext] = useState<{ featureId?: string; teamId?: string; iterationId?: string }>({});

  const boardRef = useRef<HTMLDivElement>(null);
  const [depLines, setDepLines] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string; status: string }[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const boardUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedTeam !== "all") params.set("teamId", selectedTeam);
    if (selectedPI) params.set("piId", selectedPI);
    const qs = params.toString();
    return `/api/board${qs ? `?${qs}` : ""}`;
  }, [selectedTeam, selectedPI]);

  const { data, loading, invalidate: invalidateBoard } = useCachedApi<BoardData>(boardUrl);
  const { data: featuresData, invalidate: invalidateFeatures } = useCachedApi<{ id: string; name: string }[]>("/api/features");
  const { data: teamsDataRaw, invalidate: invalidateTeams } = useCachedApi<any[]>("/api/teams");

  const features = useMemo(() => featuresData ?? [], [featuresData]);
  const teamsList = useMemo(() => teamsDataRaw ?? [], [teamsDataRaw]);
  const iterationsList = useMemo(() => data?.pi?.iterations ?? [], [data]);
  const membersList = useMemo(() => (teamsDataRaw ?? []).flatMap((t: any) => t.members ?? []), [teamsDataRaw]);

  useEffect(() => {
    if (data?.pi && !selectedPI) {
      setSelectedPI(data.pi.id);
    }
  }, [data?.pi, selectedPI]);

  useLayoutEffect(() => {
    if (!data || !showDependencies || !boardRef.current) {
      setDepLines([]);
      return;
    }

    const calcLines = () => {
      const board = boardRef.current;
      if (!board) return;
      const boardRect = board.getBoundingClientRect();
      const newLines: typeof depLines = [];

      for (const dep of data.dependencies) {
        if (!dep.fromStory || !dep.toStory) continue;
        const fromEl = board.querySelector(`[data-story-id="${dep.fromStory.id}"]`);
        const toEl = board.querySelector(`[data-story-id="${dep.toStory.id}"]`);
        if (!fromEl || !toEl) continue;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        newLines.push({
          x1: fromRect.left + fromRect.width / 2 - boardRect.left,
          y1: fromRect.top + fromRect.height / 2 - boardRect.top,
          x2: toRect.left + toRect.width / 2 - boardRect.left,
          y2: toRect.top + toRect.height / 2 - boardRect.top,
          color: depStatusColors[dep.status] ?? "#f97316",
          status: dep.status,
        });
      }

      setDepLines(newLines);
    };

    const timer = setTimeout(calcLines, 100);
    return () => clearTimeout(timer);
  }, [data, showDependencies, data?.stories]);

  const handleDragStart = (event: DragStartEvent) => {
    const story = event.active.data.current?.story;
    if (story) setActiveStory(story);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveStory(null);
    setOverCellId(null);

    if (!over || !data) return;

    const storyId = active.id as string;
    const overId = over.id as string;

    const match = overId.match(/^cell-(.+)-(.+)$/);
    if (!match) return;

    const [, newTeamId, newIterId] = match;
    const story = data.stories.find(s => s.id === storyId);
    if (!story) return;

    if (story.teamId === newTeamId && story.iterationId === newIterId) return;

    try {
      await fetch("/api/board", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, teamId: newTeamId, iterationId: newIterId }),
      });
      invalidateBoard();
    } catch (e) {
      console.error("DnD update failed:", e);
      invalidateBoard();
    }
  };

  const openStoryForm = (story?: any, ctx?: { featureId?: string; teamId?: string; iterationId?: string }) => {
    setEditingStory(story ?? null);
    setStoryFormContext(ctx ?? {});
    setStoryFormOpen(true);
  };

  if (loading && !data) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">Loading board...</div></AppShell>;
  }
  if (!data || !data.pi) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">No PI found</div></AppShell>;
  }

  const iterations = data.pi.iterations ?? [];
  const teams = data.teams;
  const numCols = iterations.length;

  const iterStats = iterations.map((it) => {
    const stories = data.stories.filter(s => s.iterationId === it.id);
    const total = stories.reduce((s, st) => s + st.storyPoints, 0);
    const done = stories.filter(s => s.status === "DONE").reduce((s, st) => s + st.storyPoints, 0);
    return { ...it, count: stories.length, total, done };
  });

  const totalStories = data.stories.length;
  const totalPts = data.stories.reduce((s, st) => s + st.storyPoints, 0);
  const donePts = data.stories.filter(s => s.status === "DONE").reduce((s, st) => s + st.storyPoints, 0);

  const depStoryIds = new Set<string>();
  data.dependencies.forEach(d => {
    if (d.fromStory) depStoryIds.add(d.fromStory.id);
    if (d.toStory) depStoryIds.add(d.toStory.id);
  });

  return (
    <AppShell>
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
            <h1 className="text-lg md:text-2xl font-bold">Program Board</h1>
            <p className="text-muted-foreground mt-1 text-xs md:text-sm">{data.pi.name} — {data.pi.status}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedPI}
              onChange={(e) => { setSelectedPI(e.target.value); }}
              className="h-7 md:h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-[10px] md:text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              {data.allPIs.map(pi => <option key={pi.id} value={pi.id}>{pi.name} ({pi.status})</option>)}
            </select>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="h-7 md:h-8 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-[10px] md:text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              <option value="all">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <Button
              variant={showDependencies ? "default" : "outline"}
              size="sm"
              className="h-7 md:h-8 gap-1 text-[10px] md:text-xs"
              onClick={() => setShowDependencies(!showDependencies)}
            >
              {showDependencies ? <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" /> : <EyeOff className="h-3 w-3 md:h-3.5 md:w-3.5" />}
              <span className="hidden sm:inline">Dependencies</span>
              <span className="sm:hidden">Deps</span>
              {data.dependencies.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[9px] md:text-[10px]">{data.dependencies.length}</Badge>
              )}
            </Button>
            <Badge variant="outline" className="text-[9px] md:text-[10px]">{totalStories} stories</Badge>
            <Badge variant="outline" className="text-[9px] md:text-[10px]">{totalPts} pts</Badge>
            {donePts > 0 && <Badge variant="outline" className="text-[9px] md:text-[10px] text-emerald-400">{donePts} done</Badge>}
            <Button
              variant="outline"
              size="sm"
              className="h-7 md:h-8 gap-1 text-[10px] md:text-xs"
              onClick={() => window.print()}
            >
              <Printer className="h-3 w-3 md:h-3.5 md:w-3.5" /> Export
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          {teams.map(t => {
            const pts = t.stories.reduce((s: number, st: any) => s + st.storyPoints, 0);
            return (
              <div key={t.id} className="flex items-center gap-1 md:gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-2 md:px-2.5 py-0.5 md:py-1">
                <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-[10px] md:text-xs font-medium">{t.name}</span>
                <span className="text-[9px] md:text-[10px] text-muted-foreground">{pts}pt</span>
              </div>
            );
          })}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => {
            const overId = e.over?.id as string;
            setOverCellId(overId?.startsWith("cell-") ? overId : null);
          }}
        >
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <div ref={boardRef} className="relative">
              <div className="grid" style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
                {iterStats.map((it, idx) => (
                  <div key={it.id} className={cn("px-2 py-2.5 text-center border-r border-zinc-800 last:border-r-0 bg-gradient-to-b", it.kind === "IP" ? sprintColors[5] : sprintColors[idx] ?? sprintColors[0])}>
                    <div className="font-medium text-xs">{it.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {it.count} stories • {it.total} pts
                      {it.done > 0 && <span className="text-emerald-400"> • {it.done} done</span>}
                    </div>
                  </div>
                ))}
              </div>

              {teams.map(team => {
                const teamPts = team.stories.reduce((s: number, st: any) => s + st.storyPoints, 0);
                const teamDone = team.stories.filter((s: any) => s.status === "DONE").reduce((s: number, st: any) => s + st.storyPoints, 0);
                return (
                  <div key={team.id} className="border-t border-zinc-800">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/40 border-b border-zinc-800/50">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                      <span className="text-xs font-semibold">{team.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {teamPts} pts {teamDone > 0 && <span className="text-emerald-400">• {teamDone} done</span>}
                      </span>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}>
                      {iterations.map(it => {
                        const cellStories = team.stories.filter((s: any) => s.iteration?.id === it.id);
                        const cellId = `cell-${team.id}-${it.id}`;
                        return (
                          <DroppableCell key={it.id} cellId={cellId} isOver={overCellId === cellId}>
                            {cellStories.length > 0 && (
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-[9px] text-muted-foreground">{cellStories.length} stories</span>
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <SortableContext items={cellStories.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
                                {cellStories.map((story: any) => (
                                  <DraggableStoryCard
                                    key={story.id}
                                    story={story}
                                    onClick={() => openStoryForm(story)}
                                    depFrom={data.dependencies.some(d => d.fromStory?.id === story.id)}
                                    depTo={data.dependencies.some(d => d.toStory?.id === story.id)}
                                  />
                                ))}
                              </SortableContext>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 mt-1 opacity-40 hover:opacity-100"
                              onClick={() => openStoryForm(null, { teamId: team.id, iterationId: it.id })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </DroppableCell>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {showDependencies && depLines.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: "visible" }}>
                  <defs>
                    <marker id="dep-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="currentColor" className="text-zinc-400" />
                    </marker>
                  </defs>
                  {depLines.map((line, i) => {
                    const dx = line.x2 - line.x1;
                    const dy = line.y2 - line.y1;
                    const mx = (line.x1 + line.x2) / 2;
                    const my = (line.y1 + line.y2) / 2;
                    const cx1 = mx + dy * 0.15;
                    const cy1 = my - dx * 0.15;
                    return (
                      <g key={i}>
                        <path
                          d={`M ${line.x1} ${line.y1} Q ${cx1} ${cy1} ${line.x2} ${line.y2}`}
                          fill="none"
                          stroke={line.color}
                          strokeWidth="2"
                          strokeDasharray={line.status === "BLOCKED" ? "4,4" : undefined}
                          opacity="0.6"
                          markerEnd="url(#dep-arrow)"
                        />
                        <circle cx={line.x1} cy={line.y1} r="3" fill={line.color} opacity="0.8" />
                        <circle cx={line.x2} cy={line.y2} r="3" fill={line.color} opacity="0.8" />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeStory ? (
              <div className={cn("rounded border px-1.5 py-1 text-[11px] leading-tight shadow-xl opacity-90 w-48", statusColors[activeStory.status] ?? statusColors.TODO)}>
                <p className="font-medium line-clamp-1">{activeStory.name}</p>
                <div className="flex items-center justify-between opacity-60 mt-0.5">
                  <span className="truncate max-w-[70%]">{activeStory.feature?.name}</span>
                  <span className="font-mono shrink-0">{activeStory.storyPoints}pt</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {data.dependencies.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-3">Cross-Team Dependencies ({data.dependencies.length})</h3>
              <div className="grid gap-2">
                {data.dependencies.map(dep => (
                  <div key={dep.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 p-3 bg-zinc-900/20">
                    <Badge variant={dep.status === "RESOLVED" ? "default" : dep.status === "BLOCKED" ? "destructive" : "secondary"} className="text-[10px] shrink-0 w-16 justify-center">{dep.status}</Badge>
                    <div className="flex items-center gap-2 text-xs min-w-0">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dep.fromStory?.team?.color }} />
                      <span className="font-medium truncate">{dep.fromStory?.team?.name}</span>
                      <span className="text-muted-foreground truncate">{dep.fromStory?.name}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dep.toStory?.team?.color }} />
                      <span className="font-medium truncate">{dep.toStory?.team?.name}</span>
                      <span className="text-muted-foreground truncate">{dep.toStory?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs flex-wrap">
          <span className="font-medium text-muted-foreground">Legend:</span>
          {Object.entries(statusColors).map(([s, c]) => (
            <div key={s} className="flex items-center gap-1 md:gap-1.5"><span className={cn("h-2 w-2 md:h-2.5 md:w-2.5 rounded border", c)} /><span>{s}</span></div>
          ))}
          <span className="text-muted-foreground">|</span>
          <div className="flex items-center gap-1 md:gap-1.5">
            <span className="h-2 w-2 md:h-2.5 md:w-2.5 rounded bg-amber-500/10 border border-amber-500/20" />
            <span>IP Sprint</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <div className="flex items-center gap-1 md:gap-1.5">
            <span className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-amber-500" />
            <span>Dep Source</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <span className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-blue-500" />
            <span>Dep Target</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground hidden sm:inline">Drag cards between cells to reschedule</span>
        </div>

        <StoryForm
          open={storyFormOpen}
          onClose={() => { setStoryFormOpen(false); setEditingStory(null); setStoryFormContext({}); }}
          story={editingStory}
          featureId={storyFormContext.featureId}
          teamId={storyFormContext.teamId}
          iterationId={storyFormContext.iterationId}
          features={features}
          teams={teamsList}
          iterations={iterationsList}
          members={membersList}
          onSaved={() => { invalidateBoard(); invalidateFeatures(); }}
        />
      </div>
    </AppShell>
  );
}
