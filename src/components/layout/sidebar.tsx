"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Target,
  Users,
  Calendar,
  AlertTriangle,
  GitBranch,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  ListTodo,
  Trophy,
  Shield,
  LineChart,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "PI Management", href: "/pis", icon: Calendar },
  { label: "Backlog", href: "/backlog", icon: ListTodo },
  { label: "Program Board", href: "/board", icon: FolderKanban },
  { label: "Objectives", href: "/objectives", icon: Target },
  { label: "Dependencies", href: "/dependencies", icon: GitBranch },
  { label: "Risks", href: "/risks", icon: AlertTriangle },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Capacity", href: "/capacity", icon: BarChart3 },
  { label: "Confidence", href: "/confidence", icon: Trophy },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Charts", href: "/charts", icon: LineChart },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Resources", href: "/resources", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Zap className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <span className="ml-2 text-lg font-bold tracking-tight">PI Hub</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
