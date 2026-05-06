CREATE TABLE "PayrollRun" (
  "id" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "totalEmployees" INTEGER NOT NULL,
  "totalPayout" DECIMAL(14,2) NOT NULL,
  "avgPayout" DECIMAL(14,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PayrollRun_year_month_idx" ON "PayrollRun"("year", "month");
CREATE UNIQUE INDEX "PayrollRun_year_month_key" ON "PayrollRun"("year", "month");
