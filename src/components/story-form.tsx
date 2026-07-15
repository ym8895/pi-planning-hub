"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createStory, updateStory, deleteStory } from "@/server/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface Feature { id: string; name: string; }
interface Team { id: string; name: string; color: string; }
interface Iteration { id: string; name: string; kind: string; }
interface Member { id: string; teamId: string; user: { name: string }; role: string; }
interface Story {
  id: string;
  name: string;
  description: string | null;
  acceptanceCriteria: string | null;
  featureId: string;
  teamId: string | null;
  iterationId: string | null;
  storyPoints: number;
  status: string;
  ownerId: string | null;
}

const storySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
  featureId: z.string().min(1, "Feature is required"),
  teamId: z.string().optional(),
  iterationId: z.string().optional(),
  storyPoints: z.number().min(0).max(100),
  status: z.string(),
  ownerId: z.string().optional(),
});

type StoryFormData = z.infer<typeof storySchema>;

interface StoryFormProps {
  open: boolean;
  onClose: () => void;
  story?: Story | null;
  featureId?: string;
  teamId?: string;
  iterationId?: string;
  features: Feature[];
  teams: Team[];
  iterations: Iteration[];
  members: Member[];
  onSaved: () => void;
}

export function StoryForm({
  open, onClose, story, featureId: preFeatureId, teamId: preTeamId, iterationId: preIterId,
  features, teams, iterations, members, onSaved
}: StoryFormProps) {
  const isEdit = !!story;

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      name: "",
      description: "",
      acceptanceCriteria: "",
      featureId: "",
      teamId: "",
      iterationId: "",
      storyPoints: 3,
      status: "TODO",
      ownerId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (story) {
        reset({
          name: story.name,
          description: story.description ?? "",
          acceptanceCriteria: story.acceptanceCriteria ?? "",
          featureId: story.featureId,
          teamId: story.teamId ?? "",
          iterationId: story.iterationId ?? "",
          storyPoints: story.storyPoints,
          status: story.status,
          ownerId: story.ownerId ?? "",
        });
      } else {
        reset({
          name: "",
          description: "",
          acceptanceCriteria: "",
          featureId: preFeatureId ?? "",
          teamId: preTeamId ?? "",
          iterationId: preIterId ?? "",
          storyPoints: 3,
          status: "TODO",
          ownerId: "",
        });
      }
    }
  }, [open, story, preFeatureId, preTeamId, preIterId, reset]);

  const onSubmit = async (data: StoryFormData) => {
    try {
      if (isEdit) {
        await updateStory(story.id, {
          name: data.name,
          description: data.description || undefined,
          teamId: data.teamId || undefined,
          iterationId: data.iterationId || undefined,
          storyPoints: data.storyPoints,
          status: data.status,
          ownerId: data.ownerId || undefined,
        });
      } else {
        await createStory({
          name: data.name,
          description: data.description || undefined,
          featureId: data.featureId,
          teamId: data.teamId || undefined,
          iterationId: data.iterationId || undefined,
          storyPoints: data.storyPoints,
          ownerId: data.ownerId || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      console.error("Story save error:", e);
    }
  };

  const handleDelete = async () => {
    if (!story) return;
    try {
      await deleteStory(story.id);
      onSaved();
      onClose();
    } catch (e) {
      console.error("Story delete error:", e);
    }
  };

  const currentTeamId = watch("teamId");
  const teamMembers = currentTeamId ? members.filter(m => m.teamId === currentTeamId || m.role === "RTE") : members;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Story" : "Create Story"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update story details." : "Add a new story to a feature."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} placeholder="Story name" />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Feature *</Label>
              <Select value={watch("featureId")} onValueChange={(v) => setValue("featureId", v)}>
                <SelectTrigger><SelectValue placeholder="Select feature" /></SelectTrigger>
                <SelectContent>
                  {features.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.featureId && <p className="text-xs text-red-400">{errors.featureId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Story Points</Label>
              <Input type="number" min={0} max={100} {...register("storyPoints", { valueAsNumber: true })} className="text-center" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Team</Label>
              <Select value={watch("teamId") || "__none__"} onValueChange={(v) => setValue("teamId", v === "__none__" ? "" : v)}>
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
              <Label>Sprint</Label>
              <Select value={watch("iterationId") || "__none__"} onValueChange={(v) => setValue("iterationId", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Unscheduled" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unscheduled</SelectItem>
                  {iterations.map(it => (
                    <SelectItem key={it.id} value={it.id}>{it.name} ({it.kind})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="DOING">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={watch("ownerId") || "__none__"} onValueChange={(v) => setValue("ownerId", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {teamMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.user.name} ({m.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} placeholder="What does this story do?" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
            <Textarea id="acceptanceCriteria" {...register("acceptanceCriteria")} placeholder="Given... When... Then..." rows={3} />
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
                    <AlertDialogTitle>Delete Story?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{story.name}&rdquo;. This action cannot be undone.
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
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Story"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
