import EmployeeDashboard from "@/components/employees/EmployeeDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employees | Salary Management Tool",
  description: "Manage employee records, payroll actions, and workforce operations."
};

export default function HomePage() {
  return <EmployeeDashboard />;
}
