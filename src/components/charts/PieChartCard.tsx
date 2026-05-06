"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PieSlice {
  name: string;
  value: number;
}

export interface PieChartCardProps {
  title: string;
  subtitle?: string;
  data: PieSlice[];
  /** Optional: format tooltip values */
  formatValue?: (v: number) => string;
  /** Palette of slice colors. Cycles if data.length > colors.length */
  colors?: string[];
  /** Height of the chart area in px — default 260 */
  height?: number;
  loading?: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
  formatValue: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: inner } = payload[0];
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <div className="mb-0.5 flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: inner.fill }}
        />
        <p className="text-xs font-semibold text-gray-500">{name}</p>
      </div>
      <p className="text-sm font-bold text-gray-900">{formatValue(value)}</p>
    </div>
  );
}

// ─── Custom legend ────────────────────────────────────────────────────────────

function ChartLegend({
  payload,
}: {
  payload?: { value: string; color: string }[];
}) {
  if (!payload) return null;
  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {payload.map((entry, i) => (
        <li key={i} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-xs text-gray-500">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PieChartSkeleton({ height }: { height: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4" style={{ height }}>
      <div className="h-36 w-36 animate-pulse rounded-full bg-gray-100" />
      <div className="flex gap-3">
        {[60, 48, 72].map((w, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded-full bg-gray-100"
            style={{ width: w, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PieChartCard({
  title,
  subtitle,
  data,
  formatValue = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 0 }),
  colors = DEFAULT_COLORS,
  height = 260,
  loading = false,
}: PieChartCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-5">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* Chart */}
      <div className="px-4 py-4">
        {loading ? (
          <PieChartSkeleton height={height} />
        ) : data.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ height }}
          >
            <p className="text-sm text-gray-400">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius="38%"
                outerRadius="62%"
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={colors[i % colors.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<ChartTooltip formatValue={formatValue} />}
              />
              <Legend content={<ChartLegend />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
