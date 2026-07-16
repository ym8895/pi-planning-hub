"use client";

import { RoleProvider } from "@/lib/role-context";
import { CacheProvider } from "@/lib/cache-provider";
import { ThemeProvider } from "@/lib/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CacheProvider>
        <RoleProvider>{children}</RoleProvider>
      </CacheProvider>
    </ThemeProvider>
  );
}
