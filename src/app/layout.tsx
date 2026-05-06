import type { Metadata } from "next";
import Link from "next/link";
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
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <nav className="border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-6">
            <span className="text-sm font-bold text-gray-800 tracking-wide uppercase">
              Salary Management
            </span>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Employees
            </Link>
            <Link
              href="/insights"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Salary Insights
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
