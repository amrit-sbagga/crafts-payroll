import type { Employee } from "@/types/employee";
import DataTable from "@/shared/components/DataTable";
import EmptyState from "@/shared/components/EmptyState";

type SortField = "fullName" | "jobTitle" | "country" | "department" | "salary" | "createdAt";
type SortOrder = "asc" | "desc";

export default function EmployeeDataTable({
  loading,
  employees,
  hasFilters,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  employees: Employee[];
  hasFilters: boolean;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}) {
  return (
    <DataTable minWidthClass="min-w-[980px]">
      <thead className="sticky top-0 z-10">
        <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
          {[
            ["fullName", "Full Name", "left"],
            ["jobTitle", "Job Title", "left"],
            ["department", "Department", "left"],
            ["country", "Country", "left"],
            ["salary", "Salary", "right"],
            ["createdAt", "Created Date", "left"],
          ].map(([field, label, align]) => (
            <th
              key={String(field)}
              className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 ${
                align === "right" ? "text-right" : "text-left"
              }`}
            >
              <button
                type="button"
                onClick={() => onSort(field as SortField)}
                className={`inline-flex items-center gap-1 transition-colors hover:text-gray-600 dark:hover:text-gray-300 ${
                  align === "right" ? "ml-auto" : ""
                }`}
              >
                <span>{label}</span>
                <span className="text-[10px]">
                  {sortBy === field ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                </span>
              </button>
            </th>
          ))}
          <th className="w-[120px] min-w-[120px] px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          <TableSkeleton />
        ) : employees.length === 0 ? (
          <tr>
            <td colSpan={7}>
              <EmptyState
                title={hasFilters ? "No employees match your filters." : "No employees yet."}
                subtitle={hasFilters ? "Try adjusting your search or filters." : undefined}
                icon={
                  <svg
                    className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>
                }
              />
            </td>
          </tr>
        ) : (
          employees.map((emp, i) => (
            <tr
              key={emp.id}
              className="animate-fade-in-up group border-l-2 border-l-transparent transition-colors duration-150 hover:border-l-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20"
              style={{ animationDelay: `${i * 25}ms`, opacity: 0 }}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 transition-transform duration-150 group-hover:scale-110 dark:bg-blue-950/40 dark:text-blue-300">
                    {emp.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{emp.fullName}</span>
                </div>
              </td>

              <td className="px-5 py-4">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors duration-150 group-hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-gray-700">
                  {emp.jobTitle}
                </span>
              </td>

              <td className="px-5 py-4">
                <span className="inline-flex items-center rounded-md bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  {emp.department}
                </span>
              </td>

              <td className="px-5 py-4">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
                  {emp.country}
                </span>
              </td>

              <td className="px-5 py-4 text-right">
                <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
                  {emp.salary.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
              </td>

              <td className="px-5 py-4">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {new Date(emp.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </td>

              <td className="w-[120px] min-w-[120px] px-5 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    title="Edit employee"
                    onClick={() => onEdit(emp)}
                    className="rounded-lg p-1.5 text-gray-300 transition-all duration-150 hover:bg-blue-50 hover:text-blue-600 active:scale-90 dark:text-gray-500 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    title="Delete employee"
                    onClick={() => onDelete(emp)}
                    className="rounded-lg p-1.5 text-gray-300 transition-all duration-150 hover:bg-red-50 hover:text-red-500 active:scale-90 dark:text-gray-500 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </DataTable>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="h-3.5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </td>
          <td className="px-5 py-4">
            <div className="h-6 w-28 rounded-md bg-gray-100 dark:bg-gray-800" />
          </td>
          <td className="px-5 py-4">
            <div className="h-6 w-24 rounded-md bg-gray-100 dark:bg-gray-800" />
          </td>
          <td className="px-5 py-4">
            <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-800" />
          </td>
          <td className="px-5 py-4 text-right">
            <div className="ml-auto h-3.5 w-20 rounded bg-gray-100 dark:bg-gray-800" />
          </td>
          <td className="px-5 py-4">
            <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-gray-800" />
          </td>
          <td className="px-5 py-4">
            <div className="ml-auto flex justify-end gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800" />
              <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
