import type { ReactNode } from "react";

export default function TableToolbar({
  children,
  stickyTopClass = "",
}: {
  children: ReactNode;
  stickyTopClass?: string;
}) {
  return (
    <section
      className={`z-10 rounded-2xl border border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 ${stickyTopClass}`}
    >
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </section>
  );
}
