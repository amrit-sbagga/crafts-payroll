"use client";

import { useState, useEffect } from "react";
import type {
  CountrySalaryStats,
  JobTitleSalaryStats,
  GlobalSalarySummary
} from "@/modules/employee/employeeAnalytics.service";
import { BarChartCard, PieChartCard, SalaryDistributionChart } from "@/components/charts";

function fmt(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  iconBg,
  accentColor,
  label,
  description,
  value,
  loading
}: {
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
  label: string;
  description: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      {/* Colored left accent bar */}
      <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${accentColor}`} />

      <div className="pl-2">
        {/* Icon */}
        <div className="mb-4 flex items-center justify-between">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
            {icon}
          </div>
        </div>

        {/* Label */}
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {label}
        </p>

        {/* Value */}
        {loading ? (
          <div className="mt-2 space-y-2">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>
        ) : (
          <>
            <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-gray-900">
              {value}
            </p>
            <p className="mt-1.5 text-xs text-gray-400">{description}</p>
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
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {children}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
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
      <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-gray-400">{pct}%</span>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

const SKELETON_WIDTHS = ["w-28", "w-20", "w-16", "w-12", "w-24"];

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-4">
              <div
                className={`h-3.5 animate-pulse rounded-full bg-gray-100 ${SKELETON_WIDTHS[(i + j) % SKELETON_WIDTHS.length]}`}
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
          <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
          </svg>
          <p className="text-sm font-medium text-gray-400">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-1.5 0v4.5Zm.75-7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function InsightsDashboard() {
  const [summary, setSummary] = useState<GlobalSalarySummary | null>(null);
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [countrySalaries, setCountrySalaries] = useState<CountrySalaryStats[]>([]);
  const [jobSalaries, setJobSalaries] = useState<JobTitleSalaryStats[]>([]);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [countryLoading, setCountryLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [summaryError, setSummaryError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [jobError, setJobError] = useState(false);

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
  }, []);

  useEffect(() => {
    setCountryLoading(true);
    setCountryError(false);
    fetch("/api/analytics/country-salaries")
      .then(r => r.json())
      .then(json => setCountrySalaries(json.data ?? []))
      .catch(() => setCountryError(true))
      .finally(() => setCountryLoading(false));
  }, []);

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
  }, [selectedCountry]);

  const countryOptions = countrySalaries.map(c => c.country);
  const maxCountryAvg = Math.max(...countrySalaries.map(r => r.avgSalary), 1);
  const maxJobAvg = Math.max(...jobSalaries.map(r => r.avgSalary), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Salary Insights
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Understand workforce compensation trends across countries and roles
              </p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Data
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-6 py-10 pb-16">

        {/* ── Section 1: Key Metrics ── */}
        <section className="space-y-4">
          <SectionLabel>Key Metrics</SectionLabel>

          {summaryError ? (
            <ErrorState message="Failed to load global salary summary." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                iconBg="bg-blue-50"
                accentColor="bg-blue-500"
                icon={
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                }
                label="Total Employees"
                description="Active workforce records"
                value={totalEmployees !== null ? totalEmployees.toLocaleString() : "—"}
                loading={summaryLoading}
              />
              <MetricCard
                iconBg="bg-emerald-50"
                accentColor="bg-emerald-500"
                icon={
                  <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                  </svg>
                }
                label="Average Salary"
                description="Across all employees"
                value={summary ? fmt(summary.avgSalary) : "—"}
                loading={summaryLoading}
              />
              <MetricCard
                iconBg="bg-amber-50"
                accentColor="bg-amber-400"
                icon={
                  <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                }
                label="Highest Salary"
                description="Top compensation recorded"
                value={summary ? fmt(summary.maxSalary) : "—"}
                loading={summaryLoading}
              />
              <MetricCard
                iconBg="bg-violet-50"
                accentColor="bg-violet-500"
                icon={
                  <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                }
                label="Lowest Salary"
                description="Floor compensation recorded"
                value={summary ? fmt(summary.minSalary) : "—"}
                loading={summaryLoading}
              />
            </div>
          )}
        </section>

        {/* ── Section 1b: Salary Distribution ── */}
        <section className="space-y-4">
          <SectionLabel>Salary Distribution</SectionLabel>
          <SalaryDistributionChart />
        </section>

        {/* ── Section 2: Country Analysis ── */}
        <section className="space-y-5">
          <SectionLabel>Country Analysis</SectionLabel>

          {/* Bar chart — primary visual */}
          {!countryError && (
            <BarChartCard
              title="Average Salary by Country"
              subtitle="One bar per country · darker bar = above overall average"
              data={countrySalaries.map(r => ({ country: r.country, avg: r.avgSalary }))}
              xKey="country"
              yKey="avg"
              color="#93c5fd"
              highlightColor="#2563eb"
              referenceValue={summary?.avgSalary}
              referenceLabel="Overall Avg"
              formatValue={fmt}
              loading={countryLoading || summaryLoading}
              height={300}
            />
          )}

          {/* Detail table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Country Salary Overview
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Salary distribution across countries
                </p>
              </div>
              {!countryLoading && (
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {countrySalaries.length} countries
                </span>
              )}
            </div>

            {/* Table */}
            <div className="px-2">
              {countryError ? (
                <div className="p-6">
                  <ErrorState message="Failed to load country salary data." />
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Country
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Min Salary
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Max Salary
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Avg Salary
                      </th>
                      <th className="px-4 py-3 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Spread
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {countryLoading ? (
                      <RowSkeleton cols={5} />
                    ) : countrySalaries.length === 0 ? (
                      <EmptyTableState message="No country salary data available." />
                    ) : (
                      countrySalaries.map((row, i) => (
                        <tr
                          key={row.country}
                          className={`group border-b border-gray-50 transition-colors duration-150 last:border-0 hover:bg-blue-50/30 ${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }`}
                        >
                          {/* Country pill */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                                {row.country.charAt(0)}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {row.country}
                              </span>
                            </div>
                          </td>

                          {/* Min — muted green */}
                          <td className="px-4 py-4 text-right tabular-nums">
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              {fmt(row.minSalary)}
                            </span>
                          </td>

                          {/* Max — muted amber */}
                          <td className="px-4 py-4 text-right tabular-nums">
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              {fmt(row.maxSalary)}
                            </span>
                          </td>

                          {/* Avg — bold blue */}
                          <td className="px-4 py-4 text-right font-bold tabular-nums text-blue-700">
                            {fmt(row.avgSalary)}
                          </td>

                          {/* Salary bar */}
                          <td className="px-4 py-4 pl-6">
                            <SalaryBar value={row.avgSalary} max={maxCountryAvg} color="bg-blue-500" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {/* ── Section 3: Job Title Analysis ── */}
        <section className="space-y-4">
          <SectionLabel>Job Title Analysis</SectionLabel>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">

            {/* Card header — title + dropdown */}
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Title block */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Job Title Salary Insights
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Average compensation by role
                    {selectedCountry && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-600">
                        {selectedCountry}
                      </span>
                    )}
                  </p>
                </div>

                {/* Styled country dropdown */}
                <div className="flex shrink-0 flex-col gap-1">
                  <label
                    htmlFor="country-filter"
                    className="text-xs font-medium text-gray-500"
                  >
                    Filter by Country
                  </label>
                  <div className="relative">
                    <select
                      id="country-filter"
                      value={selectedCountry}
                      onChange={e => setSelectedCountry(e.target.value)}
                      className="w-44 appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    >
                      <option value="">All Countries</option>
                      {countryOptions.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {/* Custom chevron */}
                    <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="px-2">
              {jobError ? (
                <div className="p-6">
                  <ErrorState message="Failed to load job title salary data." />
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="w-10 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Job Title
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Avg Salary
                      </th>
                      <th className="px-4 py-3 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Vs. Top
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobLoading ? (
                      <RowSkeleton cols={4} />
                    ) : jobSalaries.length === 0 ? (
                      <EmptyTableState message="No job title data for the selected country." />
                    ) : (
                      jobSalaries.map((row, i) => (
                        <tr
                          key={row.jobTitle}
                          className="animate-fade-in-up border-b border-gray-50 transition-colors duration-150 last:border-0 hover:bg-violet-50/30"
                          style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
                        >
                          {/* Rank */}
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              i === 0
                                ? "bg-amber-100 text-amber-700"
                                : i === 1
                                ? "bg-gray-100 text-gray-600"
                                : i === 2
                                ? "bg-orange-50 text-orange-600"
                                : "bg-gray-50 text-gray-400"
                            }`}>
                              {i + 1}
                            </span>
                          </td>

                          {/* Job title — bold pill */}
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center rounded-lg border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                              {row.jobTitle}
                            </span>
                          </td>

                          {/* Avg salary — right aligned, bold violet */}
                          <td className="px-4 py-4 text-right font-bold tabular-nums text-violet-700">
                            {fmt(row.avgSalary)}
                          </td>

                          {/* Relative bar */}
                          <td className="px-4 py-4 pl-6">
                            <SalaryBar value={row.avgSalary} max={maxJobAvg} color="bg-violet-500" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </section>

        {/* ── Job Title Chart ── */}
        {!jobError && (
          <PieChartCard
            title="Salary Share by Role"
            subtitle="Proportional average salary distribution across job titles"
            data={jobSalaries.map(r => ({ name: r.jobTitle, value: Math.round(r.avgSalary) }))}
            formatValue={fmt}
            loading={jobLoading}
          />
        )}

      </main>
    </div>
  );
}
