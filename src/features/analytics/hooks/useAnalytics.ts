"use client";

import { useEffect, useMemo, useState } from "react";
import type { CountrySalaryStats, DepartmentSalaryStats, GlobalSalarySummary, JobTitleSalaryStats } from "@/modules/employee/employeeAnalytics.service";
import { fetchAnalyticsSummary, fetchCountrySalaries, fetchDepartmentSalaries, fetchJobSalaries } from "@/features/analytics/services/analyticsApi";

export default function useAnalytics(selectedCountry: string, selectedDepartment: string, refreshTick: number) {
  const [summary, setSummary] = useState<GlobalSalarySummary | null>(null);
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [countrySalaries, setCountrySalaries] = useState<CountrySalaryStats[]>([]);
  const [departmentSalaries, setDepartmentSalaries] = useState<DepartmentSalaryStats[]>([]);
  const [jobSalaries, setJobSalaries] = useState<JobTitleSalaryStats[]>([]);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [countryLoading, setCountryLoading] = useState(true);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);

  const [summaryError, setSummaryError] = useState(false);
  const [countryError, setCountryError] = useState(false);
  const [departmentError, setDepartmentError] = useState(false);
  const [jobError, setJobError] = useState(false);

  useEffect(() => {
    setSummaryLoading(true);
    setSummaryError(false);
    Promise.all([fetchAnalyticsSummary(), fetch("/api/employees?limit=1").then(r => r.json())])
      .then(([summaryJson, employeesJson]) => {
        setSummary(summaryJson.data);
        setTotalEmployees(employeesJson.meta?.total ?? null);
      })
      .catch(() => setSummaryError(true))
      .finally(() => setSummaryLoading(false));
  }, [refreshTick]);

  useEffect(() => {
    setCountryLoading(true);
    setCountryError(false);
    fetchCountrySalaries()
      .then(json => setCountrySalaries(json.data ?? []))
      .catch(() => setCountryError(true))
      .finally(() => setCountryLoading(false));
  }, [refreshTick]);

  useEffect(() => {
    setDepartmentLoading(true);
    setDepartmentError(false);
    fetchDepartmentSalaries()
      .then(json => setDepartmentSalaries(json.data ?? []))
      .catch(() => setDepartmentError(true))
      .finally(() => setDepartmentLoading(false));
  }, [refreshTick]);

  useEffect(() => {
    setJobLoading(true);
    setJobError(false);
    fetchJobSalaries(selectedCountry || undefined)
      .then(json => setJobSalaries(json.data ?? []))
      .catch(() => setJobError(true))
      .finally(() => setJobLoading(false));
  }, [selectedCountry, refreshTick]);

  const filteredDepartmentSalaries = useMemo(
    () => (selectedDepartment ? departmentSalaries.filter(row => row.department === selectedDepartment) : departmentSalaries),
    [departmentSalaries, selectedDepartment]
  );

  return {
    summary,
    totalEmployees,
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
