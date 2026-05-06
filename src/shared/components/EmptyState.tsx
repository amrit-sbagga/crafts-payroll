import type { ReactNode } from "react";

export default function EmptyState({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      {icon ?? (
        <svg className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542" />
        </svg>
      )}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {subtitle ? <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p> : null}
    </div>
  );
}
