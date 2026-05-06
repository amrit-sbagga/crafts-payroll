import { prisma } from "@/lib/prisma";

export type CountrySalaryStats = {
  country: string;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
};

export type JobTitleSalaryStats = {
  jobTitle: string;
  avgSalary: number;
};

export type GlobalSalarySummary = {
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
};

export type DepartmentSalaryStats = {
  department: string;
  headcount: number;
  avgSalary: number;
};

export async function getCountrySalaryStats(): Promise<CountrySalaryStats[]> {
  const rows = await prisma.employee.groupBy({
    by: ["country"],
    _min: { salary: true },
    _max: { salary: true },
    _avg: { salary: true },
    orderBy: { country: "asc" }
  });

  return rows.map(row => ({
    country: row.country,
    minSalary: Number(row._min.salary ?? 0),
    maxSalary: Number(row._max.salary ?? 0),
    avgSalary: Number(row._avg.salary ?? 0)
  }));
}

export async function getJobTitleSalaryStats(
  country?: string
): Promise<JobTitleSalaryStats[]> {
  const rows = await prisma.employee.groupBy({
    by: ["jobTitle"],
    where: country ? { country } : undefined,
    _avg: { salary: true },
    orderBy: { jobTitle: "asc" }
  });

  return rows.map(row => ({
    jobTitle: row.jobTitle,
    avgSalary: Number(row._avg.salary ?? 0)
  }));
}

export async function getGlobalSalarySummary(): Promise<GlobalSalarySummary> {
  const result = await prisma.employee.aggregate({
    _min: { salary: true },
    _max: { salary: true },
    _avg: { salary: true }
  });

  return {
    minSalary: Number(result._min.salary ?? 0),
    maxSalary: Number(result._max.salary ?? 0),
    avgSalary: Number(result._avg.salary ?? 0)
  };
}

export async function getDepartmentSalaryStats(): Promise<DepartmentSalaryStats[]> {
  const rows = await prisma.employee.groupBy({
    by: ["department"],
    _count: { _all: true },
    _avg: { salary: true },
    orderBy: { department: "asc" }
  });

  return rows.map((row) => ({
    department: row.department,
    headcount: row._count._all,
    avgSalary: Number(row._avg.salary ?? 0)
  }));
}
