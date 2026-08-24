-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "availableNow" BOOLEAN NOT NULL DEFAULT false,
    "ratingAvg" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Business" ("active", "coverImageUrl", "createdAt", "description", "email", "id", "instagram", "logoUrl", "name", "ownerId", "phone", "ratingAvg", "ratingCount", "slug", "type", "updatedAt", "verified", "website") SELECT "active", "coverImageUrl", "createdAt", "description", "email", "id", "instagram", "logoUrl", "name", "ownerId", "phone", "ratingAvg", "ratingCount", "slug", "type", "updatedAt", "verified", "website" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_ownerId_key" ON "Business"("ownerId");
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
CREATE INDEX "Business_type_idx" ON "Business"("type");
CREATE INDEX "Business_active_verified_idx" ON "Business"("active", "verified");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
