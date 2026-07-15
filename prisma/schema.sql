-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iterations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "piId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'SPRINT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iterations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "artId" TEXT NOT NULL,
    "velocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DEV',
    "availabilityPercent" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "benefitHypothesis" TEXT,
    "acceptanceCriteria" TEXT,
    "artId" TEXT NOT NULL,
    "ownerTeamId" TEXT,
    "ownerId" TEXT,
    "businessValue" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "timeCriticality" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "riskReduction" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "jobSize" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "priority" TEXT NOT NULL DEFAULT 'SHOULD',
    "status" TEXT NOT NULL DEFAULT 'BACKLOG',
    "featureType" TEXT NOT NULL DEFAULT 'BUSINESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "acceptanceCriteria" TEXT,
    "featureId" TEXT NOT NULL,
    "teamId" TEXT,
    "iterationId" TEXT,
    "ownerId" TEXT,
    "storyPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "definitionOfReady" BOOLEAN NOT NULL DEFAULT false,
    "definitionOfDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "piId" TEXT NOT NULL,
    "teamId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'COMMITTED',
    "businessValue" INTEGER NOT NULL DEFAULT 0,
    "actualValue" INTEGER NOT NULL DEFAULT 0,
    "completion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependencies" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CROSS_TEAM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "fromStoryId" TEXT,
    "toStoryId" TEXT,
    "fromFeatureId" TEXT,
    "toFeatureId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacities" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "iterationId" TEXT NOT NULL,
    "focusFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "supportPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "meetingsPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "availableHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plannedPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plannedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "utilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overloaded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "capacities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "roam" TEXT NOT NULL DEFAULT 'OPEN',
    "impact" TEXT NOT NULL DEFAULT 'MEDIUM',
    "probability" TEXT NOT NULL DEFAULT 'MEDIUM',
    "mitigation" TEXT,
    "ownerId" TEXT,
    "teamId" TEXT,
    "piId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confidence_votes" (
    "id" TEXT NOT NULL,
    "piId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "voterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confidence_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "arts_organizationId_idx" ON "arts"("organizationId");

-- CreateIndex
CREATE INDEX "pis_artId_idx" ON "pis"("artId");

-- CreateIndex
CREATE INDEX "iterations_piId_idx" ON "iterations"("piId");

-- CreateIndex
CREATE INDEX "teams_artId_idx" ON "teams"("artId");

-- CreateIndex
CREATE INDEX "members_teamId_idx" ON "members"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "members_userId_teamId_key" ON "members"("userId", "teamId");

-- CreateIndex
CREATE INDEX "features_artId_idx" ON "features"("artId");

-- CreateIndex
CREATE INDEX "features_ownerTeamId_idx" ON "features"("ownerTeamId");

-- CreateIndex
CREATE INDEX "stories_featureId_idx" ON "stories"("featureId");

-- CreateIndex
CREATE INDEX "stories_teamId_idx" ON "stories"("teamId");

-- CreateIndex
CREATE INDEX "stories_iterationId_idx" ON "stories"("iterationId");

-- CreateIndex
CREATE INDEX "objectives_piId_idx" ON "objectives"("piId");

-- CreateIndex
CREATE INDEX "objectives_teamId_idx" ON "objectives"("teamId");

-- CreateIndex
CREATE INDEX "holidays_organizationId_idx" ON "holidays"("organizationId");

-- CreateIndex
CREATE INDEX "leaves_memberId_idx" ON "leaves"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "capacities_teamId_iterationId_key" ON "capacities"("teamId", "iterationId");

-- CreateIndex
CREATE INDEX "risks_piId_idx" ON "risks"("piId");

-- CreateIndex
CREATE INDEX "risks_teamId_idx" ON "risks"("teamId");

-- CreateIndex
CREATE INDEX "confidence_votes_piId_teamId_idx" ON "confidence_votes"("piId", "teamId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arts" ADD CONSTRAINT "arts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pis" ADD CONSTRAINT "pis_artId_fkey" FOREIGN KEY ("artId") REFERENCES "arts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iterations" ADD CONSTRAINT "iterations_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_artId_fkey" FOREIGN KEY ("artId") REFERENCES "arts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_ownerTeamId_fkey" FOREIGN KEY ("ownerTeamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "iterations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_fromStoryId_fkey" FOREIGN KEY ("fromStoryId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_toStoryId_fkey" FOREIGN KEY ("toStoryId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_fromFeatureId_fkey" FOREIGN KEY ("fromFeatureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencies" ADD CONSTRAINT "dependencies_toFeatureId_fkey" FOREIGN KEY ("toFeatureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacities" ADD CONSTRAINT "capacities_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacities" ADD CONSTRAINT "capacities_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "iterations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confidence_votes" ADD CONSTRAINT "confidence_votes_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confidence_votes" ADD CONSTRAINT "confidence_votes_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confidence_votes" ADD CONSTRAINT "confidence_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

