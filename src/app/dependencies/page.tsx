"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GitBranch, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Dependency {
  id: string;
  type: string;
  status: string;
  description: string | null;
  fromFeature: { name: string } | null;
  toFeature: { name: string } | null;
  fromStory: { name: string; team: { name: string } } | null;
  toStory: { name: string; team: { name: string } } | null;
}

const statusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  OPEN: { color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: AlertTriangle },
  RESOLVED: { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  BLOCKED: { color: "bg-red-500/15 text-red-700 dark:text-red-400", icon: AlertTriangle },
};

export default function DependenciesPage() {
  const [deps, setDeps] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dependencies")
      .then((r) => r.json())
      .then(setDeps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const open = deps.filter((d) => d.status === "OPEN");
  const resolved = deps.filter((d) => d.status === "RESOLVED");
  const blocked = deps.filter((d) => d.status === "BLOCKED");

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
          <h1 className="text-lg md:text-2xl font-bold">Cross-Team Dependencies</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Track and manage dependencies between teams</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-2 md:p-4">
              <p className="text-[10px] md:text-sm text-muted-foreground">Total</p>
              <p className="text-lg md:text-2xl font-bold">{deps.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <p className="text-[10px] md:text-sm text-muted-foreground">Open</p>
              <p className="text-lg md:text-2xl font-bold text-amber-500">{open.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <p className="text-[10px] md:text-sm text-muted-foreground">Resolved</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-500">{resolved.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <p className="text-[10px] md:text-sm text-muted-foreground">Blocked</p>
              <p className="text-lg md:text-2xl font-bold text-red-500">{blocked.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Dependencies Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] md:text-xs">From</TableHead>
                  <TableHead className="w-8 md:w-10"></TableHead>
                  <TableHead className="text-[10px] md:text-xs">To</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden md:table-cell">Type</TableHead>
                  <TableHead className="text-[10px] md:text-xs">Status</TableHead>
                  <TableHead className="text-[10px] md:text-xs hidden md:table-cell">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 md:py-8 text-[10px] md:text-xs text-muted-foreground">
                      Loading dependencies...
                    </TableCell>
                  </TableRow>
                ) : deps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 md:py-8 text-[10px] md:text-xs text-muted-foreground">
                      No dependencies found
                    </TableCell>
                  </TableRow>
                ) : (
                  deps.map((dep) => {
                    const sc = statusConfig[dep.status] ?? statusConfig.OPEN;
                    const Icon = sc.icon;
                    return (
                      <TableRow key={dep.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[10px] md:text-sm">
                              {dep.fromStory?.team?.name ?? dep.fromFeature?.name ?? "—"}
                            </p>
                            <p className="text-[9px] md:text-xs text-muted-foreground">
                              {dep.fromStory?.name ?? dep.fromFeature?.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[10px] md:text-sm">
                              {dep.toStory?.team?.name ?? dep.toFeature?.name ?? "—"}
                            </p>
                            <p className="text-[9px] md:text-xs text-muted-foreground">
                              {dep.toStory?.name ?? dep.toFeature?.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="text-[9px] md:text-[10px]">{dep.type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1 text-[8px] md:text-[10px]", sc.color)}>
                            <Icon className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            {dep.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-2">
                            {dep.description ?? "—"}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
