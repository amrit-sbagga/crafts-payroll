CREATE TYPE "Department" AS ENUM (
  'Engineering',
  'HR',
  'Finance',
  'Sales',
  'Operations',
  'Marketing'
);

ALTER TABLE "Employee"
ADD COLUMN "department" "Department" NOT NULL DEFAULT 'Engineering';

CREATE INDEX "Employee_department_idx" ON "Employee"("department");
