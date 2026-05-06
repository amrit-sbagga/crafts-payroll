"use client";

const SKELETON_WIDTHS = ["w-28", "w-20", "w-16", "w-12", "w-24"];

export function RowSkeleton({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-4">
              <div
                className={`h-3.5 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800 ${SKELETON_WIDTHS[(i + j) % SKELETON_WIDTHS.length]}`}
                style={{ animationDelay: `${(i + j) * 60}ms` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function EmptyTableState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={99} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
          </svg>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </td>
    </tr>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-1.5 0v4.5Zm.75-7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}
