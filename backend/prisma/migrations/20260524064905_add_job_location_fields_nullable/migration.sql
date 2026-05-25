/*
  Warnings:

  - A unique constraint covering the columns `[job_id,worker_id]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[job_id,worker_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "city" TEXT,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "location_line1" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "attendance_job_id_worker_id_key" ON "attendance"("job_id", "worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_job_id_worker_id_key" ON "payments"("job_id", "worker_id");
