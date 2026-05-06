-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- AlterTable
ALTER TABLE "Employee"
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'Other',
ADD COLUMN "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
