"use client";

import { useState } from "react";
import type { Employee } from "@/types/employee";

type Props = {
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  fullName: string;
  jobTitle: string;
  country: string;
  salary: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function EmployeeFormModal({
  employee,
  onClose,
  onSuccess
}: Props) {
  const isEditing = employee !== null;

  const [form, setForm] = useState<FormState>({
    fullName: employee?.fullName ?? "",
    jobTitle: employee?.jobTitle ?? "",
    country: employee?.country ?? "",
    salary: employee ? String(employee.salary) : ""
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const url = isEditing
      ? `/api/employees/${employee.id}`
      : "/api/employees";

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
    }
    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-5 text-lg font-semibold text-gray-800">
          {isEditing ? "Edit Employee" : "Add Employee"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Full Name"
            name="fullName"
            value={form.fullName}
            error={errors.fullName}
            onChange={handleChange}
          />
          <Field
            label="Job Title"
            name="jobTitle"
            value={form.jobTitle}
            error={errors.jobTitle}
            onChange={handleChange}
          />
          <Field
            label="Country"
            name="country"
            value={form.country}
            error={errors.country}
            onChange={handleChange}
          />
          <Field
            label="Salary"
            name="salary"
            type="number"
            value={form.salary}
            error={errors.salary}
            onChange={handleChange}
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : isEditing ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  error,
  onChange
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 capitalize">
          {error.replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
}
