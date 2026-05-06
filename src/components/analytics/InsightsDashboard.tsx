"use client";

import { useState, useEffect } from "react";
import type {
  CountrySalaryStats,
  JobTitleSalaryStats,
  GlobalSalarySummary
} from "@/modules/employee/employeeAnalytics.service";

function fmt(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  iconBg,
  label,
  value,
  loading
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      {loading ? (
        <div className="mt-2 h-7 w-28 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
          {value}
        </p>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
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
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{pct}%</span>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function RowSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-50">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="h-3.5 rounded bg-gray-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
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
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Salary Insights
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Understand workforce compensation trends
              </p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Live Data
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-8">

        {/* ── Section 1: Key Metrics ── */}
        <section className="space-y-4">
          <SectionLabel>Key Metrics</SectionLabel>

          {summaryError ? (
            <ErrorState message="Failed to load global salary summary." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricCard
                iconBg="bg-blue-50"
                icon={
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                }
                label="Total Employees"
                value={totalEmployees !== null ? totalEmployees.toLocaleString() : "—"}
                loading={summaryLoading}
              />
              <MetricCard
                iconBg="bg-emerald-50"
                icon={
                  <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                  </svg>
                }
                label="Overall Avg Salary"
                value={summary ? fmt(summary.avgSalary) : "—"}
                loading={summaryLoading}
              />
              <MetricCard
                iconBg="bg-amber-50"
                icon={
                  <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                }
                label="Highest Salary"
                value={summary ? fmt(summary.maxSalary) : "—"}
                loading={summaryLoading}
              />
              <MetricCard
                iconBg="bg-violet-50"
                icon={
                  <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                }
                label="Lowest Salary"
                value={summary ? fmt(summary.minSalary) : "—"}
                loading={summaryLoading}
              />
            </div>
          )}
        </section>

        {/* ── Section 2: Country Analysis ── */}
        <section className="space-y-4">
          <SectionLabel>Country Analysis</SectionLabel>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Country Salary Overview
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Min, max and average salary breakdown per country
                </p>
              </div>
              {!countryLoading && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  {countrySalaries.length} countries
                </span>
              )}
            </div>

            <div className="px-6 py-2">
              {countryError ? (
                <div className="py-4">
                  <ErrorState message="Failed to load country salary data." />
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Country</th>
                      <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Min</th>
                      <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Max</th>
                      <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Avg Salary</th>
                      <th className="py-3 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Relative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {countryLoading ? (
                      <RowSkeleton cols={5} />
                    ) : (
                      countrySalaries.map(row => (
                        <tr key={row.country} className="group hover:bg-blue-50/20 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                {row.country.charAt(0)}
                              </span>
                              <span className="font-semibold text-gray-900">{row.country}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right tabular-nums text-gray-500">{fmt(row.minSalary)}</td>
                          <td className="py-4 text-right tabular-nums text-gray-500">{fmt(row.maxSalary)}</td>
                          <td className="py-4 text-right font-semibold tabular-nums text-blue-700">{fmt(row.avgSalary)}</td>
                          <td className="py-4 pl-6">
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

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Job Title Salary Overview
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Average compensation by role
                  {selectedCountry && (
                    <span className="ml-1.5 rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-600">
                      {selectedCountry}
                    </span>
                  )}
                </p>
              </div>
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Countries</option>
                {countryOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="px-6 py-2">
              {jobError ? (
                <div className="py-4">
                  <ErrorState message="Failed to load job title salary data." />
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Role</th>
                      <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Avg Salary</th>
                      <th className="py-3 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Relative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {jobLoading ? (
                      <RowSkeleton cols={3} />
                    ) : (
                      jobSalaries.map((row, i) => (
                        <tr key={row.jobTitle} className="animate-fade-in-up group hover:bg-violet-50/20 transition-colors" style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}>
                          <td className="py-4">
                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              {row.jobTitle}
                            </span>
                          </td>
                          <td className="py-4 text-right font-semibold tabular-nums text-violet-700">
                            {fmt(row.avgSalary)}
                          </td>
                          <td className="py-4 pl-6">
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

      </main>
    </div>
  );
}
