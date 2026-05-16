"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeMenu from "@/shared/components/theme/ThemeMenu";

export default function AppNav() {
  const pathname = usePathname();
  const isEmployees = pathname === "/";
  const isInsights = pathname.startsWith("/insights");
  const isDocs = pathname === "/docs";

  const linkBase =
    "rounded-md px-2 py-1 text-sm transition-colors";
  const activeClass =
    "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60";
  const inactiveClass =
    "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300";

  return (
    <nav className="relative z-80 border-b border-gray-200/80 bg-white/70 py-3 shadow-sm backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex w-full max-w-[1500px] items-center gap-6 px-4 sm:px-6">
        <span className="text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100">Payroll Management</span>

        <Link href="/" className={`${linkBase} ${isEmployees ? activeClass : inactiveClass}`} aria-current={isEmployees ? "page" : undefined}>
          Employees
        </Link>
        <Link
          href="/insights"
          className={`${linkBase} ${isInsights ? activeClass : inactiveClass}`}
          aria-current={isInsights ? "page" : undefined}
        >
          Salary Insights
        </Link>
        <Link
          href="/docs"
          className={`${linkBase} ${isDocs ? activeClass : inactiveClass}`}
          aria-current={isDocs ? "page" : undefined}
        >
          API docs
        </Link>

        <div className="ml-auto">
          <ThemeMenu />
        </div>
      </div>
    </nav>
  );
}
