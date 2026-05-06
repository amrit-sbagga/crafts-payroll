import type {
  CountrySalaryStats,
  JobTitleSalaryStats,
  GlobalSalarySummary,
} from "@/modules/employee/employeeAnalytics.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function row(...cells: (string | number)[]): string {
  return cells
    .map(c => {
      const s = String(c);
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
}

function section(title: string, ...lines: string[]): string {
  return [title, ...lines, "", ""].join("\n");
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildReportCsv(
  summary: GlobalSalarySummary | null,
  totalEmployees: number | null,
  countrySalaries: CountrySalaryStats[],
  jobSalaries: JobTitleSalaryStats[]
): string {
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const parts: string[] = [];

  // ── Meta ──────────────────────────────────────────────────────────────────
  parts.push(section("Report Info", row("Generated At", now)));

  // ── Global Summary ────────────────────────────────────────────────────────
  parts.push(
    section(
      "Global Summary",
      row("Metric", "Value"),
      row("Total Employees", totalEmployees ?? "N/A"),
      row("Overall Avg Salary", summary?.avgSalary ?? "N/A"),
      row("Overall Min Salary", summary?.minSalary ?? "N/A"),
      row("Overall Max Salary", summary?.maxSalary ?? "N/A")
    )
  );

  // ── Country Salary Stats ──────────────────────────────────────────────────
  const countryRows = countrySalaries.map(r =>
    row(r.country, r.minSalary, r.maxSalary, r.avgSalary)
  );
  parts.push(
    section(
      "Country Salary Stats",
      row("Country", "Min Salary", "Max Salary", "Avg Salary"),
      ...countryRows
    )
  );

  // ── Job Title Salary Stats ────────────────────────────────────────────────
  const jobRows = jobSalaries.map(r => row(r.jobTitle, r.avgSalary));
  parts.push(
    section(
      "Job Title Salary Stats",
      row("Job Title", "Avg Salary"),
      ...jobRows
    )
  );

  return parts.join("\n");
}

// ─── Download trigger ─────────────────────────────────────────────────────────

export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Convenience wrapper ─────────────────────────────────────────────────────

export function exportReport(
  summary: GlobalSalarySummary | null,
  totalEmployees: number | null,
  countrySalaries: CountrySalaryStats[],
  jobSalaries: JobTitleSalaryStats[]
): void {
  const csv      = buildReportCsv(summary, totalEmployees, countrySalaries, jobSalaries);
  const date     = new Date().toISOString().slice(0, 10);
  const filename = `salary-insights-${date}.csv`;
  downloadCsv(csv, filename);
}
