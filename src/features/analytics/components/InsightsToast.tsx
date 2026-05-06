"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error";

type Props = {
  message: string;
  type: ToastType;
  onDismiss: () => void;
};

export default function InsightsToast({ message, type, onDismiss }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = type === "success";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex animate-fade-in-up items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl transition-all duration-300 ${
        isSuccess
          ? "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-900/60 dark:bg-gray-900 dark:text-emerald-300"
          : "border-red-200 bg-white text-red-600 dark:border-red-900/60 dark:bg-gray-900 dark:text-red-300"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isSuccess ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-red-50 dark:bg-red-950/40"}`}
      >
        {isSuccess ? "✓" : "✕"}
      </span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-1 rounded-md p-0.5 opacity-50 transition-opacity hover:opacity-100" aria-label="Dismiss">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
