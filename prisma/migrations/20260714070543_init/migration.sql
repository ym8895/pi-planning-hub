-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "arts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "arts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "artId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pis_artId_fkey" FOREIGN KEY ("artId") REFERENCES "arts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "iterations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "piId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'SPRINT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "iterations_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "artId" TEXT NOT NULL,
    "velocity" REAL NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teams_artId_fkey" FOREIGN KEY ("artId") REFERENCES "arts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DEV',
    "availabilityPercent" REAL NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "benefitHypothesis" TEXT,
    "acceptanceCriteria" TEXT,
    "artId" TEXT NOT NULL,
    "ownerTeamId" TEXT,
    "ownerId" TEXT,
    "businessValue" REAL NOT NULL DEFAULT 1,
    "timeCriticality" REAL NOT NULL DEFAULT 1,
    "riskReduction" REAL NOT NULL DEFAULT 1,
    "jobSize" REAL NOT NULL DEFAULT 1,
    "priority" TEXT NOT NULL DEFAULT 'SHOULD',
    "status" TEXT NOT NULL DEFAULT 'BACKLOG',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "features_ownerTeamId_fkey" FOREIGN KEY ("ownerTeamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "features_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "acceptanceCriteria" TEXT,
    "featureId" TEXT NOT NULL,
    "teamId" TEXT,
    "iterationId" TEXT,
    "ownerId" TEXT,
    "storyPoints" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "definitionOfReady" BOOLEAN NOT NULL DEFAULT false,
    "definitionOfDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stories_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stories_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stories_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "iterations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stories_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "piId" TEXT NOT NULL,
    "teamId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'COMMITTED',
    "businessValue" INTEGER NOT NULL DEFAULT 0,
    "actualValue" INTEGER NOT NULL DEFAULT 0,
    "completion" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "objectives_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dependencies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'CROSS_TEAM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "fromStoryId" TEXT,
    "toStoryId" TEXT,
    "fromFeatureId" TEXT,
    "toFeatureId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dependencies_fromStoryId_fkey" FOREIGN KEY ("fromStoryId") REFERENCES "stories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dependencies_toStoryId_fkey" FOREIGN KEY ("toStoryId") REFERENCES "stories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dependencies_fromFeatureId_fkey" FOREIGN KEY ("fromFeatureId") REFERENCES "features" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dependencies_toFeatureId_fkey" FOREIGN KEY ("toFeatureId") REFERENCES "features" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "holidays_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leaves_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "capacities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "iterationId" TEXT NOT NULL,
    "focusFactor" REAL NOT NULL DEFAULT 0.8,
    "supportPercent" REAL NOT NULL DEFAULT 0.1,
    "meetingsPercent" REAL NOT NULL DEFAULT 0.1,
    "availableHours" REAL NOT NULL DEFAULT 0,
    "plannedPoints" REAL NOT NULL DEFAULT 0,
    "plannedHours" REAL NOT NULL DEFAULT 0,
    "remainingHours" REAL NOT NULL DEFAULT 0,
    "utilization" REAL NOT NULL DEFAULT 0,
    "overloaded" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "capacities_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "capacities_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "iterations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
