-- AlterTable
ALTER TABLE "Business" ADD COLUMN "availableNowUntil" DATETIME;

-- CreateTable
CREATE TABLE "BusinessCustomer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessCustomer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockedSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "staffId" TEXT,
    "date" DATETIME NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'CUSTOM',
    "label" TEXT,
    "repeatWeekly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BlockedSlot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BlockedSlot_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "BusinessStaff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT,
    "businessCustomerId" TEXT,
    "serviceId" TEXT NOT NULL,
    "staffId" TEXT,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "groupId" TEXT,
    "paymentMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_businessCustomerId_fkey" FOREIGN KEY ("businessCustomerId") REFERENCES "BusinessCustomer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "BusinessStaff" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("businessId", "createdAt", "customerId", "date", "endTime", "id", "notes", "price", "serviceId", "staffId", "startTime", "status", "updatedAt") SELECT "businessId", "createdAt", "customerId", "date", "endTime", "id", "notes", "price", "serviceId", "staffId", "startTime", "status", "updatedAt" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE INDEX "Appointment_businessId_date_idx" ON "Appointment"("businessId", "date");
CREATE INDEX "Appointment_staffId_date_idx" ON "Appointment"("staffId", "date");
CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");
CREATE INDEX "Appointment_businessCustomerId_idx" ON "Appointment"("businessCustomerId");
CREATE INDEX "Appointment_groupId_idx" ON "Appointment"("groupId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BusinessCustomer_businessId_idx" ON "BusinessCustomer"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessCustomer_businessId_phone_key" ON "BusinessCustomer"("businessId", "phone");

-- CreateIndex
CREATE INDEX "BlockedSlot_businessId_date_idx" ON "BlockedSlot"("businessId", "date");

-- CreateIndex
CREATE INDEX "BlockedSlot_staffId_date_idx" ON "BlockedSlot"("staffId", "date");

-- CreateIndex
CREATE INDEX "BlockedSlot_businessId_dayOfWeek_idx" ON "BlockedSlot"("businessId", "dayOfWeek");
