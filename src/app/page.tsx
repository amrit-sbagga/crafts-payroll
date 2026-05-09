import EmployeeDashboard from "@/components/employees/EmployeeDashboard";
import { listEmployees } from "@/modules/employee/employee.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employees | Salary Management Tool",
  description: "Manage employee records, payroll actions, and workforce operations."
};

export default async function HomePage() {
  const initialEmployees = await listEmployees({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  return (
    <EmployeeDashboard
      initialData={{
        data: initialEmployees.data,
        meta: initialEmployees.meta,
        sortBy: "createdAt",
        sortOrder: "desc"
      }}
    />
  );
}
