import { useState, useCallback, useEffect } from "react";
import { Dependent, Task } from "../types/admin";
import dependentsApi from "../services/api/dependentsApi";
import tasksApi from "../services/api/tasksApi";

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
  const [totalPages, setTotalPages] = useState(0);

  // Fetch dependents from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dependentsApi.list({ page, limit: pageSize });
      if (response.data) {
        setData(response.data.items);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || "Failed to fetch dependents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dependents");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Fetch dependents whenever page changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    totalPages,
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
  const [totalPages, setTotalPages] = useState(0);

  // Fetch tasks from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tasksApi.list({ page, limit: pageSize });
      if (response.data) {
        setData(response.data.items);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || "Failed to fetch tasks");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Fetch tasks whenever page changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    totalPages,
    setPage,
    refresh: fetchData,
    addItem,
    updateItem,
    deleteItem,
  };
};
