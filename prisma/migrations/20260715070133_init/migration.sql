-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_features" (
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
    "featureType" TEXT NOT NULL DEFAULT 'BUSINESS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "features_ownerTeamId_fkey" FOREIGN KEY ("ownerTeamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "features_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_features" ("acceptanceCriteria", "artId", "benefitHypothesis", "businessValue", "createdAt", "description", "id", "jobSize", "name", "ownerId", "ownerTeamId", "priority", "riskReduction", "status", "timeCriticality", "updatedAt") SELECT "acceptanceCriteria", "artId", "benefitHypothesis", "businessValue", "createdAt", "description", "id", "jobSize", "name", "ownerId", "ownerTeamId", "priority", "riskReduction", "status", "timeCriticality", "updatedAt" FROM "features";
DROP TABLE "features";
ALTER TABLE "new_features" RENAME TO "features";
CREATE INDEX "features_artId_idx" ON "features"("artId");
CREATE INDEX "features_ownerTeamId_idx" ON "features"("ownerTeamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
