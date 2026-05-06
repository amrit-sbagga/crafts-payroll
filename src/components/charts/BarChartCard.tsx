"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarChartCardProps {
  /** Title shown in card header */
  title: string;
  /** Subtitle shown below title */
  subtitle?: string;
  /** Dataset — array of plain objects */
  data: Record<string, string | number>[];
  /** Key used for the X-axis category label */
  xKey: string;
  /** Key used for the bar value */
  yKey: string;
  /** Bar fill color (Tailwind-compatible hex or CSS color) */
  color?: string;
  /** Optional: format the Y-axis and tooltip values */
  formatValue?: (v: number) => string;
  /** Height of the chart in px — default 260 */
  height?: number;
  loading?: boolean;
}

// ─── Default colors cycling for multi-series if needed ───────────────────────

const DEFAULT_COLOR = "#6366f1"; // indigo-500

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  formatValue: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="mb-0.5 text-xs font-semibold text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900">{formatValue(payload[0].value)}</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BarChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="flex items-end gap-3 px-4 pb-4"
      style={{ height }}
    >
      {[70, 45, 90, 55, 80, 35, 65].map((h, i) => (
        <div key={i} className="flex-1">
          <div
            className="animate-pulse rounded-t-md bg-gray-100"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 80}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BarChartCard({
  title,
  subtitle,
  data,
  xKey,
  yKey,
  color = DEFAULT_COLOR,
  formatValue = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 0 }),
  height = 260,
  loading = false,
}: BarChartCardProps) {
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
      <div className="px-2 py-4">
        {loading ? (
          <BarChartSkeleton height={height} />
        ) : data.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ height }}
          >
            <p className="text-sm text-gray-400">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              barCategoryGap="35%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatValue}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip
                content={<ChartTooltip formatValue={formatValue} />}
                cursor={{ fill: "#f8fafc", radius: 6 }}
              />
              <Bar dataKey={yKey} radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={color}
                    fillOpacity={i === data.length - 1 ? 1 : 0.75 + (i / data.length) * 0.25}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
