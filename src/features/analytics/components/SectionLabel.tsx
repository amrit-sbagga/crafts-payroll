"use client";

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{children}</span>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
