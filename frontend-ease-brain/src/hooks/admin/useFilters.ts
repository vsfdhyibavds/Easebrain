import { useState, useCallback } from 'react';

export interface FilterConfig {
  status?: string;
  category?: string;
  dateRange?: { start: Date; end: Date };
  search?: string;
}

export interface UseFiltersOptions {
  initialFilters?: FilterConfig;
}

export interface UseFiltersReturn {
  filters: FilterConfig;
  setFilters: (filters: FilterConfig) => void;
  updateFilter: (key: keyof FilterConfig, value: any) => void;
  clearFilters: () => void;
}

export function useFilters(options?: UseFiltersOptions): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterConfig>(options?.initialFilters ?? {});

  const updateFilter = useCallback((key: keyof FilterConfig, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return { filters, setFilters, updateFilter, clearFilters };
}
