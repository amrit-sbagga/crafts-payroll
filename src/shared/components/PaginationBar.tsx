import type { EmployeeMeta } from "@/types/employee";

export default function PaginationBar({
  meta,
  page,
  onPageChange,
  onLimitChange,
}: {
  meta: EmployeeMeta;
  page: number;
  onPageChange: (p: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const { total, totalPages, limit } = meta;
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  function clampPage(next: number) {
    if (totalPages === 0) return 1;
    return Math.min(Math.max(1, next), totalPages);
  }

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600 lg:flex-row lg:items-center lg:justify-between dark:text-gray-300">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-700 dark:text-gray-200">{from}-{to}</span> of{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">{total.toLocaleString()}</span>{" "}
        employee{total !== 1 ? "s" : ""}
      </span>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          Rows per page
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        {totalPages > 1 && (
          <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            Page
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={(e) => onPageChange(clampPage(Number(e.target.value) || 1))}
              className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
            <span>of {totalPages}</span>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1 self-start sm:self-auto">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            ← Prev
          </button>

          <span className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
            {page}/{totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
