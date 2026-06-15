/*
  Warnings:

  - The values [SUCCESS,FAILED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `payment_status` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[job_id,from_user_id,to_user_id]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TEMP_BLOCKED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEFT_EARLY', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum enum_value
    JOIN pg_type enum_type ON enum_type.oid = enum_value.enumtypid
    WHERE enum_type.typname = 'JobApplicationStatus'
      AND enum_value.enumlabel = 'COMPLETED'
  ) THEN
    ALTER TYPE "JobApplicationStatus" ADD VALUE 'COMPLETED';
  END IF;
END $$;

-- AlterEnum
BEGIN;
DO $$
BEGIN
  CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'DISPUTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE "public"."payments" ALTER COLUMN "payment_status" DROP DEFAULT;
    ALTER TABLE "public"."payments" RENAME COLUMN "payment_status" TO "status";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE "public"."payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING (
      CASE "status"::text
        WHEN 'SUCCESS' THEN 'COMPLETED'
        WHEN 'FAILED' THEN 'DISPUTED'
        ELSE 'PENDING'
      END
    )::"PaymentStatus_new";
    ALTER TABLE "public"."payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus_new') THEN
    ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus_old') THEN
    DROP TYPE "public"."PaymentStatus_old";
  END IF;
END $$;
COMMIT;

-- AlterTable
ALTER TABLE "attendance" ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT';

-- AlterTable
ALTER TABLE "job_applications" ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "selected_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "employer_confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "worker_confirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "workers" ADD COLUMN IF NOT EXISTS "reliability_score" DOUBLE PRECISION NOT NULL DEFAULT 100;

-- CreateTable
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "disputes" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "raised_by_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ratings_job_id_from_user_id_to_user_id_key" ON "ratings"("job_id", "from_user_id", "to_user_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'disputes_job_id_fkey'
  ) THEN
    ALTER TABLE "disputes" ADD CONSTRAINT "disputes_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'disputes_raised_by_id_fkey'
  ) THEN
    ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_id_fkey" FOREIGN KEY ("raised_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
