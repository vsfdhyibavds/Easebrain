import { useState, useCallback } from "react";
import { Dependent, Task } from "../types/admin";

interface UseAdminDataOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UseAdminDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  addItem: (item: T) => void;
  updateItem: (id: string | number, updates: Partial<T>) => void;
  deleteItem: (id: string | number) => void;
}

export const useAdminDependents = (
  options: UseAdminDataOptions = {}
): UseAdminDataReturn<Dependent> => {
  const { initialPage = 1, pageSize = 10 } = options;
  const [data, setData] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  // Mock fetch - replace with actual API call
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await dependentsApi.list({ page, pageSize });
      // setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dependents");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const addItem = useCallback((item: Dependent) => {
    setData((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback((id: string | number, updates: Partial<Dependent>) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string | number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    data,
    loading,
    error,
    page,
    totalPages: Math.ceil(data.length / pageSize),
    setPage,
    refresh: fetchData,
    addItem,
    updateItem,
    deleteItem,
  };
};

export const useAdminTasks = (
  options: UseAdminDataOptions = {}
): UseAdminDataReturn<Task> => {
  const { initialPage = 1, pageSize = 10 } = options;
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);

  // Mock fetch - replace with actual API call
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      // const response = await tasksApi.list({ page, pageSize });
      // setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const addItem = useCallback((item: Task) => {
    setData((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback((id: string | number, updates: Partial<Task>) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string | number) => {
    setData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    data,
    loading,
    error,
    page,
    totalPages: Math.ceil(data.length / pageSize),
    setPage,
    refresh: fetchData,
    addItem,
    updateItem,
    deleteItem,
  };
};
