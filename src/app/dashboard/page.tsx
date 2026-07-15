"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRole } from "@/lib/role-context";
import {
  Layers, ListTodo, CheckCircle2, AlertCircle, Users, Zap,
  Target, GitBranch, Rocket, ArrowRight, Activity, BarChart3,
  Calendar, Shield, GitPullRequest,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  art: { name: string; organization: { name: string } };
  currentPI: { name: string; status: string; startDate: string; endDate: string } | null;
  features: number; featuresDone: number; featuresInProgress: number; featuresPlanned: number; featuresBacklog: number; featuresRefining: number; featuresBusiness: number; featuresEnabler: number;
  stories: number; done: number; inProgress: number; blocked: number; todo: number;
  totalPoints: number; completedPoints: number;
  teams: number; velocity: number;
  objectives: number; committedObjectives: number; stretchObjectives: number; completion: number;
  openDependencies: number; blockedDependencies: number;
  piDaysTotal: number; piDaysElapsed: number; piDaysRemaining: number;
  currentIteration: string; totalIterations: number; completedIterations: number;
}

function StatCard({
  icon: Icon, label, value, iconBg, sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; iconBg: string; sub?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-white/[.03] border border-white/5 px-3 py-2">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconBg)}>
        <Icon className="h-4 w-4 text-white/70" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate leading-tight">{label}</p>
        <p className="text-base font-bold leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground truncate leading-tight">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { role, isRTE, isSM, isPO } = useRole();

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div></AppShell>;
  if (!data) return <AppShell><div className="flex flex-col items-center justify-center h-64 gap-4"><h2 className="text-xl font-semibold">Welcome to PI Planning Hub</h2><p className="text-muted-foreground">No data. Run: <code className="rounded bg-muted px-2 py-0.5 text-sm">npx tsx prisma/seed.ts</code></p></div></AppShell>;

  const storyPct = data.stories > 0 ? Math.round((data.done / data.stories) * 100) : 0;
  const pointPct = data.totalPoints > 0 ? Math.round((data.completedPoints / data.totalPoints) * 100) : 0;
  const piPct = data.piDaysTotal > 0 ? Math.round((data.piDaysElapsed / data.piDaysTotal) * 100) : 0;
  const featPct = data.features > 0 ? Math.round((data.featuresDone / data.features) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-4">

        {/* Header + PI bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold leading-tight">{data.art.name}</h1>
              <p className="text-xs text-muted-foreground">{data.art.organization.name}{data.currentPI ? ` — ${data.currentPI.name}` : ""}</p>
            </div>
            {data.currentPI && (
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={data.currentPI.status === "EXECUTING" ? "success" : "info"} className="text-[10px] px-1.5 py-0">{data.currentPI.status}</Badge>
                {data.currentIteration && <span className="text-[11px] text-muted-foreground">{data.currentIteration}</span>}
              </div>
            )}
          </div>
          {data.currentPI && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{data.piDaysElapsed}/{data.piDaysTotal}d</span>
              <div className="w-24"><Progress value={piPct} className="h-1" /></div>
              <span>{piPct}%</span>
            </div>
          )}
        </div>

        {/* Main split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* LEFT: 3 Sections with colored left borders */}
          <div className="space-y-3">
            {/* Delivery */}
            <div className="rounded-xl border-l-4 border-l-cyan-500 bg-white/[.02] p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Rocket className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Delivery Progress</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard icon={Layers} label="Features" value={`${data.featuresDone}/${data.features}`} iconBg="bg-cyan-500/15" sub={`${featPct}% done`} />
                <StatCard icon={ListTodo} label="Stories" value={`${data.done}/${data.stories}`} iconBg="bg-amber-500/15" sub={`${storyPct}% done`} />
                <StatCard icon={Zap} label="Points" value={`${data.completedPoints}/${data.totalPoints}`} iconBg="bg-yellow-500/15" sub={`${pointPct}% delivered`} />
                <StatCard icon={Target} label="Objectives" value={`${Math.round(data.completion)}%`} iconBg="bg-indigo-500/15" sub={`${data.committedObjectives} committed`} />
              </div>
            </div>

            {/* Work Status */}
            <div className="rounded-xl border-l-4 border-l-emerald-500 bg-white/[.02] p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Work Status</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard icon={CheckCircle2} label="Done" value={data.done} iconBg="bg-emerald-500/15" sub={`${data.featuresDone} features`} />
                <StatCard icon={Activity} label="Active" value={data.inProgress} iconBg="bg-blue-500/15" sub={`${data.featuresInProgress} features`} />
                <StatCard icon={ListTodo} label="To Do" value={data.todo} iconBg="bg-zinc-500/15" sub={`${data.featuresPlanned + data.featuresBacklog} features`} />
                <StatCard icon={AlertCircle} label="Blocked" value={data.blocked} iconBg="bg-red-500/15" sub="Need attention" />
              </div>
            </div>

            {/* Teams & Risks */}
            <div className="rounded-xl border-l-4 border-l-purple-500 bg-white/[.02] p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Shield className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Teams & Risks</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard icon={Users} label="Teams" value={data.teams} iconBg="bg-purple-500/15" sub={`${data.velocity} vel`} />
                <StatCard icon={GitBranch} label="Open Deps" value={data.openDependencies} iconBg="bg-orange-500/15" sub="Cross-team" />
                <StatCard icon={GitPullRequest} label="Blocked Deps" value={data.blockedDependencies} iconBg="bg-red-500/15" sub="Critical" />
                <StatCard icon={Target} label="Stretch" value={data.stretchObjectives} iconBg="bg-pink-500/15" sub="Stretch obj" />
              </div>
            </div>
          </div>

          {/* RIGHT: Feature Status + Role Insights side-by-side, Quick Nav full-width below */}
          <div className="space-y-3">
            <div className="flex gap-3">
              {/* Feature Status */}
              <div className="flex-1 rounded-xl bg-white/[.02] border border-white/5 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Feature Status</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Done", count: data.featuresDone, total: data.features, color: "bg-emerald-500" },
                    { label: "In Progress", count: data.featuresInProgress, total: data.features, color: "bg-blue-500" },
                    { label: "Refining", count: data.featuresRefining, total: data.features, color: "bg-amber-500" },
                    { label: "Planned", count: data.featuresPlanned, total: data.features, color: "bg-indigo-500" },
                    { label: "Backlog", count: data.featuresBacklog, total: data.features, color: "bg-zinc-500" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("h-1.5 w-1.5 rounded-full", item.color)} />
                          <span className="text-[11px] text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-[11px] font-bold">{item.count} <span className="text-muted-foreground font-normal">/ {item.total}</span></span>
                      </div>
                      <Progress value={item.total > 0 ? (item.count / item.total) * 100 : 0} className="h-1" />
                    </div>
                  ))}
                  <div className="pt-1 border-t border-white/5 flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      <span className="text-[10px] text-muted-foreground">Business: {data.featuresBusiness}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      <span className="text-[10px] text-muted-foreground">Enabler: {data.featuresEnabler}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-Based Insights */}
              <div className="flex-1 rounded-xl bg-white/[.02] border border-white/5 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {isRTE ? "RTE Overview" : isSM ? "Scrum Master View" : isPO ? "Product Owner View" : "Team View"}
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  {isRTE && (
                    <>
                      <a href="/dependencies" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Open Dependencies</span><span className="font-bold">{data.openDependencies}</span></a>
                      <a href="/dependencies" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Blocked Dependencies</span><span className="font-bold text-red-400">{data.blockedDependencies}</span></a>
                      <a href="/board" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">PI Progress</span><span className="font-bold">{piPct}%</span></a>
                      <a href="/teams" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Teams</span><span className="font-bold">{data.teams}</span></a>
                    </>
                  )}
                  {isSM && (
                    <>
                      <a href="/board" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Stories Done</span><span className="font-bold">{data.done}</span></a>
                      <a href="/board" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">In Progress</span><span className="font-bold">{data.inProgress}</span></a>
                      <a href="/risks" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Blocked</span><span className="font-bold text-red-400">{data.blocked}</span></a>
                      <a href="/objectives" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Objective Completion</span><span className="font-bold">{Math.round(data.completion)}%</span></a>
                    </>
                  )}
                  {isPO && (
                    <>
                      <a href="/backlog" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Features Done</span><span className="font-bold">{data.featuresDone}</span></a>
                      <a href="/backlog" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Features Planned</span><span className="font-bold">{data.featuresPlanned}</span></a>
                      <a href="/objectives" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Committed Objectives</span><span className="font-bold">{data.committedObjectives}</span></a>
                      <a href="/objectives" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Stretch Objectives</span><span className="font-bold">{data.stretchObjectives}</span></a>
                    </>
                  )}
                  {!isRTE && !isSM && !isPO && (
                    <>
                      <a href="/board" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Stories Done</span><span className="font-bold">{data.done}</span></a>
                      <a href="/board" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Points Done</span><span className="font-bold">{data.completedPoints}</span></a>
                      <a href="/board" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Current Sprint</span><span className="font-bold">{data.currentIteration || "—"}</span></a>
                      <a href="/board" className="flex justify-between hover:bg-white/[.03] rounded px-1 py-0.5 transition-colors"><span className="text-muted-foreground">Days Remaining</span><span className="font-bold">{data.piDaysRemaining}</span></a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Navigation — full width */}
            <div className="rounded-xl bg-white/[.02] border border-white/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Rocket className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Navigation</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  { href: "/backlog", label: "Backlog", sub: "WSJF ranking", value: data.features, icon: Layers, color: "text-cyan-400" },
                  { href: "/board", label: "Board", sub: "Visual planning", value: data.stories, icon: BarChart3, color: "text-amber-400" },
                  { href: "/objectives", label: "Objectives", sub: "Track goals", value: `${Math.round(data.completion)}%`, icon: Target, color: "text-emerald-400" },
                  { href: "/dependencies", label: "Dependencies", sub: "Cross-team", value: data.openDependencies, icon: GitBranch, color: "text-orange-400" },
                  { href: "/capacity", label: "Capacity", sub: "Team load", value: data.teams, icon: Users, color: "text-indigo-400" },
                  { href: "/confidence", label: "Confidence", sub: "Vote results", value: data.teams, icon: Zap, color: "text-yellow-400" },
                ].map(item => (
                  <a key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-0.5 rounded-lg bg-white/[.03] border border-white/5 px-2 py-1.5 text-center transition-colors hover:bg-white/[.06]">
                    <item.icon className={cn("h-3.5 w-3.5 shrink-0", item.color)} />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                    <span className="text-sm font-bold leading-tight">{item.value}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
