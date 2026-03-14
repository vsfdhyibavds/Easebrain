import { useState, useCallback, useMemo } from "react";

export interface FilterConfig {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt" | "between";
  value: any;
}

interface UseFiltersOptions<T> {
  data: T[];
  // debounceMs?: number;  // TODO: implement debouncing if needed
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
}: UseFiltersOptions<T>): UseFiltersReturn<T> => {
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

    // Apply search query across all string fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
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
  }, [data, searchQuery, filters]);

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
