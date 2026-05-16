import type { Metadata } from "next";
import SwaggerDocsClient from "@/components/docs/SwaggerDocsClient";

export const metadata: Metadata = {
  title: "API reference",
  description: "OpenAPI (Swagger) documentation for Crafts Payroll HTTP APIs."
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-[calc(100dvh-56px)] bg-transparent dark:bg-gray-950">
      <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50 sm:px-6">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">API reference</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Browse all routes and use <strong className="font-medium text-gray-800 dark:text-gray-200">Try it out</strong>{" "}
          to execute requests against this app&apos;s origin. Spec JSON is also served at{" "}
          <code className="rounded bg-gray-200 px-1 py-0.5 text-xs dark:bg-gray-800">/api/openapi</code>.
        </p>
      </div>
      <SwaggerDocsClient />
    </div>
  );
}
