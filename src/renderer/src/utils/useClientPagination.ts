import { useEffect, useMemo, useState } from 'react';

export function useClientPagination<T>(
  data: T[],
  itemsPerPage: number,
  resetDeps: unknown[] = []
) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((data?.length ?? 0) / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.length, itemsPerPage, ...resetDeps]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(
    () =>
      data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) ?? [],
    [data, currentPage, itemsPerPage]
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage,
    handlePageChange,
  };
}
