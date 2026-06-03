import { useState, useCallback, useMemo, useRef, useEffect } from "react";

export interface FilterConfig {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "between";
  value: any;
}

interface UseFiltersOptions<T> {
  data: T[];
  debounceMs?: number;  // Debounce delay in milliseconds (default: 300ms)
}

interface UseFiltersReturn<T> {
  filteredData: T[];
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  filters: FilterConfig[];
  setSearchQuery: (query: string) => void;
  searchQuery: string;
}

export const useFilters = <T extends Record<string, any>>({
  data,
  debounceMs = 300,
}: UseFiltersOptions<T>): UseFiltersReturn<T> => {
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query updates
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debounceMs]);

  const addFilter = useCallback((filter: FilterConfig) => {
    setFilters((prev) => {
      const existing = prev.findIndex((f) => f.field === filter.field);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = filter;
        return updated;
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters((prev) => prev.filter((f) => f.field !== field));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchQuery("");
  }, []);

  const applyFilter = (item: T, filter: FilterConfig): boolean => {
    const value = item[filter.field];

    switch (filter.operator) {
      case "equals":
        return value === filter.value;
      case "contains":
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      case "gt":
        return Number(value) > Number(filter.value);
      case "lt":
        return Number(value) < Number(filter.value);
      case "between":
        return (
          Number(value) >= Number(filter.value[0]) &&
          Number(value) <= Number(filter.value[1])
        );
      default:
        return true;
    }
  };

  const filteredData = useMemo(() => {
    let result = data;

    // Apply debounced search query across all string fields
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(query)
        )
      );
    }

    // Apply filters
    result = result.filter((item) =>
      filters.every((filter) => applyFilter(item, filter))
    );

    return result;
  }, [data, debouncedSearchQuery, filters]);

  return {
    filteredData,
    addFilter,
    removeFilter,
    clearFilters,
    filters,
    setSearchQuery,
    searchQuery,
  };
};

export default useFilters;
