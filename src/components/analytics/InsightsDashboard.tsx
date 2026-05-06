"use client";

import { useState, useEffect } from "react";
import type {
  CountrySalaryStats,
  JobTitleSalaryStats,
  GlobalSalarySummary
} from "@/modules/employee/employeeAnalytics.service";

function fmt(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  loading
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {loading ? <span className="text-gray-300">—</span> : value}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  children
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">{title}</div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function TableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-4 flex-1 animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function InsightsDashboard() {
  const [summary, setSummary] = useState<GlobalSalarySummary | null>(null);
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [countrySalaries, setCountrySalaries] = useState<
    CountrySalaryStats[]
  >([]);
  const [jobSalaries, setJobSalaries] = useState<JobTitleSalaryStats[]>([]);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [countryLoading, setCountryLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [summaryError, setSummaryError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [jobError, setJobError] = useState(false);

  // Fetch global summary + total employees on mount
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

  // Fetch country salaries on mount
  useEffect(() => {
    setCountryLoading(true);
    setCountryError(false);

    fetch("/api/analytics/country-salaries")
      .then(r => r.json())
      .then(json => setCountrySalaries(json.data ?? []))
      .catch(() => setCountryError(true))
      .finally(() => setCountryLoading(false));
  }, []);

  // Fetch job title salaries when country filter changes
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-bold text-gray-900">Salary Insights</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Aggregated salary analytics across all employees
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* ── Global Summary Cards ── */}
        {summaryError ? (
          <p className="text-sm text-red-500">
            Failed to load global summary.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard
              label="Total Employees"
              value={totalEmployees !== null ? totalEmployees.toLocaleString() : "—"}
              loading={summaryLoading}
            />
            <SummaryCard
              label="Overall Min Salary"
              value={summary ? fmt(summary.minSalary) : "—"}
              loading={summaryLoading}
            />
            <SummaryCard
              label="Overall Max Salary"
              value={summary ? fmt(summary.maxSalary) : "—"}
              loading={summaryLoading}
            />
            <SummaryCard
              label="Overall Avg Salary"
              value={summary ? fmt(summary.avgSalary) : "—"}
              loading={summaryLoading}
            />
          </div>
        )}

        {/* ── Country Salary Overview ── */}
        <SectionCard
          title={
            <h2 className="text-sm font-semibold text-gray-800">
              Country Salary Overview
            </h2>
          }
        >
          {countryError ? (
            <p className="text-sm text-red-500">
              Failed to load country salaries.
            </p>
          ) : countryLoading ? (
            <TableSkeleton cols={4} />
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Country", "Min Salary", "Max Salary", "Avg Salary"].map(
                    h => (
                      <th
                        key={h}
                        className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {countrySalaries.map(row => (
                  <tr key={row.country} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">
                      {row.country}
                    </td>
                    <td className="py-3 text-gray-600">
                      {fmt(row.minSalary)}
                    </td>
                    <td className="py-3 text-gray-600">
                      {fmt(row.maxSalary)}
                    </td>
                    <td className="py-3 font-medium text-blue-700">
                      {fmt(row.avgSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        {/* ── Job Title Salary Overview ── */}
        <SectionCard
          title={
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Job Title Salary Overview
              </h2>
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {countryOptions.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          {jobError ? (
            <p className="text-sm text-red-500">
              Failed to load job title salaries.
            </p>
          ) : jobLoading ? (
            <TableSkeleton cols={2} rows={6} />
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Job Title", "Avg Salary"].map(h => (
                    <th
                      key={h}
                      className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobSalaries.map(row => (
                  <tr key={row.jobTitle} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">
                      {row.jobTitle}
                    </td>
                    <td className="py-3 font-medium text-blue-700">
                      {fmt(row.avgSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      </main>
    </div>
  );
}
