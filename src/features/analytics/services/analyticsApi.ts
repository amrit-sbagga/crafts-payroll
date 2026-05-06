export async function fetchAnalyticsSummary() {
  return fetch("/api/analytics/summary").then(r => r.json());
}

export async function fetchCountrySalaries() {
  return fetch("/api/analytics/country-salaries").then(r => r.json());
}

export async function fetchDepartmentSalaries() {
  return fetch("/api/analytics/department-salaries").then(r => r.json());
}

export async function fetchJobSalaries(country?: string) {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  return fetch(`/api/analytics/job-salaries?${params}`).then(r => r.json());
}
