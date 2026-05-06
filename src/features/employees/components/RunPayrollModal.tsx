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

type Props = {
  month: number;
  year: number;
  submitting: boolean;
  errorMessage: string | null;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onRun: () => void;
  onClose: () => void;
};

export default function RunPayrollModal({
  month,
  year,
  submitting,
  errorMessage,
  onMonthChange,
  onYearChange,
  onRun,
  onClose
}: Props) {
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
        onClick={e => e.stopPropagation()}
      >
        <h3 id="run-payroll-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Run Monthly Payroll
        </h3>
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
              onChange={e => onMonthChange(Number(e.target.value))}
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
              onChange={e => onYearChange(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/40"
            >
              {years.map(y => (
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
