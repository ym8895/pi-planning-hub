"use client";

import { Shield, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ARTSelector } from "@/components/art-selector";
import { RoleSwitcher } from "@/components/role-switcher";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">PI Planning Hub</h1>
        <ARTSelector />
      </div>
      <div className="flex items-center gap-3">
        <RoleSwitcher />
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">admin@pihub.dev</span>
        </Button>
        <Button variant="ghost" size="icon">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
