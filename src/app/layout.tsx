import type { Metadata } from "next";
import AppNav from "@/shared/components/AppNav";
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
      <body className="app-shell min-h-dvh text-gray-900 antialiased transition-colors duration-300 dark:text-gray-100">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
