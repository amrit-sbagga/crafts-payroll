import { useState } from "react";

export default function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  function resetPage() {
    setPage(1);
  }

  return {
    page,
    limit,
    setPage,
    setLimit,
    resetPage,
  };
}
