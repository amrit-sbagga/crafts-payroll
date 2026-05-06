import type { Metadata } from "next";
import Link from "next/link";
import ThemeMenu from "@/shared/components/theme/ThemeMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salary Management Tool",
  description: "HR payroll management portal"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 antialiased transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
        <nav className="border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur transition-colors duration-300 sm:px-6 dark:border-gray-800 dark:bg-gray-950/90">
          <div className="mx-auto flex w-full max-w-[1500px] items-center gap-6">
            <span className="text-sm font-bold tracking-wide uppercase text-gray-800 dark:text-gray-100">
              Salary Management
            </span>
            <Link
              href="/"
              className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300"
            >
              Employees
            </Link>
            <Link
              href="/insights"
              className="text-sm text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300"
            >
              Salary Insights
            </Link>
            <div className="ml-auto">
              <ThemeMenu />
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
