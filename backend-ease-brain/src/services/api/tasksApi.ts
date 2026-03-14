import { apiClient } from "./baseApi";
import { Task, ApiResponse, PaginatedResponse, PaginationParams } from "../../types/admin";

class TasksApi {
  private endpoint = "/tasks";

  async list(
    params?: Partial<PaginationParams>
  ): Promise<ApiResponse<PaginatedResponse<Task>>> {
    return apiClient.get<PaginatedResponse<Task>>(this.endpoint, {
      params,
    });
  }

  async getById(id: string | number): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`${this.endpoint}/${id}`);
  }

  async create(task: Omit<Task, "id">): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(this.endpoint, task);
  }

  async update(
    id: string | number,
    updates: Partial<Omit<Task, "id">>
  ): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`${this.endpoint}/${id}`, updates);
  }

  async delete(id: string | number): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async search(query: string): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(this.endpoint, {
      params: { search: query },
    });
  }

  async getByDependent(dependentId: string | number): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(this.endpoint, {
      params: { dependent_id: dependentId },
    });
  }

  async getByStatus(
    status: Task["status"]
  ): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(this.endpoint, {
      params: { status },
    });
  }

  async getByPriority(
    priority: Task["priority"]
  ): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(this.endpoint, {
      params: { priority },
    });
  }

  async getStats(): Promise<
    ApiResponse<{
      total: number;
      completed: number;
      pending: number;
      overdue: number;
      highPriority: number;
    }>
  > {
    return apiClient.get(this.endpoint + "/stats", {});
  }
}

export const tasksApi = new TasksApi();

export default tasksApi;
