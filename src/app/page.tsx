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

  const initialEmployeeRows = initialEmployees.data.map((employee) => ({
    ...employee,
    joiningDate:
      employee.joiningDate instanceof Date
        ? employee.joiningDate.toISOString()
        : employee.joiningDate,
    createdAt:
      employee.createdAt instanceof Date
        ? employee.createdAt.toISOString()
        : employee.createdAt,
    updatedAt:
      employee.updatedAt instanceof Date
        ? employee.updatedAt.toISOString()
        : employee.updatedAt
  }));

  return (
    <EmployeeDashboard
      initialData={{
        data: initialEmployeeRows,
        meta: initialEmployees.meta,
        sortBy: "createdAt",
        sortOrder: "desc"
      }}
    />
  );
}
