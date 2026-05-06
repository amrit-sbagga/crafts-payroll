"use client";

type Props = {
  value: number;
  max: number;
  color?: string;
};

export default function SalaryBar({ value, max, color = "bg-blue-500" }: Props) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className={`h-full rounded-full ${color} transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">{pct}%</span>
    </div>
  );
}
