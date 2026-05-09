"use client";

import { useEffect, useMemo, useState } from "react";
import type { CountrySalaryStats, DepartmentSalaryStats, GlobalSalarySummary, JobTitleSalaryStats } from "@/modules/employee/employeeAnalytics.service";
import { fetchAnalyticsSummary, fetchCountrySalaries, fetchDepartmentSalaries, fetchJobSalaries } from "@/features/analytics/services/analyticsApi";

export type AnalyticsInitialData = {
  summary: GlobalSalarySummary | null;
  countrySalaries: CountrySalaryStats[];
  departmentSalaries: DepartmentSalaryStats[];
  jobSalaries: JobTitleSalaryStats[];
};

export default function useAnalytics(
  selectedCountry: string,
  selectedDepartment: string,
  refreshTick: number,
  initialData?: AnalyticsInitialData
) {
  const [summary, setSummary] = useState<GlobalSalarySummary | null>(initialData?.summary ?? null);
  const [countrySalaries, setCountrySalaries] = useState<CountrySalaryStats[]>(initialData?.countrySalaries ?? []);
  const [departmentSalaries, setDepartmentSalaries] = useState<DepartmentSalaryStats[]>(initialData?.departmentSalaries ?? []);
  const [jobSalaries, setJobSalaries] = useState<JobTitleSalaryStats[]>(initialData?.jobSalaries ?? []);

  const [summaryLoading, setSummaryLoading] = useState(!initialData?.summary);
  const [countryLoading, setCountryLoading] = useState(initialData?.countrySalaries.length === 0);
  const [departmentLoading, setDepartmentLoading] = useState(initialData?.departmentSalaries.length === 0);
  const [jobLoading, setJobLoading] = useState(initialData?.jobSalaries.length === 0);

  const [summaryError, setSummaryError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [departmentError, setDepartmentError] = useState(false);
  const [jobError, setJobError] = useState(false);

  useEffect(() => {
    if (initialData?.summary && refreshTick === 0) return;
    setSummaryLoading(true);
    setSummaryError(false);
    fetchAnalyticsSummary()
      .then((summaryJson) => {
        setSummary(summaryJson.data);
      })
      .catch(() => setSummaryError(true))
      .finally(() => setSummaryLoading(false));
  }, [refreshTick, initialData?.summary]);

  useEffect(() => {
    if (initialData?.countrySalaries.length && refreshTick === 0) return;
    setCountryLoading(true);
    setCountryError(false);
    fetchCountrySalaries()
      .then(json => setCountrySalaries(json.data ?? []))
      .catch(() => setCountryError(true))
      .finally(() => setCountryLoading(false));
  }, [refreshTick, initialData?.countrySalaries.length]);

  useEffect(() => {
    if (initialData?.departmentSalaries.length && refreshTick === 0) return;
    setDepartmentLoading(true);
    setDepartmentError(false);
    fetchDepartmentSalaries()
      .then(json => setDepartmentSalaries(json.data ?? []))
      .catch(() => setDepartmentError(true))
      .finally(() => setDepartmentLoading(false));
  }, [refreshTick, initialData?.departmentSalaries.length]);

  useEffect(() => {
    if (!selectedCountry && initialData?.jobSalaries.length && refreshTick === 0) return;
    setJobLoading(true);
    setJobError(false);
    fetchJobSalaries(selectedCountry || undefined)
      .then(json => setJobSalaries(json.data ?? []))
      .catch(() => setJobError(true))
      .finally(() => setJobLoading(false));
  }, [selectedCountry, refreshTick, initialData?.jobSalaries.length]);

  const filteredDepartmentSalaries = useMemo(
    () => (selectedDepartment ? departmentSalaries.filter(row => row.department === selectedDepartment) : departmentSalaries),
    [departmentSalaries, selectedDepartment]
  );

  return {
    summary,
    totalEmployees: summary?.totalEmployees ?? null,
    countrySalaries,
    departmentSalaries,
    filteredDepartmentSalaries,
    jobSalaries,
    summaryLoading,
    countryLoading,
    departmentLoading,
    jobLoading,
    summaryError,
    countryError,
    departmentError,
    jobError
  };
}
