import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmployeeById } from "@/modules/employee/employee.service";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/formatters";

type PageProps = {
  params: Promise<{ id: string }>;
};

function daysSince(dateValue: string) {
  const then = new Date(dateValue).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default async function EmployeeProfilePage({ params }: PageProps) {
  const { id } = await params;
  const employee = await getEmployeeById(id);

  if (!employee) notFound();

  const departmentAggregate = await prisma.employee.aggregate({
    where: { department: employee.department },
    _avg: { salary: true },
  });
  const departmentAvgSalary = departmentAggregate._avg.salary ? Number(departmentAggregate._avg.salary) : null;
  const departmentDelta = departmentAvgSalary !== null ? employee.salary - departmentAvgSalary : null;
  const salaryUpdatedDays = daysSince(employee.updatedAt);

  return (
    <main className="mx-auto min-h-[calc(100dvh-56px)] w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ← Back to employees
            </Link>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-br from-blue-100 to-indigo-100 dark:border-gray-700 dark:from-blue-950/30 dark:to-indigo-950/30">
              <img
                src={
                  employee.avatarUrl ??
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(employee.fullName)}`
                }
                alt={`${employee.fullName} avatar`}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{employee.fullName}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{employee.jobTitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {employee.gender}
                </span>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  {employee.department}
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {employee.country}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Details</h2>
            <div className="mt-4 space-y-3">
              <DetailRow label="Salary" value={formatCurrency(employee.salary)} />
              <DetailRow label="Joined Date" value={formatDate(employee.joiningDate)} />
              <DetailRow label="Created Date" value={formatDate(employee.createdAt)} />
              <DetailRow label="Last Updated" value={formatDate(employee.updatedAt)} />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Insights</h2>
            <div className="mt-4 space-y-3">
              <DetailRow
                label="Salary last updated"
                value={`${salaryUpdatedDays} day${salaryUpdatedDays === 1 ? "" : "s"} ago`}
              />
              <DetailRow
                label="Department average"
                value={departmentAvgSalary !== null ? formatCurrency(departmentAvgSalary) : "N/A"}
              />
              <DetailRow
                label="Comparison vs department avg"
                value={
                  departmentDelta === null
                    ? "N/A"
                    : `${departmentDelta >= 0 ? "+" : "-"}${formatCurrency(Math.abs(departmentDelta))}`
                }
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/70">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}
