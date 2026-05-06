import type { ReactNode } from "react";

export default function DataTable({
  minWidthClass,
  tableClassName,
  children,
}: {
  minWidthClass?: string;
  tableClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto px-2">
      <table className={`w-full text-sm ${minWidthClass ?? ""} ${tableClassName ?? ""}`}>{children}</table>
    </div>
  );
}
