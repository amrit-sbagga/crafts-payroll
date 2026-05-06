import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pathToFileURL } from "url";

const seedDir = path.dirname(fileURLToPath(import.meta.url));

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  });
}

export const TOTAL = 10_000;
export const BATCH_SIZE = 500;

export const JOB_TITLES = [
  "Software Engineer",
  "Manager",
  "Designer",
  "HR",
  "QA Engineer",
  "DevOps Engineer"
];

export const COUNTRIES = ["India", "USA", "Germany", "UK", "Canada"];
export const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Sales",
  "Operations",
  "Marketing"
] as const;
export const GENDERS = ["Male", "Female", "Other"] as const;

export const SALARY_RANGES: Record<string, [number, number]> = {
  India: [500_000, 2_500_000],
  USA: [60_000, 150_000],
  Germany: [50_000, 120_000],
  UK: [40_000, 100_000],
  Canada: [55_000, 130_000]
};

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function loadLines(file: string): string[] {
  return fs
    .readFileSync(path.join(seedDir, "data", file), "utf-8")
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
}

export function buildEmployeeRecord(firstNames: string[], lastNames: string[]) {
  const country = pick(COUNTRIES);
  const [minSalary, maxSalary] = SALARY_RANGES[country];
  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
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

export async function main() {
  const prisma = createPrismaClient();
  const shouldClean = process.argv.includes("--clean");
  try {
    const firstNames = loadLines("first_names.txt");
    const lastNames = loadLines("last_names.txt");

    console.log(
      `Loaded ${firstNames.length} first names, ${lastNames.length} last names`
    );

    if (shouldClean) {
      console.log("Cleaning existing employee data...");
      await prisma.employee.deleteMany();
      console.log("Done.");
    }

    console.log(`Generating ${TOTAL.toLocaleString()} employees...`);

    const employees = Array.from({ length: TOTAL }, () =>
      buildEmployeeRecord(firstNames, lastNames)
    );

    const totalBatches = Math.ceil(TOTAL / BATCH_SIZE);

    console.log(
      `Inserting in ${totalBatches} batches of ${BATCH_SIZE} records each...\n`
    );

    for (let i = 0; i < totalBatches; i++) {
      const batch = employees.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      await prisma.employee.createMany({ data: batch });
      process.stdout.write(
        `  Batch ${String(i + 1).padStart(2)}/${totalBatches} — ${((i + 1) * BATCH_SIZE).toLocaleString()} rows inserted\r`
      );
    }

    console.log(`\n\n✓ Seeded ${TOTAL.toLocaleString()} employees successfully.`);
  } finally {
    await prisma.$disconnect();
  }
}

const isDirectRun =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  main()
    .catch(err => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
