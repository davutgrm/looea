-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL DEFAULT 'Merkez',
    "country" TEXT NOT NULL DEFAULT 'Türkiye',
    "postalCode" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    CONSTRAINT "BusinessLocation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BusinessLocation" ("address", "businessId", "city", "country", "id", "latitude", "longitude", "postalCode") SELECT "address", "businessId", "city", "country", "id", "latitude", "longitude", "postalCode" FROM "BusinessLocation";
DROP TABLE "BusinessLocation";
ALTER TABLE "new_BusinessLocation" RENAME TO "BusinessLocation";
CREATE UNIQUE INDEX "BusinessLocation_businessId_key" ON "BusinessLocation"("businessId");
CREATE INDEX "BusinessLocation_city_idx" ON "BusinessLocation"("city");
CREATE INDEX "BusinessLocation_city_district_idx" ON "BusinessLocation"("city", "district");
CREATE INDEX "BusinessLocation_latitude_longitude_idx" ON "BusinessLocation"("latitude", "longitude");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
