"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CapacityData {
  id: string;
  iterationId: string;
  focusFactor: number;
  supportPercent: number;
  meetingsPercent: number;
  availableHours: number;
  plannedPoints: number;
  plannedHours: number;
  utilization: number;
  overloaded: boolean;
  iteration: { name: string };
}

interface CapacityFormProps {
  open: boolean;
  onClose: () => void;
  capacity: CapacityData | null;
  teamName: string;
  teamColor: string;
  teamVelocity: number;
  onSaved: () => void;
}

const schema = z.object({
  plannedPoints: z.number().min(0).max(200),
  plannedHours: z.number().min(0).max(500),
  focusFactor: z.number().min(0.3).max(1.0),
  supportPercent: z.number().min(0).max(0.5),
  meetingsPercent: z.number().min(0).max(0.5),
});

type FormData = z.infer<typeof schema>;

export function CapacityForm({ open, onClose, capacity, teamName, teamColor, teamVelocity, onSaved }: CapacityFormProps) {
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      plannedPoints: 0,
      plannedHours: 0,
      focusFactor: 0.8,
      supportPercent: 0.1,
      meetingsPercent: 0.1,
    },
  });

  useEffect(() => {
    if (open && capacity) {
      reset({
        plannedPoints: capacity.plannedPoints,
        plannedHours: capacity.plannedHours,
        focusFactor: capacity.focusFactor,
        supportPercent: capacity.supportPercent,
        meetingsPercent: capacity.meetingsPercent,
      });
    }
  }, [open, capacity, reset]);

  const ff = watch("focusFactor");
  const sp = watch("supportPercent");
  const mp = watch("meetingsPercent");
  const pp = watch("plannedPoints");
  const ph = watch("plannedHours");
  const util = capacity && capacity.availableHours > 0 ? ph / capacity.availableHours : 0;
  const ptsPerSprint = Math.round(teamVelocity / 5);

  const onSubmit = async (data: FormData) => {
    if (!capacity) return;
    try {
      await fetch("/api/capacity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: capacity.id, ...data }),
      });
      onSaved();
      onClose();
    } catch (e) {
      console.error("Capacity save error:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: teamColor }} />
            {teamName} — {capacity?.iteration.name ?? "Sprint"}
          </DialogTitle>
          <DialogDescription>
            Set capacity allocation for this sprint. Avg velocity: {ptsPerSprint} pts/sprint.
          </DialogDescription>
        </DialogHeader>

        {capacity && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Hours</span>
                <span className="font-medium">{capacity.availableHours}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stories Committed</span>
                <span className="font-medium">{capacity.plannedPoints} pts</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Planned Story Points</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  {...register("plannedPoints", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">Target: {ptsPerSprint} pts based on team velocity</p>
              </div>

              <div className="space-y-2">
                <Label>Planned Hours</Label>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  {...register("plannedHours", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Focus Factor</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(ff * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  {...register("focusFactor", { valueAsNumber: true })}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Support %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={0.5}
                    step={0.05}
                    {...register("supportPercent", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meetings %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={0.5}
                    step={0.05}
                    {...register("meetingsPercent", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Utilization</span>
                  <span className={cn(
                    "text-sm font-medium",
                    util > 1 ? "text-red-500" : util > 0.85 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {Math.round(util * 100)}%
                  </span>
                </div>
                <Progress value={Math.min(util * 100, 100)} />
                {util > 1 && (
                  <p className="text-xs text-red-500">Over capacity by {Math.round((util - 1) * 100)}%</p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Capacity"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
