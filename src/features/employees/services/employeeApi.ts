import type { Employee } from "@/types/employee";

type EmployeeListResponse = {
  data: Employee[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function fetchEmployees(
  query: URLSearchParams,
  signal?: AbortSignal,
  options?: { bypassCache?: boolean }
): Promise<EmployeeListResponse> {
  const params = new URLSearchParams(query);
  if (options?.bypassCache) {
    params.set("_ts", String(Date.now()));
  }
  const response = await fetch(`/api/employees?${params}`, {
    signal,
    cache: "no-store"
  });
  if (!response.ok) throw new Error("Failed to load employees");
  return response.json();
}

export async function deleteEmployeeById(id: string) {
  const response = await fetch(`/api/employees/${id}`, { method: "DELETE" });
  if (response.status === 204 || response.status === 404) return;
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
