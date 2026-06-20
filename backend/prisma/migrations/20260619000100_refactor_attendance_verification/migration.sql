-- Refactor attendance status from mixed presence/completion values to
-- worker-submitted and employer-verified workflow values.
BEGIN;

ALTER TABLE "attendance" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "AttendanceStatus_new" AS ENUM (
  'CHECKED_IN',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED'
);

ALTER TABLE "attendance"
ALTER COLUMN "status" TYPE "AttendanceStatus_new"
USING (
  CASE "status"::text
    WHEN 'COMPLETED' THEN 'VERIFIED'
    WHEN 'ABSENT' THEN 'REJECTED'
    WHEN 'LEFT_EARLY' THEN 'REJECTED'
    WHEN 'PRESENT' THEN
      CASE
        WHEN "check_out_time" IS NOT NULL THEN 'PENDING_VERIFICATION'
        ELSE 'CHECKED_IN'
      END
    ELSE 'CHECKED_IN'
  END
)::"AttendanceStatus_new";

ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "AttendanceStatus_old";

ALTER TABLE "attendance"
ALTER COLUMN "status" SET DEFAULT 'CHECKED_IN';

COMMIT;
