"use client";

import { useEffect, useRef } from "react";
import type { ExportFormat, ExportSelection } from "@/lib/exportReport";

export type ExportScope = "all" | "custom";

type Props = {
  open: boolean;
  loading: boolean;
  format: ExportFormat;
  scope: ExportScope;
  selection: ExportSelection;
  onFormatChange: (format: ExportFormat) => void;
  onScopeChange: (scope: ExportScope) => void;
  onSelectionChange: (next: ExportSelection) => void;
  onCancel: () => void;
  onExport: () => void;
};

export default function ExportDialog({
  open,
  loading,
  format,
  scope,
  selection,
  onFormatChange,
  onScopeChange,
  onSelectionChange,
  onCancel,
  onExport
}: Props) {
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    exportButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;
  const nothingSelected =
    scope === "custom" &&
    !selection.includeSummary &&
    !selection.includeCountryStats &&
    !selection.includeJobStats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-report-title"
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={event => event.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h3 id="export-report-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Export Report
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose file format and what data to include.</p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Format</p>
            <div className="flex gap-2">
              {(["csv", "pdf"] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onFormatChange(option)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    format === option
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-300"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Data scope</p>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <input type="radio" name="export-scope" checked={scope === "all"} onChange={() => onScopeChange("all")} />
                Export full report
              </label>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <input type="radio" name="export-scope" checked={scope === "custom"} onChange={() => onScopeChange("custom")} />
                Select sections
              </label>
            </div>
          </div>

          <div className={`space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700 ${scope === "all" ? "opacity-60" : ""}`}>
            {([
              { key: "includeSummary", label: "Global summary" },
              { key: "includeCountryStats", label: "Country salary stats" },
              { key: "includeJobStats", label: "Job title salary stats" }
            ] as const).map(item => (
              <label key={item.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  disabled={scope === "all"}
                  checked={selection[item.key]}
                  onChange={e =>
                    onSelectionChange({
                      ...selection,
                      [item.key]: e.target.checked
                    })
                  }
                />
                {item.label}
              </label>
            ))}
          </div>
          {nothingSelected && <p className="text-xs text-red-500 dark:text-red-400">Select at least one section to export.</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            ref={exportButtonRef}
            type="button"
            onClick={onExport}
            disabled={loading || nothingSelected}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
