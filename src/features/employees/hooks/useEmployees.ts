"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<EmployeeMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const { page, limit, setPage, setLimit, resetPage } = usePagination(1, 20);
  const { sortBy, sortOrder, handleSort } = useSorting<SortField>(
    "createdAt",
    "desc",
    field => (field === "createdAt" ? "desc" : "asc")
  );

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      sortOrder
    });
    if (search) params.set("search", search);
    if (country) params.set("country", country);
    if (jobTitle) params.set("jobTitle", jobTitle);

    fetchEmployees(params, controller.signal)
      .then(json => {
        setEmployees(json.data ?? []);
        setMeta(json.meta ?? DEFAULT_META);
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
    clearFilters
  };
}
