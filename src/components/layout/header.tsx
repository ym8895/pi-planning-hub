"use client";

import { Shield, LogOut, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ARTSelector } from "@/components/art-selector";
import { RoleSwitcher } from "@/components/role-switcher";
import { useTheme } from "@/lib/theme-provider";

export function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="flex h-12 md:h-14 items-center justify-between border-b bg-background px-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-4 pl-10 md:pl-0">
        <h1 className="text-sm md:text-lg font-semibold hidden sm:block">PI Planning Hub</h1>
        <ARTSelector />
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <RoleSwitcher />
        <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hidden md:flex">
          <User className="h-4 w-4" />
          <span>admin@pihub.dev</span>
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
