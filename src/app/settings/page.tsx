"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Shield, Bell, Palette, Globe, Users, Calendar, Download } from "lucide-react";

const sections = [
  {
    title: "Organization",
    icon: Globe,
    items: [
      { label: "Organization Name", value: "Acme Corporation", status: "Configured" },
      { label: "ART", value: "Platform ART", status: "Active" },
      { label: "Timezone", value: "UTC-5 (Eastern)", status: "Configured" },
      { label: "PI Duration", value: "12 weeks (5 sprints + IP)", status: "Active" },
    ],
  },
  {
    title: "Teams & Members",
    icon: Users,
    items: [
      { label: "Teams", value: "5 active", status: "Active" },
      { label: "Members", value: "30 across all teams", status: "Active" },
      { label: "Roles", value: "RTE, SM, PO, DEV, QA, UX, ARCH", status: "Configured" },
      { label: "Velocity History", value: "5 PI averages", status: "Active" },
    ],
  },
  {
    title: "Sprint Configuration",
    icon: Calendar,
    items: [
      { label: "Sprint Duration", value: "2 weeks", status: "Active" },
      { label: "Sprints per PI", value: "5 + IP sprint", status: "Active" },
      { label: "Current PI", value: "PI 2026.1 (EXECUTING)", status: "Active" },
      { label: "IP Sprint", value: "Planning + Tech Debt + Carry-over", status: "Active" },
    ],
  },
  {
    title: "Database",
    icon: Database,
    items: [
      { label: "Engine", value: "SQLite (Development)", status: "Active" },
      { label: "Features", value: "125 total", status: "Active" },
      { label: "Stories", value: "563 total", status: "Active" },
      { label: "Objectives", value: "20 across 2 PIs", status: "Active" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      { label: "Authentication", value: "NextAuth.js", status: "Enabled" },
      { label: "Session Strategy", value: "JWT", status: "Active" },
      { label: "Password Hashing", value: "bcrypt", status: "Active" },
      { label: "RBAC", value: "Role-based (RTE, SM, PO, DEV)", status: "Enabled" },
    ],
  },
  {
    title: "Features",
    icon: Palette,
    items: [
      { label: "Dark Mode", value: "Enabled (default)", status: "Active" },
      { label: "WSJF Prioritization", value: "Enabled", status: "Active" },
      { label: "Capacity Planning", value: "Enabled", status: "Active" },
      { label: "ROAM Risk Board", value: "Enabled", status: "Active" },
    ],
  },
];

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/15 text-emerald-400",
  Enabled: "bg-blue-500/15 text-blue-400",
  Configured: "bg-amber-500/15 text-amber-400",
};

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <a href="/dashboard" className="text-[10px] md:text-xs text-muted-foreground hover:text-foreground transition-colors">&larr; Back to Dashboard</a>
          <h1 className="text-lg md:text-2xl font-bold">Settings</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">PI Planning Hub configuration</p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader className="pb-2 md:pb-3">
                  <CardTitle className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                    <Icon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3 p-2 md:p-4">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-2">
                      <span className="text-[9px] md:text-xs text-muted-foreground truncate">{item.label}</span>
                      <div className="flex items-center gap-1 md:gap-2 shrink-0">
                        <span className="text-[9px] md:text-xs font-medium truncate">{item.value}</span>
                        <Badge className={cn("text-[8px] md:text-[9px] shrink-0", statusColors[item.status])}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Export */}
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm">Data Export</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              <p className="text-[9px] md:text-xs text-muted-foreground flex-1">
                Export PI planning data for offline analysis or archival.
              </p>
              <button className="flex items-center gap-1.5 md:gap-2 rounded-lg bg-zinc-800 px-2 py-1.5 md:px-4 md:py-2 text-[9px] md:text-xs font-medium hover:bg-zinc-700 transition-colors shrink-0">
                <Download className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Export PI Data
              </button>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="p-2 md:p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-1 md:gap-0 text-[8px] md:text-xs text-muted-foreground">
              <span>PI Planning Hub v1.0.0</span>
              <span>Built with Next.js + Prisma + SQLite</span>
              <span>Demo: SAFe PI Planning Platform</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
