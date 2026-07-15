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
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useCache } from "@/lib/cache-provider";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  api?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, api: "/api/dashboard" },
  { label: "PI Management", href: "/pis", icon: Calendar, api: "/api/pis" },
  { label: "Backlog", href: "/backlog", icon: ListTodo, api: "/api/features" },
  { label: "Program Board", href: "/board", icon: FolderKanban, api: "/api/board" },
  { label: "Objectives", href: "/objectives", icon: Target, api: "/api/objectives" },
  { label: "Dependencies", href: "/dependencies", icon: GitBranch, api: "/api/dependencies" },
  { label: "Risks", href: "/risks", icon: AlertTriangle, api: "/api/risks" },
  { label: "Teams", href: "/teams", icon: Users, api: "/api/teams" },
  { label: "Capacity", href: "/capacity", icon: BarChart3, api: "/api/capacity" },
  { label: "Confidence", href: "/confidence", icon: Trophy, api: "/api/confidence" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, api: "/api/analytics" },
  { label: "Charts", href: "/charts", icon: BarChart3, api: "/api/charts" },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Resources", href: "/resources", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cache = useCache();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const prefetch = useCallback((api?: string) => {
    if (!api) return;
    cache.prefetch(api, () => fetch(api).then(r => r.json()));
  }, [cache]);

  const renderNav = (items: NavItem[], vertical = false) =>
    items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
      return (
        <Link
          key={item.href}
          href={item.href}
          onMouseEnter={() => prefetch(item.api)}
          onFocus={() => prefetch(item.api)}
          className={cn(
            vertical
              ? "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              : "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            isActive
              ? "bg-indigo-500/20 text-indigo-400"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          )}
          title={collapsed ? item.label : undefined}
        >
          <item.icon className={cn(vertical ? "h-4 w-4" : "h-3.5 w-3.5", "shrink-0")} />
          {(vertical || !collapsed) && <span>{item.label}</span>}
        </Link>
      );
    });

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-zinc-800 border border-zinc-700 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
              <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-400" />
                  <span className="font-bold">PI Hub</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                {renderNav(navItems, true)}
              </nav>
            </aside>
          </div>
        )}
      </>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-zinc-800 bg-zinc-900 transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex h-12 items-center border-b border-zinc-800 px-3">
        <Zap className="h-5 w-5 shrink-0 text-indigo-400" />
        {!collapsed && <span className="ml-2 font-bold text-sm">PI Hub</span>}
      </div>
      <nav className="flex-1 space-y-0.5 p-1.5 overflow-y-auto">
        {renderNav(navItems)}
      </nav>
      <div className="border-t border-zinc-800 p-1.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
