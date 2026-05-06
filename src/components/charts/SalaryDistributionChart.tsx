"use client";
import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ─── Bucket definition ────────────────────────────────────────────────────────

interface Bucket {
  range: string;
  count: number;
  minVal: number;
  maxVal: number;
}

const BREAKPOINTS = [0, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, Infinity];
const LABELS      = ["<50K", "50K–100K", "100K–200K", "200K–500K", "500K–1M", "1M–2M", ">2M"];

function computeBuckets(salaries: number[]): Bucket[] {
  return LABELS.map((label, i) => ({
    range: label,
    count: salaries.filter(
      s => s >= BREAKPOINTS[i] && s < BREAKPOINTS[i + 1]
    ).length,
    minVal: BREAKPOINTS[i],
    maxVal: BREAKPOINTS[i + 1] === Infinity ? Infinity : BREAKPOINTS[i + 1],
  }));
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function DistributionTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: Bucket }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const { count } = payload[0].payload;
  return (
    <div className="min-w-[148px] rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/30">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-lg font-extrabold tabular-nums text-indigo-700 dark:text-indigo-300">
        {count.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">employees</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DistributionSkeleton() {
  return (
    <div className="space-y-3 px-6 py-4">
      <div className="flex items-end gap-2" style={{ height: 220 }}>
        {[15, 45, 80, 60, 90, 55, 30].map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="w-full animate-pulse rounded-t-md bg-gray-100 dark:bg-gray-800"
              style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
            />
            <div
              className="h-2.5 w-10 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800"
              style={{ animationDelay: `${i * 60 + 30}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SalaryDistributionChart() {
  const [salaries, setSalaries]   = useState<number[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [totalFetched, setTotalFetched] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    // Fetch up to 10 000 records in one call — sufficient for distribution
    fetch("/api/employees?limit=10000&page=1")
      .then(r => r.json())
      .then(json => {
        const employees: { salary: number }[] = json.data ?? [];
        setSalaries(employees.map(e => Number(e.salary)));
        setTotalFetched(json.meta?.total ?? employees.length);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const buckets = useMemo(() => computeBuckets(salaries), [salaries]);

  // median bucket index for reference line label
  const peakBucket = useMemo(
    () => buckets.reduce(
      (best, b, i) => (b.count > buckets[best].count ? i : best),
      0
    ),
    [buckets]
  );

  // percentage of employees in the peak bucket
  const peakPct = salaries.length
    ? Math.round((buckets[peakBucket]?.count / salaries.length) * 100)
    : 0;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 dark:hover:shadow-black/30"
      role="region"
      aria-label="Salary distribution chart"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between dark:border-gray-800">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Salary Distribution
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Number of employees per salary range
          </p>
        </div>

        {!loading && !error && (
          <div className="flex items-center gap-3">
            {/* Peak badge */}
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-right dark:border-indigo-900/60 dark:bg-indigo-950/40">
              <p className="text-xs font-medium text-indigo-500 dark:text-indigo-300">Peak Range</p>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-200">
                {buckets[peakBucket]?.range} · {peakPct}%
              </p>
            </div>
            {/* Total badge */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-right dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Analysed</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {totalFetched.toLocaleString()} emp.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend strip */}
      {!loading && !error && (
        <div className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/60 px-6 py-2.5 dark:border-gray-800 dark:bg-gray-900/70">
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-block h-2 w-4 rounded-full bg-indigo-400 opacity-70 dark:bg-indigo-300" />
            Employee count
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-block h-px w-5 border-t-2 border-dashed border-indigo-400 dark:border-indigo-300" />
            Peak range
          </span>
        </div>
      )}

      {/* Chart area */}
      <div className="px-2 py-5">
        {loading ? (
          <DistributionSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500 dark:text-red-300">Failed to load salary data.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={buckets}
              margin={{ top: 12, right: 24, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={isDark ? 0.38 : 0.25} />
                  <stop offset="95%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={isDark ? 0.08 : 0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? "#1f2937" : "#f1f5f9"}
              />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11, fill: isDark ? "#9ca3af" : "#64748b", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? "#6b7280" : "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={v =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <Tooltip content={<DistributionTooltip />} cursor={{ stroke: isDark ? "#374151" : "#e2e8f0", strokeWidth: 1 }} />

              {/* Dashed reference at peak */}
              <ReferenceLine
                x={buckets[peakBucket]?.range}
                stroke={isDark ? "#a5b4fc" : "#6366f1"}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{
                  value: "Peak",
                  position: "top",
                  fontSize: 10,
                  fill: isDark ? "#a5b4fc" : "#6366f1",
                  fontWeight: 700,
                }}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke={isDark ? "#818cf8" : "#6366f1"}
                strokeWidth={2.5}
                fill="url(#salaryGradient)"
                dot={{ r: 4, fill: isDark ? "#818cf8" : "#6366f1", strokeWidth: 2, stroke: isDark ? "#111827" : "#fff" }}
                activeDot={{ r: 6, fill: isDark ? "#818cf8" : "#6366f1", stroke: isDark ? "#111827" : "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
