import { Department, Gender, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { EmployeeInput } from "./domain/validateEmployeeInput";

export type ListEmployeesParams = {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  jobTitle?: string;
  sortBy?: "fullName" | "jobTitle" | "country" | "department" | "salary" | "createdAt";
  sortOrder?: "asc" | "desc";
};

// Prisma returns Decimal for salary — convert to number for JSON serialisation.
function serialize<T extends { salary: Prisma.Decimal }>(employee: T) {
  return { ...employee, salary: Number(employee.salary) };
}

function normalizeJoiningDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  return value;
}

function toDepartment(value: string): Department {
  const departments = Object.values(Department);
  return departments.includes(value as Department) ? (value as Department) : Department.Engineering;
}

function toGender(value: string): Gender {
  const genders = Object.values(Gender);
  return genders.includes(value as Gender) ? (value as Gender) : Gender.Male;
}

function toEmployeeCreateData(data: EmployeeInput): Prisma.EmployeeCreateInput {
  return {
    fullName: data.fullName,
    jobTitle: data.jobTitle,
    country: data.country,
    department: toDepartment(data.department),
    gender: toGender(data.gender),
    joiningDate: normalizeJoiningDate(data.joiningDate),
    avatarUrl: data.avatarUrl,
    salary: data.salary
  };
}

export async function createEmployee(data: EmployeeInput) {
  const employee = await prisma.employee.create({
    data: toEmployeeCreateData(data)
  });
  return serialize(employee);
}

export async function listEmployees({
  page = 1,
  limit = 20,
  search,
  country,
  jobTitle,
  sortBy = "createdAt",
  sortOrder = "desc"
}: ListEmployeesParams) {
  const safeLimit = Math.min(limit, 100);
  const skip = (page - 1) * safeLimit;

  const where: Prisma.EmployeeWhereInput = {
    ...(search && {
      fullName: { contains: search, mode: Prisma.QueryMode.insensitive }
    }),
    ...(country && {
      country: { contains: country, mode: Prisma.QueryMode.insensitive }
    }),
    ...(jobTitle && {
      jobTitle: { contains: jobTitle, mode: Prisma.QueryMode.insensitive }
    })
  };

  const [total, employees] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { [sortBy]: sortOrder }
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
  const employee = await prisma.employee.update({
    where: { id },
    data: toEmployeeCreateData(data)
  });
  return serialize(employee);
}

export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
}

const BULK_DELETE_MAX = 100;

export async function deleteEmployeesByIds(ids: string[]) {
  const unique = [...new Set(ids.map(id => id.trim()).filter(Boolean))];
  if (unique.length === 0) return { deleted: 0 };
  if (unique.length > BULK_DELETE_MAX) {
    throw new Error(`Cannot delete more than ${BULK_DELETE_MAX} employees at once`);
  }
  const result = await prisma.employee.deleteMany({
    where: { id: { in: unique } }
  });
  return { deleted: result.count };
}
