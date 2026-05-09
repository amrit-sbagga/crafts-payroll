import {
  resolveInitialEmployeesCache,
  type EmployeesCacheState
} from "@/features/employees/hooks/useEmployees";
import type { Employee, EmployeeMeta } from "@/types/employee";

const DEFAULT_QUERY_KEY = "page=1&limit=20&sortBy=createdAt&sortOrder=desc";
const FILTERED_QUERY_KEY = `${DEFAULT_QUERY_KEY}&search=Ada`;

const meta: EmployeeMeta = {
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1
};

function employee(id: string, fullName: string): Employee {
  return {
    id,
    fullName,
    jobTitle: "Engineer",
    country: "India",
    department: "Engineering",
    gender: "Female",
    joiningDate: "2024-01-01T00:00:00.000Z",
    avatarUrl: null,
    salary: 1000,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  };
}

function cache(queryKey: string, fullName: string): EmployeesCacheState {
  return {
    queryKey,
    employees: [employee(fullName.toLowerCase().replace(/\s+/g, "-"), fullName)],
    meta,
    search: queryKey.includes("search=Ada") ? "Ada" : "",
    country: "",
    jobTitle: "",
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc"
  };
}

describe("resolveInitialEmployeesCache", () => {
  it("uses fresh server data when it matches the cached query", () => {
    const staleClientCache = cache(DEFAULT_QUERY_KEY, "Old Employee");
    const freshServerCache = cache(DEFAULT_QUERY_KEY, "New Employee");

    expect(resolveInitialEmployeesCache(staleClientCache, freshServerCache)).toBe(freshServerCache);
  });

  it("preserves cached filtered state when server data is for the default route", () => {
    const filteredClientCache = cache(FILTERED_QUERY_KEY, "Ada Lovelace");
    const defaultServerCache = cache(DEFAULT_QUERY_KEY, "Default Employee");

    expect(resolveInitialEmployeesCache(filteredClientCache, defaultServerCache)).toBe(filteredClientCache);
  });
});
