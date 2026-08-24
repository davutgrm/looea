-- AlterTable
ALTER TABLE "User" ADD COLUMN "segment" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "serves" TEXT NOT NULL DEFAULT 'UNISEX',
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
INSERT INTO "new_Business" ("active", "availableNow", "coverImageUrl", "createdAt", "description", "email", "id", "instagram", "logoUrl", "name", "ownerId", "phone", "ratingAvg", "ratingCount", "slug", "type", "updatedAt", "verified", "website") SELECT "active", "availableNow", "coverImageUrl", "createdAt", "description", "email", "id", "instagram", "logoUrl", "name", "ownerId", "phone", "ratingAvg", "ratingCount", "slug", "type", "updatedAt", "verified", "website" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_ownerId_key" ON "Business"("ownerId");
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
CREATE INDEX "Business_type_idx" ON "Business"("type");
CREATE INDEX "Business_active_verified_idx" ON "Business"("active", "verified");
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "serves" TEXT NOT NULL DEFAULT 'UNISEX',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Category" ("active", "createdAt", "group", "id", "name", "order", "slug") SELECT "active", "createdAt", "group", "id", "name", "order", "slug" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_group_order_idx" ON "Category"("group", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
