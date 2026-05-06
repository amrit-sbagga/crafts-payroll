"use client";

import { useEffect, useRef } from "react";

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

export type PayrollReport = {
  month: number;
  year: number;
  totalEmployees: number;
  totalPayout: number;
  avgPayout: number;
  createdAt: string;
};

type Props = {
  report: PayrollReport;
  onClose: () => void;
};

export default function PayrollReportModal({ report, onClose }: Props) {
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
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            ✓
          </span>
          <div>
            <h3 id="payroll-complete-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Payroll Run Complete
            </h3>
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
