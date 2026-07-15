"use client";

import { RoleProvider } from "@/lib/role-context";
import { CacheProvider } from "@/lib/cache-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <RoleProvider>{children}</RoleProvider>
    </CacheProvider>
  );
}
