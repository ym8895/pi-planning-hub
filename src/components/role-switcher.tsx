"use client";

import { useRole, type UserRole } from "@/lib/role-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<UserRole, { label: string; color: string }> = {
  ADMIN: { label: "Admin", color: "bg-purple-500/15 text-purple-400" },
  RTE: { label: "RTE", color: "bg-red-500/15 text-red-400" },
  SM: { label: "Scrum Master", color: "bg-blue-500/15 text-blue-400" },
  PO: { label: "Product Owner", color: "bg-amber-500/15 text-amber-400" },
  DEV: { label: "Developer", color: "bg-emerald-500/15 text-emerald-400" },
  QA: { label: "QA Engineer", color: "bg-cyan-500/15 text-cyan-400" },
  ARCH: { label: "Architect", color: "bg-violet-500/15 text-violet-400" },
  PM: { label: "Program Manager", color: "bg-pink-500/15 text-pink-400" },
};

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const cfg = roleLabels[role];

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roleLabels).map(([key, val]) => (
            <SelectItem key={key} value={key} className="text-xs">
              {val.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Badge className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
    </div>
  );
}
