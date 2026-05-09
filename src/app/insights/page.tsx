import InsightsDashboard from "@/components/analytics/InsightsDashboard";
import {
  getCountrySalaryStats,
  getDepartmentSalaryStats,
  getGlobalSalarySummary,
  getJobTitleSalaryStats
} from "@/modules/employee/employeeAnalytics.service";

export const metadata = {
  title: "Salary Insights | Salary Management Tool"
};

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const [summary, countrySalaries, departmentSalaries, jobSalaries] = await Promise.all([
    getGlobalSalarySummary(),
    getCountrySalaryStats(),
    getDepartmentSalaryStats(),
    getJobTitleSalaryStats()
  ]);

  return (
    <InsightsDashboard
      initialData={{
        summary,
        countrySalaries,
        departmentSalaries,
        jobSalaries
      }}
    />
  );
}
