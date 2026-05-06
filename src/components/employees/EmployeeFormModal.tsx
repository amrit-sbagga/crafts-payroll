"use client";

import { useState, useEffect, useRef } from "react";
import type { Employee, Department, Gender } from "@/types/employee";

type Props = {
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  fullName: string;
  jobTitle: string;
  country: string;
  department: Department;
  gender: Gender;
  joiningDate: string;
  avatarUrl: string;
  salary: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const DEPARTMENTS: Department[] = [
  "Engineering",
  "HR",
  "Finance",
  "Sales",
  "Operations",
  "Marketing"
];

const GENDERS: Gender[] = ["Male", "Female", "Other"];

export default function EmployeeFormModal({
  employee,
  onClose,
  onSuccess
}: Props) {
  const isEditing = employee !== null;
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    fullName: employee?.fullName ?? "",
    jobTitle: employee?.jobTitle ?? "",
    country: employee?.country ?? "",
    department: employee?.department ?? "Engineering",
    gender: employee?.gender ?? "Other",
    joiningDate: employee?.joiningDate ? employee.joiningDate.slice(0, 10) : "",
    avatarUrl: employee?.avatarUrl ?? "",
    salary: employee ? String(employee.salary) : ""
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-focus first field on open
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setSubmitError(null);

    const url = isEditing ? `/api/employees/${employee.id}` : "/api/employees";

    try {
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, salary: Number(form.salary) })
      });

      if (res.ok) {
        onSuccess();
        return;
      }

      const json = await res.json();
      if (json.fields) {
        setErrors(json.fields);
      } else {
        setSubmitError("Unable to save employee. Please review details and try again.");
      }
    } catch {
      setSubmitError("Network error while saving. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-form-title"
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
              {isEditing ? (
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
              )}
            </div>
            <div>
              <h2 id="employee-form-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {isEditing ? "Edit Employee" : "Add New Employee"}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {isEditing
                  ? "Update employee details below"
                  : "Fill in the details to create a new record"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {submitError}
              </div>
            )}

            {/* Full Name — full width */}
            <Field
              ref={firstInputRef}
              label="Full Name"
              name="fullName"
              placeholder="e.g. Ada Lovelace"
              value={form.fullName}
              error={errors.fullName}
              onChange={handleChange}
            />

            {/* Job Title + Country + Department */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field
                label="Job Title"
                name="jobTitle"
                placeholder="e.g. Engineer"
                value={form.jobTitle}
                error={errors.jobTitle}
                onChange={handleChange}
              />
              <Field
                label="Country"
                name="country"
                placeholder="e.g. India"
                value={form.country}
                error={errors.country}
                onChange={handleChange}
              />
              <SelectField
                label="Department"
                name="department"
                value={form.department}
                options={DEPARTMENTS}
                onChange={handleChange}
              />
            </div>

            {/* Gender + Joining Date */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="Gender"
                name="gender"
                value={form.gender}
                options={GENDERS}
                onChange={handleChange}
                error={errors.gender}
              />
              <Field
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                error={errors.joiningDate}
                onChange={handleChange}
              />
            </div>

            <Field
              label="Avatar URL (optional)"
              name="avatarUrl"
              placeholder="https://..."
              value={form.avatarUrl}
              error={errors.avatarUrl}
              onChange={handleChange}
            />

            {/* Salary — full width */}
            <Field
              label="Salary"
              name="salary"
              type="number"
              placeholder="e.g. 800000"
              value={form.salary}
              error={errors.salary}
              onChange={handleChange}
              hint="Enter the annual gross salary"
            />
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:bg-blue-800 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────

const Field = function Field({
  label,
  name,
  type = "text",
  placeholder,
  value,
  error,
  hint,
  onChange,
  ref
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:bg-gray-900 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-800 dark:focus:border-red-500 dark:focus:ring-red-900/40"
            : "border-gray-200 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
        }`}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error.replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
};

const SelectField = function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  error
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:focus:bg-gray-900 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-800 dark:focus:border-red-500 dark:focus:ring-red-900/40"
            : "border-gray-200 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
        }`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error.replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
};
