import type { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-gray-200/80 bg-white/75 backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{title}</h1>
            {description ? (
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
