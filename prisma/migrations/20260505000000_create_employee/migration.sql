-- CreateTable
CREATE TABLE "Employee" (
    "id"        TEXT            NOT NULL,
    "fullName"  TEXT            NOT NULL,
    "jobTitle"  TEXT            NOT NULL,
    "country"   TEXT            NOT NULL,
    "salary"    DECIMAL(12, 2)  NOT NULL,
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)    NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Employee_country_idx" ON "Employee"("country");

-- CreateIndex
CREATE INDEX "Employee_jobTitle_idx" ON "Employee"("jobTitle");
