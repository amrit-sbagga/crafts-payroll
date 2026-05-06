import type { ReactNode } from "react";

export default function DataTable({
  minWidthClass,
  children,
}: {
  minWidthClass?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto px-2">
      <table className={`w-full text-sm ${minWidthClass ?? ""}`}>{children}</table>
    </div>
  );
}
