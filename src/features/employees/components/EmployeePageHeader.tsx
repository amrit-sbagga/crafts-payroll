"use client";

type Props = {
  onRunPayroll: () => void;
  onAddEmployee: () => void;
};

export default function EmployeePageHeader({ onRunPayroll, onAddEmployee }: Props) {
  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl dark:text-gray-100">Employees</h1>
          <p className="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">Manage your workforce efficiently</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            onClick={onRunPayroll}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition-all duration-150 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:flex-none sm:text-sm dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
          >
            Run Payroll
          </button>
          <button
            onClick={onAddEmployee}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 active:bg-blue-800 sm:flex-none sm:text-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>
    </header>
  );
}
