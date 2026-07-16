"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ART {
  id: string;
  name: string;
  description: string | null;
  organization: { name: string };
  teams: { id: string; name: string; color: string; velocity: number }[];
  _count: { teams: number; pis: number };
}

interface ARTSelectorProps {
  onARTChange?: (artId: string) => void;
}

export function ARTSelector({ onARTChange }: ARTSelectorProps) {
  const [arts, setArts] = useState<ART[]>([]);
  const [selectedART, setSelectedART] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/arts")
      .then((r) => r.json())
      .then((data) => {
        setArts(data.arts ?? []);
        if (data.art) setSelectedART(data.art.id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (value: string) => {
    setSelectedART(value);
    if (onARTChange) onARTChange(value);
    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedART", value);
    }
  };

  const currentART = arts.find((a) => a.id === selectedART);

  if (loading) return <div className="h-8 w-48 bg-muted rounded animate-pulse" />;
  if (arts.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedART} onValueChange={handleChange}>
        <SelectTrigger className="h-8 w-56 text-xs">
          <SelectValue placeholder="Select ART" />
        </SelectTrigger>
        <SelectContent>
          {arts.map((art) => (
            <SelectItem key={art.id} value={art.id} className="text-xs">
              <div className="flex items-center gap-2">
                <span>{art.name}</span>
                <Badge variant="outline" className="text-[9px] ml-auto">
                  {art._count.teams} teams
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentART && (
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          {currentART.organization.name}
        </span>
      )}
    </div>
  );
}
