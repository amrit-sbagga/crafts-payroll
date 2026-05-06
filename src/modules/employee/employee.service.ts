import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { EmployeeInput } from "./domain/validateEmployeeInput";

export type ListEmployeesParams = {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  jobTitle?: string;
};

// Prisma returns Decimal for salary — convert to number for JSON serialisation.
function serialize<T extends { salary: Prisma.Decimal }>(employee: T) {
  return { ...employee, salary: Number(employee.salary) };
}

export async function createEmployee(data: EmployeeInput) {
  const employee = await prisma.employee.create({ data });
  return serialize(employee);
}

export async function listEmployees({
  page = 1,
  limit = 20,
  search,
  country,
  jobTitle
}: ListEmployeesParams) {
  const safeLimit = Math.min(limit, 100);
  const skip = (page - 1) * safeLimit;

  const where: Prisma.EmployeeWhereInput = {
    ...(search && {
      fullName: { contains: search, mode: Prisma.QueryMode.insensitive }
    }),
    ...(country && { country }),
    ...(jobTitle && { jobTitle })
  };

  const [total, employees] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" }
    })
  ]);

  return {
    data: employees.map(serialize),
    meta: {
      total,
      page,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    }
  };
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  return employee ? serialize(employee) : null;
}

export async function updateEmployee(id: string, data: EmployeeInput) {
  const employee = await prisma.employee.update({ where: { id }, data });
  return serialize(employee);
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
}
