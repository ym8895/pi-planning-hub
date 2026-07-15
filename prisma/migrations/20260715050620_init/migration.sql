-- CreateTable
CREATE TABLE "risks" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "risks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "members" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "risks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "risks_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "confidence_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "piId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "voterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "confidence_votes_piId_fkey" FOREIGN KEY ("piId") REFERENCES "pis" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "confidence_votes_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "confidence_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "risks_piId_idx" ON "risks"("piId");

-- CreateIndex
CREATE INDEX "risks_teamId_idx" ON "risks"("teamId");

-- CreateIndex
CREATE INDEX "confidence_votes_piId_teamId_idx" ON "confidence_votes"("piId", "teamId");
