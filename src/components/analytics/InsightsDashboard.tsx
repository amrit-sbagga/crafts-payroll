"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import MetricCard from "@/features/analytics/components/MetricCard";
import InsightsToast, { type ToastType } from "@/features/analytics/components/InsightsToast";
import ExportDialog, { type ExportScope } from "@/features/analytics/components/ExportDialog";
import SectionLabel from "@/features/analytics/components/SectionLabel";
import SalaryBar from "@/features/analytics/components/SalaryBar";
import { EmptyTableState, ErrorState, RowSkeleton } from "@/features/analytics/components/AnalyticsTableStates";
import InsightsTabs, { type InsightsTab } from "@/features/analytics/components/InsightsTabs";
import AnalyticsFiltersToolbar from "@/features/analytics/components/AnalyticsFiltersToolbar";
import useAnalytics from "@/features/analytics/hooks/useAnalytics";
import PageHeader from "@/shared/components/PageHeader";
import type { DepartmentSalaryStats } from "@/modules/employee/employeeAnalytics.service";
import type { ExportFormat, ExportSelection } from "@/lib/exportReport";
import { exportReport } from "@/lib/exportReport";
import { formatCurrency } from "@/lib/formatters";

const BarChartCard = dynamic(() => import("@/components/charts/BarChartCard"), { ssr: false });
const PieChartCard = dynamic(() => import("@/components/charts/PieChartCard"), { ssr: false });
const SalaryDistributionChart = dynamic(() => import("@/components/charts/SalaryDistributionChart"), { ssr: false });

function fmt(value: number): string {
  return formatCurrency(value);
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function InsightsDashboard() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const {
    summary,
    totalEmployees,
    countrySalaries,
    departmentSalaries,
    filteredDepartmentSalaries,
    jobSalaries,
    summaryLoading,
    countryLoading,
    departmentLoading,
    jobLoading,
    summaryError,
    countryError,
    departmentError,
    jobError
  } = useAnalytics(selectedCountry, selectedDepartment, refreshTick);

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

  const countryOptions = useMemo(() => countrySalaries.map(c => c.country), [countrySalaries]);
  const departmentOptions = useMemo(() => departmentSalaries.map(d => d.department), [departmentSalaries]);
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
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">

      {/* ── Toast ── */}
      {toast && (
        <InsightsToast message={toast.message} type={toast.type} onDismiss={dismissToast} />
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

      <PageHeader
        title="Salary Insights"
        description="Understand workforce compensation trends across countries and roles"
      />

      <main className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 pb-12 sm:px-6 sm:py-8">
        <InsightsTabs activeTab={activeTab} onChange={setActiveTab} />

        <AnalyticsFiltersToolbar
          anyLoading={anyLoading}
          selectedCountry={selectedCountry}
          selectedDepartment={selectedDepartment}
          countryOptions={countryOptions}
          departmentOptions={departmentOptions}
          onOpenExport={() => setExportDialogOpen(true)}
          onCountryChange={setSelectedCountry}
          onDepartmentChange={setSelectedDepartment}
          onRefresh={() => setRefreshTick(v => v + 1)}
        />

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
