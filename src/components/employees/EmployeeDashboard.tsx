"use client";

import { useState, useEffect, useRef } from "react";
import type { Employee, EmployeeMeta } from "@/types/employee";
import PaginationBar from "@/features/employees/components/PaginationBar";
import EmployeeDataTable from "@/features/employees/components/EmployeeDataTable";
import EmployeeFormModal from "./EmployeeFormModal";

const DEFAULT_META: EmployeeMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

type PayrollReport = {
  month: number;
  year: number;
  totalEmployees: number;
  totalPayout: number;
  avgPayout: number;
  createdAt: string;
};

type SortField = "fullName" | "jobTitle" | "country" | "department" | "salary" | "createdAt";
type SortOrder = "asc" | "desc";

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteConfirmModal({
  employeeName,
  onConfirm,
  onCancel
}: {
  employeeName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-employee-title"
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg text-red-600 dark:bg-red-950/40 dark:text-red-300">
            ✕
          </span>
          <div>
            <h3 id="delete-employee-title" className="font-semibold text-gray-900 dark:text-gray-100">Delete Employee</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{employeeName}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function RunPayrollModal({
  month,
  year,
  submitting,
  errorMessage,
  onMonthChange,
  onYearChange,
  onRun,
  onClose
}: {
  month: number;
  year: number;
  submitting: boolean;
  errorMessage: string | null;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onRun: () => void;
  onClose: () => void;
}) {
  const runButtonRef = useRef<HTMLButtonElement>(null);
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

  useEffect(() => {
    runButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-payroll-title"
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="run-payroll-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">Run Monthly Payroll</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Select payroll period to generate payout summary.
        </p>
        {errorMessage && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {errorMessage}
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">Month</label>
            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/40"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">Year</label>
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/40"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            ref={runButtonRef}
            type="button"
            onClick={onRun}
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-60"
          >
            {submitting ? "Running..." : "Run Payroll"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PayrollReportModal({
  report,
  onClose
}: {
  report: PayrollReport;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payroll-complete-title"
        className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓
          </span>
          <div>
            <h3 id="payroll-complete-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payroll Run Complete</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {MONTH_NAMES[report.month - 1]} {report.year}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Employees Processed</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{report.totalEmployees.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Payout</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
              {report.totalPayout.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Payout</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
              {report.avgPayout.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<EmployeeMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [payrollSubmitting, setPayrollSubmitting] = useState(false);
  const [payrollReport, setPayrollReport] = useState<PayrollReport | null>(null);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [payrollError, setPayrollError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey(k => k + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      sortOrder
    });
    if (search) params.set("search", search);
    if (country) params.set("country", country);
    if (jobTitle) params.set("jobTitle", jobTitle);

    fetch(`/api/employees?${params}`, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load employees");
        return r.json();
      })
      .then(json => {
        setEmployees(json.data ?? []);
        setMeta(json.meta ?? DEFAULT_META);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadError("Failed to load employees. Please retry.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, country, jobTitle, page, limit, sortBy, sortOrder, refreshKey]);

  function handleFilterChange(
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  function handleSort(column: SortField) {
    if (sortBy === column) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder(column === "createdAt" ? "desc" : "asc");
    }
    setPage(1);
  }

  async function handleDeleteConfirmed() {
    if (!deletingEmployee) return;
    await fetch(`/api/employees/${deletingEmployee.id}`, { method: "DELETE" });
    setDeletingEmployee(null);
    if (employees.length === 1 && page > 1) {
      setPage(p => p - 1);
    } else {
      refresh();
    }
  }

  function handleModalSuccess() {
    setModalOpen(false);
    setEditingEmployee(null);
    refresh();
  }

  async function handleRunPayroll() {
    setPayrollSubmitting(true);
    setPayrollError(null);
    try {
      const res = await fetch("/api/payroll/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: payrollMonth, year: payrollYear })
      });
      if (!res.ok) throw new Error("Payroll run failed");
      const json = await res.json();
      setPayrollModalOpen(false);
      setPayrollReport(json.data);
    } catch {
      setPayrollError("Could not complete payroll run. Please try again.");
    } finally {
      setPayrollSubmitting(false);
    }
  }

  const hasFilters = Boolean(search || country || jobTitle);

  // Stats derived from already-fetched data — no extra API calls.
  const avgSalary =
    employees.length > 0
      ? Math.round(
          employees.reduce((sum, e) => sum + e.salary, 0) / employees.length
        )
      : 0;
  const countriesOnPage = new Set(employees.map(e => e.country)).size;

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col overflow-hidden bg-gray-50 transition-colors duration-300 dark:bg-gray-950">
      {/* ── Compact toolbar header ── */}
      <header className="border-b border-gray-200 bg-white/95 px-4 backdrop-blur transition-colors duration-300 sm:px-6 dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl dark:text-gray-100">
              Employees
            </h1>
            <p className="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              Manage your workforce efficiently
            </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              onClick={() => {
                setPayrollError(null);
                setPayrollModalOpen(true);
              }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition-all duration-150 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:flex-none sm:text-sm dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
            >
              Run Payroll
            </button>
            <button
              onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 active:bg-blue-800 sm:flex-none sm:text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Employee
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex h-full w-full max-w-[1500px] min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6">
        {loadError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={refresh}
              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-800 dark:hover:bg-red-950/40"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid min-h-0 flex-1 items-stretch gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* ── Vertical filter panel ── */}
          <aside className="self-start rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 lg:sticky lg:top-3 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Filter & Search
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCountry("");
                    setJobTitle("");
                    setPage(1);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-3">
              <FilterInput
                label="Employee name"
                placeholder="e.g. Ada Lovelace"
                value={search}
                onChange={handleFilterChange(setSearch)}
              />
              <FilterInput
                label="Country"
                placeholder="e.g. India"
                value={country}
                onChange={handleFilterChange(setCountry)}
              />
              <FilterInput
                label="Job title"
                placeholder="e.g. Engineer"
                value={jobTitle}
                onChange={handleFilterChange(setJobTitle)}
              />
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
              Tip: click column headers in the table to sort and use rows-per-page to navigate faster.
            </p>
          </aside>

          {/* ── Fixed-height table workspace ── */}
          <div className="h-full min-h-0">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Employee Records
                </p>
                {!loading && meta.total > 0 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {meta.total.toLocaleString()} total
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-auto pr-1">
                <EmployeeDataTable
                  loading={loading}
                  employees={employees}
                  hasFilters={hasFilters}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onEdit={(emp) => {
                    setEditingEmployee(emp);
                    setModalOpen(true);
                  }}
                  onDelete={(emp) => setDeletingEmployee(emp)}
                />
              </div>

              {/* Pagination inside card footer */}
              <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800">
                <PaginationBar
                  meta={meta}
                  page={page}
                  onPageChange={setPage}
                  onLimitChange={(nextLimit) => {
                    setLimit(nextLimit);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {modalOpen && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => { setModalOpen(false); setEditingEmployee(null); }}
          onSuccess={handleModalSuccess}
        />
      )}

      {deletingEmployee && (
        <DeleteConfirmModal
          employeeName={deletingEmployee.fullName}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingEmployee(null)}
        />
      )}

      {payrollModalOpen && (
        <RunPayrollModal
          month={payrollMonth}
          year={payrollYear}
          submitting={payrollSubmitting}
          errorMessage={payrollError}
          onMonthChange={setPayrollMonth}
          onYearChange={setPayrollYear}
          onRun={handleRunPayroll}
          onClose={() => {
            setPayrollModalOpen(false);
            setPayrollError(null);
          }}
        />
      )}

      {payrollReport && (
        <PayrollReportModal
          report={payrollReport}
          onClose={() => setPayrollReport(null)}
        />
      )}
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function StatCard({
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
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</p>
        {loading ? (
          <div className="mt-1 h-6 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        ) : (
          <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">{value}</p>
        )}
      </div>
    </div>
  );
}

function FilterInput({
  label,
  placeholder,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/40"
      />
    </div>
  );
}
