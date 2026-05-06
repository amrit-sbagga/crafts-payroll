"use client";

import type { ReactNode } from "react";

type TrendTone = "up" | "down" | "neutral";

export default function MetricCard({
  icon,
  iconBg,
  accentColor,
  label,
  description,
  value,
  loading,
  compact = false,
  trend,
  trendTone = "neutral",
}: {
  icon: ReactNode;
  iconBg: string;
  accentColor: string;
  label: string;
  description: string;
  value: string;
  loading: boolean;
  compact?: boolean;
  trend?: string;
  trendTone?: TrendTone;
}) {
  const trendClasses =
    trendTone === "up"
      ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30"
      : trendTone === "down"
        ? "text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/30"
        : "text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-800";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 dark:hover:shadow-black/30 ${
        compact ? "p-3.5" : "p-6"
      }`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${accentColor}`} />

      <div className="pl-2">
        <div className={`${compact ? "mb-2" : "mb-4"} flex items-center justify-between`}>
          <div
            className={`inline-flex items-center justify-center rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110 ${
              compact ? "h-7 w-7" : "h-10 w-10"
            }`}
          >
            {icon}
          </div>
          {trend && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${trendClasses}`}>
              {trend}
            </span>
          )}
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {label}
        </p>

        {loading ? (
          <div className={`${compact ? "mt-1.5" : "mt-2"} space-y-2`}>
            <div className={`${compact ? "h-6 w-24" : "h-9 w-32"} animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800`} />
            <div className="h-3 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        ) : (
          <>
            <p
              className={`mt-1 font-extrabold tabular-nums tracking-tight text-gray-900 dark:text-gray-100 ${
                compact ? "text-xl" : "text-3xl"
              }`}
            >
              {value}
            </p>
            <p className={`${compact ? "mt-1" : "mt-1.5"} text-xs text-gray-500 dark:text-gray-400`}>{description}</p>
          </>
        )}
      </div>
    </div>
  );
}
