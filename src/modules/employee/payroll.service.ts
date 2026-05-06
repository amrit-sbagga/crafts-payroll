import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export type PayrollRunSummary = {
  month: number;
  year: number;
  totalEmployees: number;
  totalPayout: number;
  avgPayout: number;
  createdAt: string;
};

export async function runMonthlyPayroll(month: number, year: number): Promise<PayrollRunSummary> {
  const aggregate = await prisma.employee.aggregate({
    _count: { _all: true },
    _sum: { salary: true },
    _avg: { salary: true }
  });

  const totalEmployees = aggregate._count._all;
  const totalPayout = Number(aggregate._sum.salary ?? 0);
  const avgPayout = Number(aggregate._avg.salary ?? 0);

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "PayrollRun" ("id", "month", "year", "totalEmployees", "totalPayout", "avgPayout", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT ("year", "month")
      DO UPDATE SET
        "totalEmployees" = EXCLUDED."totalEmployees",
        "totalPayout" = EXCLUDED."totalPayout",
        "avgPayout" = EXCLUDED."avgPayout"
    `,
    randomUUID(),
    month,
    year,
    totalEmployees,
    totalPayout,
    avgPayout
  );

  const rows = await prisma.$queryRawUnsafe<
    Array<{
      month: number;
      year: number;
      totalEmployees: number;
      totalPayout: unknown;
      avgPayout: unknown;
      createdAt: Date;
    }>
  >(
    `
      SELECT "month", "year", "totalEmployees", "totalPayout", "avgPayout", "createdAt"
      FROM "PayrollRun"
      WHERE "month" = $1 AND "year" = $2
      LIMIT 1
    `,
    month,
    year
  );

  const record = rows[0];

  return {
    month: record.month,
    year: record.year,
    totalEmployees: record.totalEmployees,
    totalPayout: Number(record.totalPayout),
    avgPayout: Number(record.avgPayout),
    createdAt: record.createdAt.toISOString()
  };
}

