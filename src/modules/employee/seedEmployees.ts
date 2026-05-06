import { Department, Gender } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const FIRST_NAMES = [
  "Ava", "Liam", "Noah", "Mia", "Ethan", "Sophia", "Lucas", "Amelia", "Aria", "Mason",
  "Harper", "James", "Emma", "Logan", "Olivia", "Elijah", "Aiden", "Zara", "Riya", "Kabir"
];
const LAST_NAMES = [
  "Sharma", "Patel", "Miller", "Wilson", "Brown", "Khan", "Singh", "Thomas", "Clark", "Taylor",
  "Johnson", "Gupta", "Ali", "Anderson", "Moore", "White", "Bose", "Das", "Mehta", "Chopra"
];
const JOB_TITLES = ["Software Engineer", "Manager", "Designer", "HR", "QA Engineer", "DevOps Engineer"];
const COUNTRIES = ["India", "USA", "Germany", "UK", "Canada"];
const DEPARTMENTS: Department[] = [
  Department.Engineering,
  Department.HR,
  Department.Finance,
  Department.Sales,
  Department.Operations,
  Department.Marketing
];
const GENDERS: Gender[] = [Gender.Male, Gender.Female, Gender.Other];

const SALARY_RANGES: Record<string, [number, number]> = {
  India: [500_000, 2_500_000],
  USA: [60_000, 150_000],
  Germany: [50_000, 120_000],
  UK: [40_000, 100_000],
  Canada: [55_000, 130_000]
};

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildEmployee() {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const country = pick(COUNTRIES);
  const [minSalary, maxSalary] = SALARY_RANGES[country];
  const joiningDate = new Date();
  joiningDate.setDate(joiningDate.getDate() - randInt(30, 3650));

  return {
    fullName: `${firstName} ${lastName}`,
    jobTitle: pick(JOB_TITLES),
    country,
    department: pick(DEPARTMENTS),
    gender: pick(GENDERS),
    joiningDate,
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}`,
    salary: randInt(minSalary, maxSalary)
  };
}

export async function seedEmployees({
  count = 1000,
  clean = false
}: {
  count?: number;
  clean?: boolean;
}) {
  const safeCount = Math.max(1, Math.min(count, 10_000));
  const batchSize = 500;
  const totalBatches = Math.ceil(safeCount / batchSize);

  if (clean) {
    await prisma.employee.deleteMany();
  }

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const size = Math.min(batchSize, safeCount - start);
    const batch = Array.from({ length: size }, () => buildEmployee());
    await prisma.employee.createMany({ data: batch });
  }

  return { inserted: safeCount, cleaned: clean };
}
