"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import usePagination from "@/hooks/usePagination";
import useSorting from "@/hooks/useSorting";
import type { Employee, EmployeeMeta } from "@/types/employee";
import { fetchEmployees } from "@/features/employees/services/employeeApi";

const DEFAULT_META: EmployeeMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0
};

type SortField = "fullName" | "jobTitle" | "country" | "department" | "salary" | "createdAt";

type EmployeesCacheState = {
  queryKey: string;
  employees: Employee[];
  meta: EmployeeMeta;
  search: string;
  country: string;
  jobTitle: string;
  page: number;
  limit: number;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
};

let employeesCache: EmployeesCacheState | null = null;

export type EmployeesInitialData = {
  data: Employee[];
  meta: EmployeeMeta;
  search?: string;
  country?: string;
  jobTitle?: string;
  sortBy?: SortField;
  sortOrder?: "asc" | "desc";
};

function buildQueryKey({
  page,
  limit,
  sortBy,
  sortOrder,
  search,
  country,
  jobTitle
}: {
  page: number;
  limit: number;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  search: string;
  country: string;
  jobTitle: string;
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder
  });
  if (search) params.set("search", search);
  if (country) params.set("country", country);
  if (jobTitle) params.set("jobTitle", jobTitle);
  return params.toString();
}

export default function useEmployees(initialData?: EmployeesInitialData) {
  const derivedInitialCache = useMemo(
    () =>
      initialData
        ? {
            queryKey: buildQueryKey({
              page: initialData.meta.page,
              limit: initialData.meta.limit,
              sortBy: initialData.sortBy ?? "createdAt",
              sortOrder: initialData.sortOrder ?? "desc",
              search: initialData.search ?? "",
              country: initialData.country ?? "",
              jobTitle: initialData.jobTitle ?? ""
            }),
            employees: initialData.data,
            meta: initialData.meta,
            search: initialData.search ?? "",
            country: initialData.country ?? "",
            jobTitle: initialData.jobTitle ?? "",
            page: initialData.meta.page,
            limit: initialData.meta.limit,
            sortBy: initialData.sortBy ?? "createdAt",
            sortOrder: initialData.sortOrder ?? "desc"
          }
        : null,
    [initialData]
  );

  const initialCache = employeesCache ?? derivedInitialCache;
  const [employees, setEmployees] = useState<Employee[]>(initialCache?.employees ?? []);
  const [meta, setMeta] = useState<EmployeeMeta>(initialCache?.meta ?? DEFAULT_META);
  const [loading, setLoading] = useState(!initialCache);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialCache?.search ?? "");
  const [country, setCountry] = useState(initialCache?.country ?? "");
  const [jobTitle, setJobTitle] = useState(initialCache?.jobTitle ?? "");
  const [refreshKey, setRefreshKey] = useState(0);
  const didSkipInitialFetch = useRef(false);

  const { page, limit, setPage, setLimit, resetPage } = usePagination(
    initialCache?.page ?? 1,
    initialCache?.limit ?? 20
  );
  const { sortBy, sortOrder, handleSort } = useSorting<SortField>(
    initialCache?.sortBy ?? "createdAt",
    initialCache?.sortOrder ?? "desc",
    field => (field === "createdAt" ? "desc" : "asc")
  );

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    if (!employeesCache && derivedInitialCache) {
      employeesCache = derivedInitialCache;
    }
  }, [derivedInitialCache]);

  useEffect(() => {
    const queryKey = buildQueryKey({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      country,
      jobTitle
    });
    const params = new URLSearchParams(queryKey);

    if (
      !didSkipInitialFetch.current &&
      refreshKey === 0 &&
      employeesCache?.queryKey === queryKey
    ) {
      didSkipInitialFetch.current = true;
      return;
    }

    didSkipInitialFetch.current = true;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    fetchEmployees(params, controller.signal, { bypassCache: refreshKey > 0 })
      .then(json => {
        const nextEmployees = json.data ?? [];
        const nextMeta = json.meta ?? DEFAULT_META;
        setEmployees(nextEmployees);
        setMeta(nextMeta);
        employeesCache = {
          queryKey,
          employees: nextEmployees,
          meta: nextMeta,
          search,
          country,
          jobTitle,
          page,
          limit,
          sortBy,
          sortOrder
        };
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError("Failed to load employees. Please retry.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, country, jobTitle, page, limit, sortBy, sortOrder, refreshKey]);

  const hasFilters = useMemo(() => Boolean(search || country || jobTitle), [search, country, jobTitle]);

  const updateSearch = useCallback(
    (value: string) => {
      setSearch(value);
      resetPage();
    },
    [resetPage]
  );

  const updateCountry = useCallback(
    (value: string) => {
      setCountry(value);
      resetPage();
    },
    [resetPage]
  );

  const updateJobTitle = useCallback(
    (value: string) => {
      setJobTitle(value);
      resetPage();
    },
    [resetPage]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setCountry("");
    setJobTitle("");
    resetPage();
  }, [resetPage]);

  const onSort = useCallback(
    (field: SortField) => {
      handleSort(field);
      resetPage();
    },
    [handleSort, resetPage]
  );

  const addEmployeeLocally = useCallback((employee: Employee) => {
    setEmployees(prev => {
      const next = [employee, ...prev];
      if (employeesCache) {
        employeesCache = {
          ...employeesCache,
          employees: next
        };
      }
      return next;
    });
    setMeta(prev => {
      const next = { ...prev, total: prev.total + 1 };
      if (employeesCache) {
        employeesCache = {
          ...employeesCache,
          meta: next
        };
      }
      return next;
    });
  }, []);

  const updateEmployeeLocally = useCallback((employee: Employee) => {
    setEmployees(prev => {
      const existingIndex = prev.findIndex(item => item.id === employee.id);
      if (existingIndex < 0) return prev;
      const next = [...prev];
      next[existingIndex] = employee;
      if (employeesCache) {
        employeesCache = {
          ...employeesCache,
          employees: next
        };
      }
      return next;
    });
  }, []);

  const removeEmployeeById = useCallback((id: string) => {
    setEmployees(prev => {
      const next = prev.filter(item => item.id !== id);
      if (employeesCache) {
        employeesCache = {
          ...employeesCache,
          employees: next
        };
      }
      return next;
    });
    setMeta(prev => {
      const next = { ...prev, total: Math.max(0, prev.total - 1) };
      if (employeesCache) {
        employeesCache = {
          ...employeesCache,
          meta: next
        };
      }
      return next;
    });
  }, []);

  return {
    employees,
    meta,
    loading,
    loadError,
    search,
    country,
    jobTitle,
    hasFilters,
    sortBy,
    sortOrder,
    page,
    limit,
    setPage,
    setLimit,
    refresh,
    onSort,
    updateSearch,
    updateCountry,
    updateJobTitle,
    clearFilters,
    addEmployeeLocally,
    updateEmployeeLocally,
    removeEmployeeById
  };
}
