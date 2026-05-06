import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
});

const TOTAL = 10_000;
const BATCH_SIZE = 500;

const JOB_TITLES = [
  "Software Engineer",
  "Manager",
  "Designer",
  "HR",
  "QA Engineer",
  "DevOps Engineer"
];

const COUNTRIES = ["India", "USA", "Germany", "UK", "Canada"];

const SALARY_RANGES: Record<string, [number, number]> = {
  India: [500_000, 2_500_000],
  USA: [60_000, 150_000],
  Germany: [50_000, 120_000],
  UK: [40_000, 100_000],
  Canada: [55_000, 130_000]
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function loadLines(file: string): string[] {
  return fs
    .readFileSync(path.join(__dirname, "data", file), "utf-8")
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
}

async function main() {
  const shouldClean = process.argv.includes("--clean");

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

  const employees = Array.from({ length: TOTAL }, () => {
    const country = pick(COUNTRIES);
    const [minSalary, maxSalary] = SALARY_RANGES[country];
    return {
      fullName: `${pick(firstNames)} ${pick(lastNames)}`,
      jobTitle: pick(JOB_TITLES),
      country,
      salary: randInt(minSalary, maxSalary)
    };
  });

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
}

main()
  .catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
