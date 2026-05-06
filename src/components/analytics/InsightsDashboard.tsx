"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import dynamic from "next/dynamic";
import type {
  CountrySalaryStats,
  DepartmentSalaryStats,
  JobTitleSalaryStats,
  GlobalSalarySummary
} from "@/modules/employee/employeeAnalytics.service";
import type { ExportFormat, ExportSelection } from "@/lib/exportReport";
import { exportReport } from "@/lib/exportReport";

const BarChartCard = dynamic(() => import("@/components/charts/BarChartCard"), { ssr: false });
const PieChartCard = dynamic(() => import("@/components/charts/PieChartCard"), { ssr: false });
const SalaryDistributionChart = dynamic(() => import("@/components/charts/SalaryDistributionChart"), { ssr: false });

function fmt(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";
type ExportScope = "all" | "custom";
type InsightsTab = "overview" | "country" | "department" | "distribution" | "reports";

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = type === "success";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl transition-all duration-300 animate-fade-in-up ${
        isSuccess
          ? "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-900/60 dark:bg-gray-900 dark:text-emerald-300"
          : "border-red-200 bg-white text-red-600 dark:border-red-900/60 dark:bg-gray-900 dark:text-red-300"
      }`}
    >
      {isSuccess ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 rounded-md p-0.5 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  iconBg,
  accentColor,
  label,
  description,
  value,
  loading,
  compact = false,
  trend,
  trendTone = "neutral"
}: {
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
  label: string;
  description: string;
  value: string;
  loading: boolean;
  compact?: boolean;
  trend?: string;
  trendTone?: "up" | "down" | "neutral";
}) {
  const trendClasses =
    trendTone === "up"
      ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30"
      : trendTone === "down"
        ? "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/30"
        : "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 dark:hover:shadow-black/30 ${
        compact ? "p-3.5" : "p-6"
      }`}
    >
      {/* Colored left accent bar */}
      <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${accentColor}`} />

      <div className="pl-2">
        <div className={`${compact ? "mb-2" : "mb-4"} flex items-center justify-between`}>
          <div
            className={`inline-flex items-center justify-center rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110 ${
              compact ? "h-7 w-7" : "h-10 w-10"
            }`}
          >
            {icon}
          </div>
          {trend && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${trendClasses}`}
            >
              {trend}
            </span>
          )}
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {label}
        </p>

        {loading ? (
          <div className={`${compact ? "mt-1.5" : "mt-2"} space-y-2`}>
            <div className={`${compact ? "h-6 w-24" : "h-9 w-32"} animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800`} />
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ) : (
          <>
            <p
              className={`mt-1 font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-gray-100 ${
                compact ? "text-xl" : "text-3xl"
              }`}
            >
              {value}
            </p>
            <p className={`${compact ? "mt-1" : "mt-1.5"} text-xs text-gray-500 dark:text-gray-400`}>{description}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {children}
      </span>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

// ─── Salary bar ───────────────────────────────────────────────────────────────

function SalaryBar({
  value,
  max,
  color = "bg-blue-500"
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">{pct}%</span>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

const SKELETON_WIDTHS = ["w-28", "w-20", "w-16", "w-12", "w-24"];

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-4">
              <div
                className={`h-3.5 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800 ${SKELETON_WIDTHS[(i + j) % SKELETON_WIDTHS.length]}`}
                style={{ animationDelay: `${(i + j) * 60}ms` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyTableState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
          </svg>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-1.5 0v4.5Zm.75-7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}

function ExportDialog({
  open,
  loading,
  format,
  scope,
  selection,
  onFormatChange,
  onScopeChange,
  onSelectionChange,
  onCancel,
  onExport,
}: {
  open: boolean;
  loading: boolean;
  format: ExportFormat;
  scope: ExportScope;
  selection: ExportSelection;
  onFormatChange: (format: ExportFormat) => void;
  onScopeChange: (scope: ExportScope) => void;
  onSelectionChange: (next: ExportSelection) => void;
  onCancel: () => void;
  onExport: () => void;
}) {
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    exportButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;
  const nothingSelected =
    scope === "custom" &&
    !selection.includeSummary &&
    !selection.includeCountryStats &&
    !selection.includeJobStats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-report-title"
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 id="export-report-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">Export Report</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Choose file format and what data to include.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Format</p>
            <div className="flex gap-2">
              {(["csv", "pdf"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onFormatChange(option)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    format === option
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Data scope</p>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <input
                  type="radio"
                  name="export-scope"
                  checked={scope === "all"}
                  onChange={() => onScopeChange("all")}
                />
                Export full report
              </label>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <input
                  type="radio"
                  name="export-scope"
                  checked={scope === "custom"}
                  onChange={() => onScopeChange("custom")}
                />
                Select sections
              </label>
            </div>
          </div>

          <div className={`space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700 ${scope === "all" ? "opacity-60" : ""}`}>
            {([
              { key: "includeSummary", label: "Global summary" },
              { key: "includeCountryStats", label: "Country salary stats" },
              { key: "includeJobStats", label: "Job title salary stats" },
            ] as const).map((item) => (
              <label key={item.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  disabled={scope === "all"}
                  checked={selection[item.key]}
                  onChange={(e) =>
                    onSelectionChange({
                      ...selection,
                      [item.key]: e.target.checked,
                    })
                  }
                />
                {item.label}
              </label>
            ))}
          </div>
          {nothingSelected && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Select at least one section to export.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            ref={exportButtonRef}
            type="button"
            onClick={onExport}
            disabled={loading || nothingSelected}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function InsightsDashboard() {
  const [summary, setSummary] = useState<GlobalSalarySummary | null>(null);
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [countrySalaries, setCountrySalaries] = useState<CountrySalaryStats[]>([]);
  const [departmentSalaries, setDepartmentSalaries] = useState<DepartmentSalaryStats[]>([]);
  const [jobSalaries, setJobSalaries] = useState<JobTitleSalaryStats[]>([]);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [countryLoading, setCountryLoading] = useState(true);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [summaryError, setSummaryError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [departmentError, setDepartmentError] = useState(false);
  const [jobError, setJobError] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exportScope, setExportScope] = useState<ExportScope>("all");
  const [exportSelection, setExportSelection] = useState<ExportSelection>({
    includeSummary: true,
    includeCountryStats: true,
    includeJobStats: true,
  });
  const [activeTab, setActiveTab] = useState<InsightsTab>("overview");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleExport = useCallback(async () => {
    const selection =
      exportScope === "all"
        ? {
            includeSummary: true,
            includeCountryStats: true,
            includeJobStats: true,
          }
        : exportSelection;

    if (!selection.includeSummary && !selection.includeCountryStats && !selection.includeJobStats) {
      setToast({ message: "Select at least one section to export.", type: "error" });
      return;
    }

    setExporting(true);
    try {
      exportReport(summary, totalEmployees, countrySalaries, jobSalaries, exportFormat, selection);
      setToast({ message: "Report downloaded successfully", type: "success" });
      setExportDialogOpen(false);
    } catch {
      setToast({ message: "Export failed. Please try again.", type: "error" });
    } finally {
      setExporting(false);
    }
  }, [summary, totalEmployees, countrySalaries, jobSalaries, exportFormat, exportScope, exportSelection]);

  useEffect(() => {
    setSummaryLoading(true);
    setSummaryError(false);
    Promise.all([
      fetch("/api/analytics/summary").then(r => r.json()),
      fetch("/api/employees?limit=1").then(r => r.json())
    ])
      .then(([summaryJson, employeesJson]) => {
        setSummary(summaryJson.data);
        setTotalEmployees(employeesJson.meta?.total ?? null);
      })
      .catch(() => setSummaryError(true))
      .finally(() => setSummaryLoading(false));
  }, [refreshTick]);

  useEffect(() => {
    setCountryLoading(true);
    setCountryError(false);
    fetch("/api/analytics/country-salaries")
      .then(r => r.json())
      .then(json => setCountrySalaries(json.data ?? []))
      .catch(() => setCountryError(true))
      .finally(() => setCountryLoading(false));
  }, [refreshTick]);

  useEffect(() => {
    setDepartmentLoading(true);
    setDepartmentError(false);
    fetch("/api/analytics/department-salaries")
      .then(r => r.json())
      .then(json => setDepartmentSalaries(json.data ?? []))
      .catch(() => setDepartmentError(true))
      .finally(() => setDepartmentLoading(false));
  }, [refreshTick]);

  useEffect(() => {
    setJobLoading(true);
    setJobError(false);
    const params = new URLSearchParams();
    if (selectedCountry) params.set("country", selectedCountry);
    fetch(`/api/analytics/job-salaries?${params}`)
      .then(r => r.json())
      .then(json => setJobSalaries(json.data ?? []))
      .catch(() => setJobError(true))
      .finally(() => setJobLoading(false));
  }, [selectedCountry, refreshTick]);

  const countryOptions = countrySalaries.map(c => c.country);
  const departmentOptions = departmentSalaries.map(d => d.department);
  const filteredDepartmentSalaries = selectedDepartment
    ? departmentSalaries.filter((row) => row.department === selectedDepartment)
    : departmentSalaries;
  const maxCountryAvg = Math.max(...countrySalaries.map(r => r.avgSalary), 1);
  const maxDepartmentAvg = Math.max(...filteredDepartmentSalaries.map(r => r.avgSalary), 1);
  const maxJobAvg = Math.max(...jobSalaries.map(r => r.avgSalary), 1);
  const totalDepartmentHeadcount = filteredDepartmentSalaries.reduce((sum, row) => sum + row.headcount, 0);
  const departmentAverageAcrossGroups =
    filteredDepartmentSalaries.length > 0
      ? Math.round(
          filteredDepartmentSalaries.reduce((sum, row) => sum + row.avgSalary, 0) /
            filteredDepartmentSalaries.length
        )
      : 0;
  const highestPayingDepartment = filteredDepartmentSalaries.reduce<DepartmentSalaryStats | null>(
    (best, row) => (!best || row.avgSalary > best.avgSalary ? row : best),
    null
  );

  const anyLoading = summaryLoading || countryLoading || departmentLoading || jobLoading;
  const tabs: Array<{ id: InsightsTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "country", label: "Country Analytics" },
    { id: "department", label: "Department Analytics" },
    { id: "distribution", label: "Salary Distribution" },
    { id: "reports", label: "Reports" },
  ];
  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  function onTabsKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") {
      return;
    }
    event.preventDefault();
    let nextIndex = activeTabIndex;
    if (event.key === "ArrowRight") nextIndex = (activeTabIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (activeTabIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    setActiveTab(tabs[nextIndex].id);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
      )}
      <ExportDialog
        open={exportDialogOpen}
        loading={exporting}
        format={exportFormat}
        scope={exportScope}
        selection={exportSelection}
        onFormatChange={setExportFormat}
        onScopeChange={setExportScope}
        onSelectionChange={setExportSelection}
        onCancel={() => setExportDialogOpen(false)}
        onExport={handleExport}
      />

      {/* ── Page Header ── */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Salary Insights
              </h1>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                Understand workforce compensation trends across countries and roles
              </p>
            </div>

            <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">
              {/* Live data badge */}
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live Data
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 pb-12 sm:px-6 sm:py-8">
        <section className="sticky top-2 z-20 rounded-2xl border border-gray-200 bg-white/95 p-1 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
          <div
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Insights analytics sections"
            onKeyDown={onTabsKeyDown}
          >
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                id={`insights-tab-${tab.id}`}
                aria-controls={`insights-panel-${tab.id}`}
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/40"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="sticky top-[66px] z-10 rounded-2xl border border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExportDialogOpen(true)}
              disabled={anyLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Report
            </button>

            <div className="inline-flex min-w-[170px] items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              Date Range (Coming soon)
            </div>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="min-w-[150px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
            >
              <option value="">All Countries</option>
              {countryOptions.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="min-w-[170px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
            >
              <option value="">All Departments</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setRefreshTick((v) => v + 1)}
              disabled={anyLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356m-1.176 13.86A9 9 0 0 1 6.343 6.343M3 3v5h5" />
              </svg>
              Refresh
            </button>
          </div>
        </section>

        {activeTab === "overview" && (
          <section id="insights-panel-overview" role="tabpanel" aria-labelledby="insights-tab-overview" className="space-y-4">
            <SectionLabel>Overview</SectionLabel>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-4">
                {summaryError ? (
                  <ErrorState message="Failed to load global salary summary." />
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <MetricCard iconBg="bg-blue-50" accentColor="bg-blue-500" icon={<svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>} label="Total Employees" description="Active workforce records" value={totalEmployees !== null ? totalEmployees.toLocaleString() : "—"} loading={summaryLoading} trend={totalEmployees && totalEmployees > 0 ? "↑ Active" : "No data"} trendTone="up" compact />
                    <MetricCard iconBg="bg-emerald-50" accentColor="bg-emerald-500" icon={<svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>} label="Average Salary" description="Across all employees" value={summary ? fmt(summary.avgSalary) : "—"} loading={summaryLoading} trend={summary && summary.avgSalary > 0 ? "↑ Healthy" : "No data"} trendTone="up" compact />
                    <MetricCard iconBg="bg-amber-50" accentColor="bg-amber-400" icon={<svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>} label="Highest Salary" description="Top compensation recorded" value={summary ? fmt(summary.maxSalary) : "—"} loading={summaryLoading} trend="↑ Peak" trendTone="up" compact />
                    <MetricCard iconBg="bg-violet-50" accentColor="bg-violet-500" icon={<svg className="h-4 w-4 text-violet-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>} label="Lowest Salary" description="Floor compensation recorded" value={summary ? fmt(summary.minSalary) : "—"} loading={summaryLoading} trend="↔ Baseline" trendTone="neutral" compact />
                  </div>
                )}
              </aside>
              <div className="space-y-4">
                {!countryError && (
                  <BarChartCard title="Average Salary by Country" subtitle="One bar per country · darker bar = above overall average" data={countrySalaries.map(r => ({ country: r.country, avg: r.avgSalary }))} xKey="country" yKey="avg" color="#93c5fd" highlightColor="#2563eb" referenceValue={summary?.avgSalary} referenceLabel="Overall Avg" formatValue={fmt} loading={countryLoading || summaryLoading} height={300} />
                )}
                {!departmentError && (
                  <BarChartCard title="Average Salary by Department" subtitle="One bar per department" data={filteredDepartmentSalaries.map(r => ({ department: r.department, avg: r.avgSalary }))} xKey="department" yKey="avg" color="#60a5fa" highlightColor="#1d4ed8" referenceValue={summary?.avgSalary} referenceLabel="Overall Avg" formatValue={fmt} loading={departmentLoading || summaryLoading} height={300} />
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "country" && (
          <section id="insights-panel-country" role="tabpanel" aria-labelledby="insights-tab-country" className="space-y-4">
            <SectionLabel>Country Analytics</SectionLabel>
            {!countryError && (
              <BarChartCard title="Average Salary by Country" subtitle="One bar per country · darker bar = above overall average" data={countrySalaries.map(r => ({ country: r.country, avg: r.avgSalary }))} xKey="country" yKey="avg" color="#93c5fd" highlightColor="#2563eb" referenceValue={summary?.avgSalary} referenceLabel="Overall Avg" formatValue={fmt} loading={countryLoading || summaryLoading} height={300} />
            )}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 dark:hover:shadow-black/30">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Country Salary Overview</h2>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Salary distribution across countries</p>
                </div>
                {!countryLoading && <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">{countrySalaries.length} countries</span>}
              </div>
              <div className="overflow-x-auto px-2">
                {countryError ? (
                  <div className="p-6"><ErrorState message="Failed to load country salary data." /></div>
                ) : (
                  <table className="w-full min-w-[760px] text-sm">
                    <thead><tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/70"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Country</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Min Salary</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Max Salary</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Salary</th><th className="px-4 py-3 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Spread</th></tr></thead>
                    <tbody>{countryLoading ? <RowSkeleton cols={5} /> : countrySalaries.length === 0 ? <EmptyTableState message="No country salary data available." /> : countrySalaries.map((row, i) => (<tr key={row.country} className={`group border-b border-gray-100 transition-colors duration-150 last:border-0 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:bg-blue-950/20 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/30 dark:bg-gray-900/70"}`}><td className="px-4 py-4"><div className="flex items-center gap-2.5"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">{row.country.charAt(0)}</span><span className="font-semibold text-gray-900 dark:text-gray-100">{row.country}</span></div></td><td className="px-4 py-4 text-right tabular-nums"><span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{fmt(row.minSalary)}</span></td><td className="px-4 py-4 text-right tabular-nums"><span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">{fmt(row.maxSalary)}</span></td><td className="px-4 py-4 text-right font-bold tabular-nums text-blue-700 dark:text-blue-300">{fmt(row.avgSalary)}</td><td className="px-4 py-4 pl-6"><SalaryBar value={row.avgSalary} max={maxCountryAvg} color="bg-blue-500" /></td></tr>))}</tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "department" && (
          <section id="insights-panel-department" role="tabpanel" aria-labelledby="insights-tab-department" className="space-y-4">
            <SectionLabel>Department Analytics</SectionLabel>
            {departmentError ? (
              <ErrorState message="Failed to load department analytics." />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                  <MetricCard iconBg="bg-indigo-50" accentColor="bg-indigo-500" icon={<svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h6m-6 4.5h6m-6 4.5h6m3-9h9m-9 4.5h9m-9 4.5h9" /></svg>} label="Department Headcount" description="Total employees across departments" value={departmentLoading ? "—" : totalDepartmentHeadcount.toLocaleString()} loading={departmentLoading} />
                  <MetricCard iconBg="bg-cyan-50" accentColor="bg-cyan-500" icon={<svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14.25 10.5 10l3 2.25 4.5-6" /></svg>} label="Average Salary by Department" description="Mean of department average salaries" value={departmentLoading ? "—" : fmt(departmentAverageAcrossGroups)} loading={departmentLoading} />
                  <MetricCard iconBg="bg-rose-50" accentColor="bg-rose-500" icon={<svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m3 17 6-6 4 4 8-8" /></svg>} label="Highest Paying Department" description="Department with top average salary" value={departmentLoading ? "—" : highestPayingDepartment?.department ?? "—"} loading={departmentLoading} />
                </div>
                <BarChartCard title="Average Salary by Department" subtitle="One bar per department" data={filteredDepartmentSalaries.map(r => ({ department: r.department, avg: r.avgSalary }))} xKey="department" yKey="avg" color="#60a5fa" highlightColor="#1d4ed8" referenceValue={summary?.avgSalary} referenceLabel="Overall Avg" formatValue={fmt} loading={departmentLoading || summaryLoading} height={300} />
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 dark:hover:shadow-black/30">
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                    <div><h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Department Salary Overview</h2><p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Headcount and average compensation by department</p></div>
                  </div>
                  <div className="overflow-x-auto px-2">
                    <table className="w-full min-w-[680px] text-sm">
                      <thead><tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/70"><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Headcount</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Salary</th><th className="px-4 py-3 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Relative</th></tr></thead>
                      <tbody>{departmentLoading ? <RowSkeleton cols={4} /> : filteredDepartmentSalaries.length === 0 ? <EmptyTableState message="No department analytics available." /> : filteredDepartmentSalaries.map((row, i) => (<tr key={row.department} className={`border-b border-gray-100 transition-colors duration-150 last:border-0 hover:bg-indigo-50/30 dark:border-gray-800 dark:hover:bg-indigo-950/20 ${i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/30 dark:bg-gray-900/70"}`}><td className="px-4 py-4 font-semibold text-gray-900 dark:text-gray-100">{row.department}</td><td className="px-4 py-4 text-right tabular-nums text-gray-700 dark:text-gray-300">{row.headcount.toLocaleString()}</td><td className="px-4 py-4 text-right font-bold tabular-nums text-indigo-700 dark:text-indigo-300">{fmt(row.avgSalary)}</td><td className="px-4 py-4 pl-6"><SalaryBar value={row.avgSalary} max={maxDepartmentAvg} color="bg-indigo-500" /></td></tr>))}</tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === "distribution" && (
          <section id="insights-panel-distribution" role="tabpanel" aria-labelledby="insights-tab-distribution" className="space-y-4">
            <SectionLabel>Salary Distribution</SectionLabel>
            <SalaryDistributionChart />
          </section>
        )}

        {activeTab === "reports" && (
          <section id="insights-panel-reports" role="tabpanel" aria-labelledby="insights-tab-reports" className="space-y-4">
            <SectionLabel>Reports</SectionLabel>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 dark:hover:shadow-black/30">
              <div className="border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Job Title Salary Insights</h2>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Average compensation by role{selectedCountry && <span className="ml-1.5 inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">{selectedCountry}</span>}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <label htmlFor="country-filter" className="text-xs font-medium text-gray-600 dark:text-gray-400">Filter by Country</label>
                    <div className="relative">
                      <select id="country-filter" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-44 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 shadow-sm outline-none transition-colors duration-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-violet-500 dark:focus:ring-violet-900/40">
                        <option value="">All Countries</option>
                        {countryOptions.map(c => (<option key={c} value={c}>{c}</option>))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center"><svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto px-2">
                {jobError ? (
                  <div className="p-6"><ErrorState message="Failed to load job title salary data." /></div>
                ) : (
                  <table className="w-full min-w-[700px] text-sm">
                    <thead><tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/70"><th className="w-10 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Title</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Salary</th><th className="px-4 py-3 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Vs. Top</th></tr></thead>
                    <tbody>{jobLoading ? <RowSkeleton cols={4} /> : jobSalaries.length === 0 ? <EmptyTableState message="No job title data for the selected country." /> : jobSalaries.map((row, i) => (<tr key={row.jobTitle} className="animate-fade-in-up border-b border-gray-100 transition-colors duration-150 last:border-0 hover:bg-violet-50/30 dark:border-gray-800 dark:hover:bg-violet-950/20" style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}><td className="px-4 py-4 text-center"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : i === 1 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" : i === 2 ? "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300" : "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500"}`}>{i + 1}</span></td><td className="px-4 py-4"><span className="inline-flex items-center rounded-lg border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300">{row.jobTitle}</span></td><td className="px-4 py-4 text-right font-bold tabular-nums text-violet-700 dark:text-violet-300">{fmt(row.avgSalary)}</td><td className="px-4 py-4 pl-6"><SalaryBar value={row.avgSalary} max={maxJobAvg} color="bg-violet-500" /></td></tr>))}</tbody>
                  </table>
                )}
              </div>
            </div>
            {!jobError && (
              <PieChartCard title="Salary Share by Role" subtitle="Proportional average salary distribution across job titles" data={jobSalaries.map(r => ({ name: r.jobTitle, value: Math.round(r.avgSalary) }))} formatValue={fmt} loading={jobLoading} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
