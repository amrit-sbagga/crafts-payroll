"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
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
  /** Bar fill color — hex or CSS color */
  color?: string;
  /** Highlight color for bars above the reference value */
  highlightColor?: string;
  /** Optional numeric reference line (e.g. overall average) */
  referenceValue?: number;
  /** Label for the reference line */
  referenceLabel?: string;
  /** Optional: format the Y-axis, tooltip, and bar label values */
  formatValue?: (v: number) => string;
  /** Height of the chart in px — default 280 */
  height?: number;
  loading?: boolean;
}

// ─── Default color ────────────────────────────────────────────────────────────

const DEFAULT_COLOR = "#3b82f6";       // blue-500
const DEFAULT_HIGHLIGHT = "#1d4ed8";   // blue-700 (above avg)

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  referenceValue,
  referenceLabel,
  formatValue,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  referenceValue?: number;
  referenceLabel?: string;
  formatValue: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const diff = referenceValue !== undefined ? val - referenceValue : null;
  return (
    <div className="min-w-[140px] rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-lg font-extrabold tabular-nums text-gray-900">
        {formatValue(val)}
      </p>
      {diff !== null && (
        <p className={`mt-1 text-xs font-medium ${diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {diff >= 0 ? "▲" : "▼"} {formatValue(Math.abs(diff))} vs {referenceLabel ?? "avg"}
        </p>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BarChartSkeleton({ height }: { height: number }) {
  return (
    <div className="flex items-end gap-3 px-6 pb-4 pt-2" style={{ height }}>
      {[55, 80, 40, 90, 65, 75, 50].map((h, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full animate-pulse rounded-t-lg bg-gray-100"
            style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
          />
          <div
            className="h-2.5 w-8 animate-pulse rounded-full bg-gray-100"
            style={{ animationDelay: `${i * 70 + 30}ms` }}
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
  highlightColor = DEFAULT_HIGHLIGHT,
  referenceValue,
  referenceLabel = "Avg",
  formatValue = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 0 }),
  height = 280,
  loading = false,
}: BarChartCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
          )}
        </div>
        {referenceValue !== undefined && !loading && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-right">
            <p className="text-xs font-medium text-blue-400">{referenceLabel}</p>
            <p className="text-sm font-bold tabular-nums text-blue-700">
              {formatValue(referenceValue)}
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-2 py-5">
        {loading ? (
          <BarChartSkeleton height={height} />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <p className="text-sm text-gray-400">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 24, left: 0, bottom: 4 }}
              barCategoryGap="40%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatValue}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatValue={formatValue}
                    referenceValue={referenceValue}
                    referenceLabel={referenceLabel}
                  />
                }
                cursor={{ fill: "#f8fafc", radius: 6 }}
              />

              {/* Reference line for overall average */}
              {referenceValue !== undefined && (
                <ReferenceLine
                  y={referenceValue}
                  stroke="#94a3b8"
                  strokeDasharray="5 4"
                  strokeWidth={1.5}
                  label={{
                    value: referenceLabel,
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "#94a3b8",
                    fontWeight: 600,
                  }}
                />
              )}

              <Bar dataKey={yKey} radius={[6, 6, 0, 0]} maxBarSize={64}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      referenceValue !== undefined &&
                      (entry[yKey] as number) >= referenceValue
                        ? highlightColor
                        : color
                    }
                  />
                ))}
                <LabelList
                  dataKey={yKey}
                  position="top"
                  formatter={(v: unknown) => formatValue(Number(v))}
                  style={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
