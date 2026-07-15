"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "RTE" | "SM" | "PO" | "DEV" | "QA" | "ARCH" | "PM" | "ADMIN";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isRTE: boolean;
  isSM: boolean;
  isPO: boolean;
  isDevTeam: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: "ADMIN",
  setRole: () => {},
  isRTE: false,
  isSM: false,
  isPO: false,
  isDevTeam: false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("ADMIN");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("userRole") as UserRole : null;
    if (saved) setRoleState(saved);
  }, []);

  const setRole = (r: UserRole) => {
    setRoleState(r);
    if (typeof window !== "undefined") localStorage.setItem("userRole", r);
  };

  return (
    <RoleContext.Provider value={{
      role,
      setRole,
      isRTE: role === "RTE" || role === "ADMIN",
      isSM: role === "SM" || role === "ADMIN",
      isPO: role === "PO" || role === "ADMIN",
      isDevTeam: ["DEV", "QA", "ARCH"].includes(role) || role === "ADMIN",
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
