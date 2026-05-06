"use client";

import { useState, useEffect } from "react";
import type { Employee, EmployeeMeta } from "@/types/employee";
import EmployeeFormModal from "./EmployeeFormModal";

const DEFAULT_META: EmployeeMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0
};

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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg text-red-600 dark:bg-red-950/40 dark:text-red-300">
            ✕
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Delete Employee</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{employeeName}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Table skeleton ───────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
          {/* Avatar + name */}
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="h-3.5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </td>
          {/* Job title badge */}
          <td className="px-5 py-4">
            <div className="h-6 w-28 rounded-md bg-gray-100 dark:bg-gray-800" />
          </td>
          {/* Department badge */}
          <td className="px-5 py-4">
            <div className="h-6 w-24 rounded-md bg-gray-100 dark:bg-gray-800" />
          </td>
          {/* Country pill */}
          <td className="px-5 py-4">
            <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
          </td>
          {/* Salary */}
          <td className="px-5 py-4 text-right">
            <div className="ml-auto h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800" />
          </td>
          {/* Actions */}
          <td className="px-5 py-4">
            <div className="ml-auto flex justify-end gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800" />
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center py-14 text-center">
          <svg
            className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {hasFilters ? "No employees match your filters." : "No employees yet."}
          </p>
          {hasFilters && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Try adjusting your search or filters.
            </p>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  meta,
  page,
  onPageChange
}: {
  meta: EmployeeMeta;
  page: number;
  onPageChange: (p: number) => void;
}) {
  const { total, totalPages, limit } = meta;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-700 dark:text-gray-200">{from}–{to}</span> of{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">{total.toLocaleString()}</span>{" "}
        employee{total !== 1 ? "s" : ""}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            ← Prev
          </button>

          <span className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function EmployeeDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<EmployeeMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey(k => k + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (country) params.set("country", country);
    if (jobTitle) params.set("jobTitle", jobTitle);

    fetch(`/api/employees?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then(json => {
        setEmployees(json.data ?? []);
        setMeta(json.meta ?? DEFAULT_META);
        setLoading(false);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [search, country, jobTitle, page, refreshKey]);

  function handleFilterChange(
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1);
    };
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
    <div className="min-h-screen bg-gray-50 transition-colors duration-300 dark:bg-gray-950">
      {/* ── Page header ── */}
      <header className="border-b border-gray-200 bg-white transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Employees
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Manage your workforce efficiently
            </p>
          </div>
          <button
            onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 active:bg-blue-800 transition-all duration-150"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Employee
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* ── Stats summary row ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            }
            iconBg="bg-blue-50"
            label="Total Employees"
            value={loading ? "—" : meta.total.toLocaleString()}
          />
          <StatCard
            icon={
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
            iconBg="bg-emerald-50"
            label="Avg Salary (this page)"
            value={loading ? "—" : avgSalary.toLocaleString()}
          />
          <StatCard
            icon={
              <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            }
            iconBg="bg-violet-50"
            label="Countries (this page)"
            value={loading ? "—" : String(countriesOnPage)}
          />
        </div>

        {/* ── Filter card ── */}
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Filter & Search
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
        </div>

        {/* ── Table card ── */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Employee Records
            </p>
            {!loading && meta.total > 0 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {meta.total.toLocaleString()} total
              </span>
            )}
          </div>

          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Full Name
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Job Title
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Department
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Country
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Salary
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableSkeleton />
              ) : employees.length === 0 ? (
                <EmptyState hasFilters={hasFilters} />
              ) : (
                employees.map((emp, i) => (
                  <tr
                    key={emp.id}
                    className="animate-fade-in-up group border-l-2 border-l-transparent transition-colors duration-150 hover:border-l-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
                    style={{ animationDelay: `${i * 25}ms`, opacity: 0 }}
                  >
                    {/* Full Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 transition-transform duration-150 group-hover:scale-110 dark:bg-blue-950/40 dark:text-blue-300">
                          {emp.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {emp.fullName}
                        </span>
                      </div>
                    </td>

                    {/* Job Title */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors duration-150 group-hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-gray-700">
                        {emp.jobTitle}
                      </span>
                    </td>

                    {/* Country */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-md bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                        {emp.department}
                      </span>
                    </td>

                    {/* Country */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                        {emp.country}
                      </span>
                    </td>

                    {/* Salary */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
                        {emp.salary.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    </td>

                    {/* Actions — always visible, color on hover */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Edit employee"
                          onClick={() => { setEditingEmployee(emp); setModalOpen(true); }}
                          className="rounded-lg p-1.5 text-gray-300 transition-all duration-150 hover:bg-blue-50 hover:text-blue-600 active:scale-90 dark:text-gray-500 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          title="Delete employee"
                          onClick={() => setDeletingEmployee(emp)}
                          className="rounded-lg p-1.5 text-gray-300 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90 dark:text-gray-500 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination inside card footer */}
          <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800">
            <Pagination meta={meta} page={page} onPageChange={setPage} />
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
    </div>
  );
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  label,
  value
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{value}</p>
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
