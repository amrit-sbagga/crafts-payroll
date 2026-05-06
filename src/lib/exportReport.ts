import type {
  CountrySalaryStats,
  JobTitleSalaryStats,
  GlobalSalarySummary,
} from "@/modules/employee/employeeAnalytics.service";
import { jsPDF } from "jspdf";
import exportCsv from "@/lib/exportCsv";

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

export type ExportFormat = "csv" | "pdf";

export type ExportSelection = {
  includeSummary: boolean;
  includeCountryStats: boolean;
  includeJobStats: boolean;
};

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildReportCsv(
  summary: GlobalSalarySummary | null,
  totalEmployees: number | null,
  countrySalaries: CountrySalaryStats[],
  jobSalaries: JobTitleSalaryStats[],
  selection: ExportSelection
): string {
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const parts: string[] = [];

  // ── Meta ──────────────────────────────────────────────────────────────────
  parts.push(section("Report Info", row("Generated At", now)));

  // ── Global Summary ────────────────────────────────────────────────────────
  if (selection.includeSummary) {
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
  }

  // ── Country Salary Stats ──────────────────────────────────────────────────
  if (selection.includeCountryStats) {
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
  }

  // ── Job Title Salary Stats ────────────────────────────────────────────────
  if (selection.includeJobStats) {
    const jobRows = jobSalaries.map(r => row(r.jobTitle, r.avgSalary));
    parts.push(
      section(
        "Job Title Salary Stats",
        row("Job Title", "Avg Salary"),
        ...jobRows
      )
    );
  }

  return parts.join("\n");
}

// ─── Download trigger ─────────────────────────────────────────────────────────

export function downloadCsv(csv: string, filename: string): void {
  exportCsv(csv, filename);
}

function buildReportPdfText(
  summary: GlobalSalarySummary | null,
  totalEmployees: number | null,
  countrySalaries: CountrySalaryStats[],
  jobSalaries: JobTitleSalaryStats[],
  selection: ExportSelection
): string[] {
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines: string[] = [
    "Salary Insights Report",
    `Generated At: ${now}`,
    "",
  ];

  if (selection.includeSummary) {
    lines.push("Global Summary");
    lines.push(`- Total Employees: ${totalEmployees ?? "N/A"}`);
    lines.push(`- Overall Avg Salary: ${summary?.avgSalary ?? "N/A"}`);
    lines.push(`- Overall Min Salary: ${summary?.minSalary ?? "N/A"}`);
    lines.push(`- Overall Max Salary: ${summary?.maxSalary ?? "N/A"}`);
    lines.push("");
  }

  if (selection.includeCountryStats) {
    lines.push("Country Salary Stats");
    countrySalaries.forEach((row) => {
      lines.push(
        `- ${row.country}: min ${row.minSalary}, max ${row.maxSalary}, avg ${row.avgSalary}`
      );
    });
    lines.push("");
  }

  if (selection.includeJobStats) {
    lines.push("Job Title Salary Stats");
    jobSalaries.forEach((row) => {
      lines.push(`- ${row.jobTitle}: avg ${row.avgSalary}`);
    });
  }

  return lines;
}

function downloadPdf(lines: string[], filename: string): void {
  const doc = new jsPDF();
  let y = 16;
  const lineHeight = 7;
  lines.forEach((line) => {
    if (y > 280) {
      doc.addPage();
      y = 16;
    }
    doc.text(line, 14, y);
    y += lineHeight;
  });
  doc.save(filename);
}

// ─── Convenience wrapper ─────────────────────────────────────────────────────

export function exportReport(
  summary: GlobalSalarySummary | null,
  totalEmployees: number | null,
  countrySalaries: CountrySalaryStats[],
  jobSalaries: JobTitleSalaryStats[],
  format: ExportFormat,
  selection: ExportSelection
): void {
  const date     = new Date().toISOString().slice(0, 10);
  if (format === "csv") {
    const csv = buildReportCsv(summary, totalEmployees, countrySalaries, jobSalaries, selection);
    downloadCsv(csv, `salary-insights-${date}.csv`);
    return;
  }

  const lines = buildReportPdfText(summary, totalEmployees, countrySalaries, jobSalaries, selection);
  downloadPdf(lines, `salary-insights-${date}.pdf`);
}
