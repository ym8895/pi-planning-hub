"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFeature, updateFeature, deleteFeature } from "@/server/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
  color: string;
}

interface Feature {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  businessValue: number;
  timeCriticality: number;
  riskReduction: number;
  jobSize: number;
  ownerTeamId: string | null;
  artId: string;
  featureType: string;
}

const featureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  ownerTeamId: z.string().optional(),
  businessValue: z.number().min(1).max(10),
  timeCriticality: z.number().min(1).max(10),
  riskReduction: z.number().min(1).max(10),
  jobSize: z.number().min(1).max(10),
  priority: z.string(),
  status: z.string(),
  featureType: z.string(),
});

type FeatureFormData = z.infer<typeof featureSchema>;

interface FeatureFormProps {
  open: boolean;
  onClose: () => void;
  feature?: Feature | null;
  artId: string;
  teams: Team[];
  onSaved: () => void;
}

export function FeatureForm({ open, onClose, feature, artId, teams, onSaved }: FeatureFormProps) {
  const isEdit = !!feature;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: "",
      description: "",
      ownerTeamId: "",
      businessValue: 5,
      timeCriticality: 5,
      riskReduction: 5,
      jobSize: 5,
      priority: "SHOULD",
      status: "BACKLOG",
      featureType: "BUSINESS",
    },
  });

  useEffect(() => {
    if (open) {
      if (feature) {
        reset({
          name: feature.name,
          description: feature.description ?? "",
          ownerTeamId: feature.ownerTeamId ?? "",
          businessValue: feature.businessValue,
          timeCriticality: feature.timeCriticality,
          riskReduction: feature.riskReduction,
          jobSize: feature.jobSize,
          priority: feature.priority,
          status: feature.status,
          featureType: feature.featureType ?? "BUSINESS",
        });
      } else {
        reset({
          name: "",
          description: "",
          ownerTeamId: "",
          businessValue: 5,
          timeCriticality: 5,
          riskReduction: 5,
          jobSize: 5,
          priority: "SHOULD",
          status: "BACKLOG",
          featureType: "BUSINESS",
        });
      }
    }
  }, [open, feature, reset]);

  const bv = watch("businessValue");
  const tc = watch("timeCriticality");
  const rr = watch("riskReduction");
  const js = watch("jobSize");
  const wsjf = js > 0 ? ((bv + tc + rr) / js).toFixed(1) : "0";

  const onSubmit = async (data: FeatureFormData) => {
    try {
      if (isEdit) {
        await updateFeature(feature.id, {
          ...data,
          ownerTeamId: data.ownerTeamId || undefined,
        });
      } else {
        await createFeature({
          ...data,
          artId,
          ownerTeamId: data.ownerTeamId || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error("Feature save error:", e);
    }
  };

  const handleDelete = async () => {
    if (!feature) return;
    try {
      await deleteFeature(feature.id);
      onSaved();
      onClose();
    } catch (e) {
      console.error("Feature delete error:", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Feature" : "Create Feature"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update feature details and WSJF scores." : "Add a new feature to the program backlog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} placeholder="Feature name" />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Business value hypothesis..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Team</Label>
              <Select value={watch("ownerTeamId") || "__none__"} onValueChange={(v) => setValue("ownerTeamId", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={watch("priority")} onValueChange={(v) => setValue("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MUST">Must Have</SelectItem>
                  <SelectItem value="SHOULD">Should Have</SelectItem>
                  <SelectItem value="COULD">Could Have</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BACKLOG">Backlog</SelectItem>
                <SelectItem value="REFINING">Refining</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Feature Type</Label>
            <Select value={watch("featureType")} onValueChange={(v) => setValue("featureType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BUSINESS">Business Feature</SelectItem>
                <SelectItem value="ENABLER">Enabler</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">WSJF Inputs</Label>
              <span className="text-sm font-bold text-indigo-400">WSJF: {wsjf}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "businessValue" as const, label: "Business Value (BV)", color: "text-blue-400" },
                { key: "timeCriticality" as const, label: "Time Criticality (TC)", color: "text-amber-400" },
                { key: "riskReduction" as const, label: "Risk Reduction (RR)", color: "text-emerald-400" },
                { key: "jobSize" as const, label: "Job Size (JS)", color: "text-violet-400" },
              ].map(({ key, label, color }) => (
                <div key={key} className="space-y-1">
                  <Label className={`text-xs ${color}`}>{label}</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    {...register(key, { valueAsNumber: true })}
                    className="h-8 text-center text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm" className="mr-auto gap-1">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Feature?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{feature.name}&rdquo; and all its stories. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Feature"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
