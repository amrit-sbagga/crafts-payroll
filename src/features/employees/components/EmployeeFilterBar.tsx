"use client";

type Props = {
  search: string;
  country: string;
  jobTitle: string;
  hasFilters: boolean;
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onJobTitleChange: (value: string) => void;
  onClear: () => void;
};

function FilterInput({
  label,
  placeholder,
  value,
  onChange
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-300">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="density-input w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/40"
      />
    </div>
  );
}

export default function EmployeeFilterBar({
  search,
  country,
  jobTitle,
  hasFilters,
  onSearchChange,
  onCountryChange,
  onJobTitleChange,
  onClear
}: Props) {
  return (
    <aside className="density-panel self-start rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 lg:sticky lg:top-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Filter & Search</p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Clear
          </button>
        )}
      </div>
      <div className="density-stack space-y-3">
        <FilterInput label="Employee name" placeholder="e.g. Ada Lovelace" value={search} onChange={onSearchChange} />
        <FilterInput label="Country" placeholder="e.g. India" value={country} onChange={onCountryChange} />
        <FilterInput label="Job title" placeholder="e.g. Engineer" value={jobTitle} onChange={onJobTitleChange} />
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
        Tip: click column headers in the table to sort and use rows-per-page to navigate faster.
      </p>
    </aside>
  );
}
