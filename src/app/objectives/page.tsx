"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Objective {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  businessValue: number;
  actualValue: number;
  completion: number;
  teamId: string | null;
}

interface ObjectiveData {
  pi: { name: string } | null;
  objectives: Objective[];
}

export default function ObjectivesPage() {
  const [data, setData] = useState<ObjectiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/objectives")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const objectives = data?.objectives ?? [];
  const committed = objectives.filter((o) => o.kind === "COMMITTED");
  const stretch = objectives.filter((o) => o.kind === "STRETCH");
  const avgCompletion = objectives.length > 0
    ? objectives.reduce((sum, o) => sum + o.completion, 0) / objectives.length
    : 0;
  const totalBV = objectives.reduce((sum, o) => sum + o.businessValue, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <a href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
          <h1 className="text-2xl font-bold">PI Objectives</h1>
          <p className="text-muted-foreground">{data?.pi?.name ?? "No PI"} — Committed & Stretch goals</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Objectives</p>
              <p className="text-2xl font-bold">{objectives.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Committed</p>
              <p className="text-2xl font-bold">{committed.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Stretch</p>
              <p className="text-2xl font-bold">{stretch.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Business Value</p>
              <p className="text-2xl font-bold">{totalBV}</p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Overall PI Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={avgCompletion} className="flex-1" />
              <span className="text-2xl font-bold">{Math.round(avgCompletion)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Objectives Table */}
        <Card>
          <CardHeader>
            <CardTitle>Objectives</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Objective</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Business Value</TableHead>
                <TableHead className="text-right">Actual Value</TableHead>
                <TableHead className="w-48">Completion</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading objectives...
                  </TableCell>
                </TableRow>
              ) : objectives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No objectives found
                  </TableCell>
                </TableRow>
              ) : (
                objectives.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{o.title}</p>
                        {o.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {o.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={o.kind === "COMMITTED" ? "default" : "warning"}>
                        {o.kind === "COMMITTED" ? (
                          <Star className="h-3 w-3 mr-1" />
                        ) : (
                          <Trophy className="h-3 w-3 mr-1" />
                        )}
                        {o.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{o.businessValue}</TableCell>
                    <TableCell className="text-right">{o.actualValue || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={o.completion} className="flex-1" />
                        <span className="text-sm font-medium w-10 text-right">
                          {Math.round(o.completion)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={cn(
                          o.completion >= 80
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : o.completion >= 40
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            : "bg-red-500/15 text-red-700 dark:text-red-400"
                        )}
                      >
                        {o.completion >= 80 ? "On Track" : o.completion >= 40 ? "At Risk" : "Behind"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
}
