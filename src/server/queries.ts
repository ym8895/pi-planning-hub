import { prisma } from "@/lib/prisma";

export async function getOrganization() {
  return prisma.organization.findFirst({
    include: {
      arts: {
        include: {
          teams: true,
          pis: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              iterations: { orderBy: { startDate: "asc" } },
              objectives: true,
            },
          },
        },
      },
    },
  });
}

export async function getARTs() {
  return prisma.aRT.findMany({
    include: {
      organization: true,
      teams: true,
      pis: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { iterations: true },
      },
    },
  });
}

export async function getART(artId: string) {
  return prisma.aRT.findUnique({
    where: { id: artId },
    include: {
      organization: true,
      teams: {
        include: {
          members: { include: { user: true } },
          stories: true,
          features: true,
        },
      },
      pis: {
        orderBy: { createdAt: "desc" },
        include: {
          iterations: { orderBy: { startDate: "asc" } },
          objectives: true,
        },
      },
    },
  });
}

export async function getPI(piId: string) {
  return prisma.pI.findUnique({
    where: { id: piId },
    include: {
      art: { include: { teams: true } },
      iterations: { orderBy: { startDate: "asc" } },
      objectives: true,
    },
  });
}

export async function getFeatures(artId: string) {
  return prisma.feature.findMany({
    where: { artId },
    include: {
      ownerTeam: true,
      owner: true,
      stories: true,
      dependenciesAsFrom: true,
      dependenciesAsTo: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStories(artId: string) {
  return prisma.story.findMany({
    where: { feature: { artId } },
    include: {
      feature: true,
      team: true,
      iteration: true,
      owner: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTeams(artId: string) {
  return prisma.team.findMany({
    where: { artId },
    include: {
      members: { include: { user: true } },
      stories: true,
      features: true,
      capacities: { include: { iteration: true } },
    },
  });
}

export async function getDependencies(artId: string) {
  return prisma.dependency.findMany({
    where: {
      OR: [
        { fromFeature: { artId } },
        { toFeature: { artId } },
        { fromStory: { feature: { artId } } },
        { toStory: { feature: { artId } } },
      ],
    },
    include: {
      fromFeature: true,
      toFeature: true,
      fromStory: { include: { team: true } },
      toStory: { include: { team: true } },
    },
  });
}

export async function getObjectives(piId: string) {
  return prisma.objective.findMany({
    where: { piId },
    include: { pi: true },
  });
}

export async function getUsers() {
  return prisma.user.findMany({
    include: { members: true },
    orderBy: { name: "asc" },
  });
}

export async function getDashboardStats(artId: string) {
  const art = await prisma.aRT.findUnique({
    where: { id: artId },
    include: {
      teams: true,
      pis: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          iterations: true,
          objectives: true,
        },
      },
    },
  });

  if (!art) return null;

  const currentPI = art.pis[0];
  if (!currentPI) return { art, features: 0, stories: 0, done: 0, inProgress: 0, blocked: 0, teams: art.teams.length, objectives: 0, completion: 0 };

  const features = await prisma.feature.count({ where: { artId } });
  const stories = await prisma.story.count({ where: { feature: { artId } } });
  const done = await prisma.story.count({ where: { feature: { artId }, status: "DONE" } });
  const inProgress = await prisma.story.count({ where: { feature: { artId }, status: "DOING" } });
  const blocked = await prisma.story.count({ where: { feature: { artId }, status: "BLOCKED" } });

  const objectives = currentPI.objectives.length;
  const avgCompletion = currentPI.objectives.length > 0
    ? currentPI.objectives.reduce((sum, o) => sum + o.completion, 0) / currentPI.objectives.length
    : 0;

  return {
    art,
    currentPI,
    features,
    stories,
    done,
    inProgress,
    blocked,
    teams: art.teams.length,
    objectives,
    completion: avgCompletion,
    velocity: art.teams.reduce((sum, t) => sum + t.velocity, 0),
  };
}
