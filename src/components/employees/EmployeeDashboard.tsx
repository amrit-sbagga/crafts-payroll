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
  }, [search, country, jobTitle, page]);

  function handleFilterChange(
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this employee?")) return;
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    // Refresh the current page; if last item on page, go back one
    setPage(prev =>
      employees.length === 1 && prev > 1 ? prev - 1 : prev
    );
    // Force re-fetch by toggling search no-op — simplest: trigger via key change
    setSearch(s => s);
  }

  function openAdd() {
    setEditingEmployee(null);
    setModalOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditingEmployee(employee);
    setModalOpen(true);
  }

  function handleModalSuccess() {
    setModalOpen(false);
    setEditingEmployee(null);
    setSearch(s => s); // trigger re-fetch
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Salary Management Tool
          </h1>
          <button
            onClick={openAdd}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Employee
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={handleFilterChange(setSearch)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
          <input
            type="text"
            placeholder="Filter by country…"
            value={country}
            onChange={handleFilterChange(setCountry)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
          <input
            type="text"
            placeholder="Filter by job title…"
            value={jobTitle}
            onChange={handleFilterChange(setJobTitle)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Full Name", "Job Title", "Country", "Salary", "Actions"].map(
                  h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Loading…
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {emp.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{emp.jobTitle}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.country}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.salary.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(emp)}
                          className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {meta.total} employee{meta.total !== 1 ? "s" : ""} &mdash; page{" "}
              {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {modalOpen && (
        <EmployeeFormModal
          employee={editingEmployee}
          onClose={() => {
            setModalOpen(false);
            setEditingEmployee(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
