-- DropIndex
DROP INDEX "StaffSchedule_staffId_dayOfWeek_key";

-- CreateIndex
CREATE INDEX "StaffSchedule_staffId_dayOfWeek_idx" ON "StaffSchedule"("staffId", "dayOfWeek");
