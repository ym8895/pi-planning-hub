"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFeature(data: {
  name: string;
  description?: string;
  artId: string;
  ownerTeamId?: string;
  businessValue?: number;
  timeCriticality?: number;
  riskReduction?: number;
  jobSize?: number;
  priority?: string;
}) {
  const feature = await prisma.feature.create({
    data: {
      name: data.name,
      description: data.description,
      artId: data.artId,
      ownerTeamId: data.ownerTeamId,
      businessValue: data.businessValue ?? 1,
      timeCriticality: data.timeCriticality ?? 1,
      riskReduction: data.riskReduction ?? 1,
      jobSize: data.jobSize ?? 1,
      priority: data.priority ?? "SHOULD",
    },
  });
  revalidatePath("/backlog");
  return feature;
}

export async function updateFeature(
  id: string,
  data: {
    name?: string;
    description?: string;
    ownerTeamId?: string;
    businessValue?: number;
    timeCriticality?: number;
    riskReduction?: number;
    jobSize?: number;
    priority?: string;
    status?: string;
  }
) {
  const feature = await prisma.feature.update({
    where: { id },
    data,
  });
  revalidatePath("/backlog");
  return feature;
}

export async function deleteFeature(id: string) {
  await prisma.feature.delete({ where: { id } });
  revalidatePath("/backlog");
}

export async function createStory(data: {
  name: string;
  description?: string;
  featureId: string;
  teamId?: string;
  iterationId?: string;
  storyPoints?: number;
  ownerId?: string;
}) {
  const story = await prisma.story.create({
    data: {
      name: data.name,
      description: data.description,
      featureId: data.featureId,
      teamId: data.teamId,
      iterationId: data.iterationId,
      storyPoints: data.storyPoints ?? 0,
      ownerId: data.ownerId,
    },
  });
  revalidatePath("/backlog");
  revalidatePath("/board");
  return story;
}

export async function updateStory(
  id: string,
  data: {
    name?: string;
    description?: string;
    teamId?: string;
    iterationId?: string;
    storyPoints?: number;
    status?: string;
    ownerId?: string;
  }
) {
  const story = await prisma.story.update({
    where: { id },
    data,
  });
  revalidatePath("/backlog");
  revalidatePath("/board");
  return story;
}

export async function deleteStory(id: string) {
  await prisma.story.delete({ where: { id } });
  revalidatePath("/backlog");
  revalidatePath("/board");
}

export async function createObjective(data: {
  title: string;
  description?: string;
  piId: string;
  teamId?: string;
  kind?: string;
  businessValue?: number;
}) {
  const objective = await prisma.objective.create({
    data: {
      title: data.title,
      description: data.description,
      piId: data.piId,
      teamId: data.teamId,
      kind: data.kind ?? "COMMITTED",
      businessValue: data.businessValue ?? 0,
    },
  });
  revalidatePath("/objectives");
  return objective;
}

export async function updateObjective(
  id: string,
  data: {
    title?: string;
    description?: string;
    kind?: string;
    businessValue?: number;
    actualValue?: number;
    completion?: number;
  }
) {
  const objective = await prisma.objective.update({
    where: { id },
    data,
  });
  revalidatePath("/objectives");
  return objective;
}

export async function createDependency(data: {
  type?: string;
  description?: string;
  fromStoryId?: string;
  toStoryId?: string;
  fromFeatureId?: string;
  toFeatureId?: string;
}) {
  const dependency = await prisma.dependency.create({
    data: {
      type: data.type ?? "CROSS_TEAM",
      description: data.description,
      fromStoryId: data.fromStoryId,
      toStoryId: data.toStoryId,
      fromFeatureId: data.fromFeatureId,
      toFeatureId: data.toFeatureId,
    },
  });
  revalidatePath("/dependencies");
  revalidatePath("/board");
  return dependency;
}

export async function updateDependency(
  id: string,
  data: {
    status?: string;
    description?: string;
  }
) {
  const dependency = await prisma.dependency.update({
    where: { id },
    data,
  });
  revalidatePath("/dependencies");
  revalidatePath("/board");
  return dependency;
}

export async function createTeam(data: {
  name: string;
  description?: string;
  artId: string;
  velocity?: number;
  color?: string;
}) {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      artId: data.artId,
      velocity: data.velocity ?? 0,
      color: data.color ?? "#6366f1",
    },
  });
  revalidatePath("/teams");
  return team;
}

export async function updateTeam(
  id: string,
  data: {
    name?: string;
    description?: string;
    velocity?: number;
    color?: string;
  }
) {
  const team = await prisma.team.update({
    where: { id },
    data,
  });
  revalidatePath("/teams");
  return team;
}
