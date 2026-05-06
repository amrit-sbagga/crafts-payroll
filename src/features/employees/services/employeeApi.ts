import type { Employee } from "@/types/employee";

type EmployeeListResponse = {
  data: Employee[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function fetchEmployees(query: URLSearchParams, signal?: AbortSignal): Promise<EmployeeListResponse> {
  const response = await fetch(`/api/employees?${query}`, { signal });
  if (!response.ok) throw new Error("Failed to load employees");
  return response.json();
}

export async function deleteEmployeeById(id: string) {
  const response = await fetch(`/api/employees/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete employee");
}

export async function runPayroll(month: number, year: number) {
  const response = await fetch("/api/payroll/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month, year })
  });
  if (!response.ok) throw new Error("Payroll run failed");
  return response.json();
}
