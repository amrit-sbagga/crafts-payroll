"use client";

import { useEffect, useRef } from "react";

type Props =
  | {
      variant: "single";
      employeeName: string;
      onConfirm: () => void;
      onCancel: () => void;
    }
  | {
      variant: "bulk";
      count: number;
      onConfirm: () => void;
      onCancel: () => void;
    };

export default function EmployeeDeleteDialog(props: Props) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const { onConfirm, onCancel } = props;

  useEffect(() => {
    cancelButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const titleId = props.variant === "bulk" ? "delete-employees-title" : "delete-employee-title";
  const title = props.variant === "bulk" ? "Delete employees" : "Delete Employee";
  const body =
    props.variant === "bulk" ? (
      <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
        Permanently delete <span className="font-semibold">{props.count}</span> selected employee
        {props.count === 1 ? "" : "s"} on this page? This cannot be undone.
      </p>
    ) : (
      <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
        Are you sure you want to delete <span className="font-semibold">{props.employeeName}</span>?
      </p>
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg text-red-600 dark:bg-red-950/40 dark:text-red-300">
            ✕
          </span>
          <div>
            <h3 id={titleId} className="font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
          </div>
        </div>
        {body}
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
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
