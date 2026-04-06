import { useState, useCallback } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function usePagination(options?: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(options?.initialPage ?? 1);
  const [pageSize, setPageSize] = useState(options?.pageSize ?? 10);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  return {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
  };
}
