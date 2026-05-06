"use client";

import TableToolbar from "@/shared/components/TableToolbar";

type Props = {
  anyLoading: boolean;
  selectedCountry: string;
  selectedDepartment: string;
  countryOptions: string[];
  departmentOptions: string[];
  onOpenExport: () => void;
  onCountryChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onRefresh: () => void;
};

export default function AnalyticsFiltersToolbar({
  anyLoading,
  selectedCountry,
  selectedDepartment,
  countryOptions,
  departmentOptions,
  onOpenExport,
  onCountryChange,
  onDepartmentChange,
  onRefresh
}: Props) {
  return (
    <TableToolbar stickyTopClass="sticky top-[66px]">
      <button
        type="button"
        onClick={onOpenExport}
        disabled={anyLoading}
        className="density-btn inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Export Report
      </button>

      <div className="density-btn inline-flex min-w-[170px] items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        Date Range (Coming soon)
      </div>

      <select
        value={selectedCountry}
        onChange={e => onCountryChange(e.target.value)}
        className="density-input min-w-[150px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
      >
        <option value="">All Countries</option>
        {countryOptions.map(country => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <select
        value={selectedDepartment}
        onChange={e => onDepartmentChange(e.target.value)}
        className="density-input min-w-[170px] rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
      >
        <option value="">All Departments</option>
        {departmentOptions.map(department => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onRefresh}
        disabled={anyLoading}
        className="density-btn inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356m-1.176 13.86A9 9 0 0 1 6.343 6.343M3 3v5h5" />
        </svg>
        Refresh
      </button>
    </TableToolbar>
  );
}
