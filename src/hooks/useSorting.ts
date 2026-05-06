import { useState } from "react";

type SortOrder = "asc" | "desc";

export default function useSorting<T extends string>(
  defaultField: T,
  defaultOrder: SortOrder,
  nextOrderForNewField: (field: T) => SortOrder = () => "asc"
) {
  const [sortBy, setSortBy] = useState<T>(defaultField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);

  function handleSort(field: T) {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortOrder(nextOrderForNewField(field));
  }

  return {
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    handleSort,
  };
}
