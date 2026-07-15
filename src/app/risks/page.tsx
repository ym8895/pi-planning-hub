"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Shield, Eye } from "lucide-react";

interface Risk {
  id: string;
  title: string;
  description: string | null;
  roam: string;
  impact: string;
  probability: string;
  mitigation: string | null;
  status: string;
  team: { name: string; color: string } | null;
  owner: { user: { name: string } } | null;
}

interface RisksData {
  risks: Risk[];
  pi: { id: string; name: string; status: string } | null;
}

const roamConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  RESOLVED: { label: "Resolved", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  OWNED: { label: "Owned", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", icon: Eye },
  ACCEPTED: { label: "Accepted", color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20", icon: Shield },
  MITIGATED: { label: "Mitigated", color: "text-violet-400", bgColor: "bg-violet-500/10 border-violet-500/20", icon: Shield },
  OPEN: { label: "Open", color: "text-zinc-400", bgColor: "bg-zinc-500/10 border-zinc-500/20", icon: AlertTriangle },
};

const impactColors: Record<string, string> = {
  LOW: "bg-emerald-500/15 text-emerald-400",
  MEDIUM: "bg-amber-500/15 text-amber-400",
  HIGH: "bg-orange-500/15 text-orange-400",
  CRITICAL: "bg-red-500/15 text-red-400",
};

export default function RisksPage() {
  const [data, setData] = useState<RisksData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/risks")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">Loading risks...</div></AppShell>;
  }

  if (!data || !data.pi) {
    return <AppShell><div className="flex items-center justify-center h-64 text-muted-foreground">No PI found</div></AppShell>;
  }

  const risks = data.risks;
  const roamGroups = ["RESOLVED", "OWNED", "ACCEPTED", "MITIGATED"];
  const openRisks = risks.filter(r => r.roam === "OPEN");
  const groupedRisks = roamGroups.map(r => ({ roam: r, risks: risks.filter(risk => risk.roam === r) }));
  const totalMitigated = risks.filter(r => r.status === "MITIGATED" || r.status === "CLOSED").length;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <a href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
          <h1 className="text-2xl font-bold">Risk Register</h1>
          <p className="text-muted-foreground mt-1">ROAM classification for PI risks</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{risks.length}</div>
              <div className="text-xs text-muted-foreground">Total Risks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{openRisks.length}</div>
              <div className="text-xs text-muted-foreground">Open (Unroamed)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-violet-400">{risks.filter(r => r.roam === "MITIGATED").length}</div>
              <div className="text-xs text-muted-foreground">Mitigated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{risks.filter(r => r.roam === "RESOLVED").length}</div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{risks.filter(r => r.impact === "HIGH" || r.impact === "CRITICAL").length}</div>
              <div className="text-xs text-muted-foreground">High/Critical</div>
            </CardContent>
          </Card>
        </div>

        {/* ROAM Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groupedRisks.map(({ roam, risks: roamRisks }) => {
            const config = roamConfig[roam];
            const Icon = config.icon;
            return (
              <Card key={roam}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className={cn("h-4 w-4", config.color)} />
                    {config.label}
                    <Badge variant="outline" className="ml-auto text-[10px]">{roamRisks.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {roamRisks.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No risks</p>
                  )}
                  {roamRisks.map(risk => (
                    <div key={risk.id} className={cn("rounded-lg border p-3 space-y-2", config.bgColor)}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{risk.title}</p>
                        <Badge className={cn("text-[9px] shrink-0", impactColors[risk.impact])}>
                          {risk.impact}
                        </Badge>
                      </div>
                      {risk.description && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{risk.description}</p>
                      )}
                      {risk.mitigation && (
                        <div className="text-[11px]">
                          <span className="font-medium text-muted-foreground">Mitigation: </span>
                          <span className="text-zinc-300">{risk.mitigation}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {risk.team && (
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: risk.team.color }} />
                            {risk.team.name}
                          </span>
                        )}
                        {risk.owner && <span>• {risk.owner.user.name}</span>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Open Risks (Unroamed) */}
        {openRisks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Unroamed Risks — Need Classification ({openRisks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {openRisks.map(risk => (
                  <div key={risk.id} className="flex items-center gap-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <Badge className={cn("text-[9px] shrink-0 w-16 justify-center", impactColors[risk.impact])}>
                      {risk.impact}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{risk.title}</p>
                      {risk.description && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{risk.description}</p>}
                    </div>
                    {risk.team && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: risk.team.color }} />
                        {risk.team.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="text-xs">
              <span className="font-medium text-muted-foreground">ROAM Framework: </span>
              <span className="text-emerald-400 font-medium">Resolved</span> — Issue dealt with.{' '}
              <span className="text-blue-400 font-medium">Owned</span> — Someone assigned to manage.{' '}
              <span className="text-amber-400 font-medium">Accepted</span> — Risk acknowledged, no action.{' '}
              <span className="text-violet-400 font-medium">Mitigated</span> — Action plan in place.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
