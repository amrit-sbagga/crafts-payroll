"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PaginationBar from "@/features/employees/components/PaginationBar";
import EmployeeDataTable from "@/features/employees/components/EmployeeDataTable";
import EmployeePageHeader from "@/features/employees/components/EmployeePageHeader";
import EmployeeFilterBar from "@/features/employees/components/EmployeeFilterBar";
import EmployeeDeleteDialog from "@/features/employees/components/EmployeeDeleteDialog";
import RunPayrollModal from "@/features/employees/components/RunPayrollModal";
import PayrollReportModal, { type PayrollReport } from "@/features/employees/components/PayrollReportModal";
import useEmployees, { type EmployeesInitialData } from "@/features/employees/hooks/useEmployees";
import { deleteEmployeeById, deleteEmployeesBulk, runPayroll } from "@/features/employees/services/employeeApi";
import type { Employee } from "@/types/employee";
import EmployeeFormModal from "./EmployeeFormModal";

export default function EmployeeDashboard({ initialData }: { initialData?: EmployeesInitialData }) {
  const {
    employees,
    meta,
    loading,
    loadError,
    search,
    country,
    jobTitle,
    hasFilters,
    sortBy,
    sortOrder,
    page,
    setPage,
    setLimit,
    refresh,
    onSort,
    updateSearch,
    updateCountry,
    updateJobTitle,
    clearFilters,
    addEmployeeLocally,
    updateEmployeeLocally,
    removeEmployeeById,
    removeEmployeesByIds
  } = useEmployees(initialData);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<(typeof employees)[number] | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [payrollSubmitting, setPayrollSubmitting] = useState(false);
  const [payrollReport, setPayrollReport] = useState<PayrollReport | null>(null);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [payrollError, setPayrollError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);

  const selectedOnPageCount = useMemo(
    () => employees.filter(e => selectedIds.has(e.id)).length,
    [employees, selectedIds]
  );

  const allOnPageSelected = employees.length > 0 && selectedOnPageCount === employees.length;
  const someOnPageSelected = selectedOnPageCount > 0 && !allOnPageSelected;

  useEffect(() => {
    const valid = new Set(employees.map(e => e.id));
    setSelectedIds(prev => {
      const next = new Set([...prev].filter(id => valid.has(id)));
      if (next.size === prev.size && [...prev].every(id => next.has(id))) return prev;
      return next;
    });
  }, [employees]);

  const toggleRowSelected = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllOnPage = useCallback(() => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const everySelected = employees.length > 0 && employees.every(e => next.has(e.id));
      if (everySelected) {
        employees.forEach(e => next.delete(e.id));
      } else {
        employees.forEach(e => next.add(e.id));
      }
      return next;
    });
  }, [employees]);

  useEffect(() => {
    if (!successToast) return;
    const timer = window.setTimeout(() => setSuccessToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [successToast]);

  async function handleDeleteConfirmed() {
    if (!deletingEmployee) return;
    const deletingName = deletingEmployee.fullName;
    const deletingId = deletingEmployee.id;
    setDeletingEmployee(null);
    const shouldGoPrevPage = employees.length === 1 && page > 1;

    removeEmployeeById(deletingId);

    try {
      await deleteEmployeeById(deletingId);
      setSuccessToast(`Deleted ${deletingName}`);
      if (shouldGoPrevPage) {
        setPage(p => p - 1);
        refresh();
      }
    } catch {
      refresh();
    }
  }

  async function handleBulkDeleteConfirmed() {
    if (!bulkDeleteIds || bulkDeleteIds.length === 0) return;
    const ids = bulkDeleteIds;
    setBulkDeleteIds(null);
    const clearsCurrentPage = employees.length > 0 && employees.every(e => ids.includes(e.id));
    const goPrevPage = clearsCurrentPage && page > 1;

    removeEmployeesByIds(ids);

    try {
      const { deleted } = await deleteEmployeesBulk(ids);
      setSelectedIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
      setSuccessToast(`Deleted ${deleted} employee${deleted === 1 ? "" : "s"}`);
      if (deleted !== ids.length) {
        refresh();
      } else if (goPrevPage) {
        setPage(p => p - 1);
        refresh();
      } else if (clearsCurrentPage && page === 1) {
        refresh();
      }
    } catch {
      refresh();
    }
  }

  function handleModalSuccess(savedEmployee: Employee) {
    const wasEditing = editingEmployee !== null;
    setModalOpen(false);
    setEditingEmployee(null);
    if (wasEditing) {
      updateEmployeeLocally(savedEmployee);
      setSuccessToast(`Updated ${savedEmployee.fullName}`);
    } else {
      addEmployeeLocally(savedEmployee);
      refresh();
      setSuccessToast(`Added ${savedEmployee.fullName}`);
    }
  }

  async function handleRunPayroll() {
    setPayrollSubmitting(true);
    setPayrollError(null);
    try {
      const json = await runPayroll(payrollMonth, payrollYear);
      setPayrollModalOpen(false);
      setPayrollReport(json.data);
    } catch {
      setPayrollError("Could not complete payroll run. Please try again.");
    } finally {
      setPayrollSubmitting(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-56px)] flex-col overflow-hidden bg-transparent transition-colors duration-300 dark:bg-gray-950">
      <EmployeePageHeader
        onRunPayroll={() => {
          setPayrollError(null);
          setPayrollModalOpen(true);
        }}
        onAddEmployee={() => {
          setEditingEmployee(null);
          setModalOpen(true);
        }}
      />

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
          <EmployeeFilterBar
            search={search}
            country={country}
            jobTitle={jobTitle}
            hasFilters={hasFilters}
            onSearchChange={updateSearch}
            onCountryChange={updateCountry}
            onJobTitleChange={updateJobTitle}
            onClear={clearFilters}
          />

          {/* ── Fixed-height table workspace ── */}
          <div className="h-full min-h-0">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Employee Records
                </p>
                <div className="flex items-center gap-2">
                  {loading && employees.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Refreshing...</span>
                  )}
                  {!loading && meta.total > 0 && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {meta.total.toLocaleString()} total
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const ids = employees.filter(e => selectedIds.has(e.id)).map(e => e.id);
                      if (ids.length === 0) return;
                      setBulkDeleteIds(ids);
                    }}
                    disabled={loading || selectedOnPageCount === 0}
                    title={
                      selectedOnPageCount === 0
                        ? "Select employees to delete"
                        : `Delete ${selectedOnPageCount} selected employee${selectedOnPageCount === 1 ? "" : "s"}`
                    }
                    aria-label="Delete selected employees"
                    className="density-btn inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    <span className="hidden sm:inline">Delete selected</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => refresh()}
                    disabled={loading}
                    title="Refresh list from server"
                    aria-label="Refresh employee list"
                    className="density-btn inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto pr-1">
                <EmployeeDataTable
                  loading={loading}
                  employees={employees}
                  hasFilters={hasFilters}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                  onEdit={(emp) => {
                    setEditingEmployee(emp);
                    setModalOpen(true);
                  }}
                  onDelete={(emp) => setDeletingEmployee(emp)}
                  selectedIds={selectedIds}
                  onToggleRow={toggleRowSelected}
                  onToggleSelectAllOnPage={toggleSelectAllOnPage}
                  allOnPageSelected={allOnPageSelected}
                  someOnPageSelected={someOnPageSelected}
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
        <EmployeeDeleteDialog
          variant="single"
          employeeName={deletingEmployee.fullName}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingEmployee(null)}
        />
      )}

      {bulkDeleteIds && bulkDeleteIds.length > 0 && (
        <EmployeeDeleteDialog
          variant="bulk"
          count={bulkDeleteIds.length}
          onConfirm={handleBulkDeleteConfirmed}
          onCancel={() => setBulkDeleteIds(null)}
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

      {successToast && (
        <div className="animate-fade-in-up pointer-events-none fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-md dark:border-emerald-900/50 dark:bg-gray-900 dark:text-emerald-300">
          {successToast}
        </div>
      )}
    </div>
  );
}
