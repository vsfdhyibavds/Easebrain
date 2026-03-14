import { apiClient } from "./baseApi";
import { Dependent, ApiResponse, PaginatedResponse, PaginationParams } from "../../types/admin";

class DependentsApi {
  private endpoint = "/dependents";

  async list(
    params?: Partial<PaginationParams>
  ): Promise<ApiResponse<PaginatedResponse<Dependent>>> {
    return apiClient.get<PaginatedResponse<Dependent>>(this.endpoint, {
      params,
    });
  }

  async getById(id: string | number): Promise<ApiResponse<Dependent>> {
    return apiClient.get<Dependent>(`${this.endpoint}/${id}`);
  }

  async create(dependent: Omit<Dependent, "id" | "lastUpdate">): Promise<ApiResponse<Dependent>> {
    return apiClient.post<Dependent>(this.endpoint, {
      ...dependent,
      lastUpdate: new Date().toISOString(),
    });
  }

  async update(
    id: string | number,
    updates: Partial<Omit<Dependent, "id">>
  ): Promise<ApiResponse<Dependent>> {
    return apiClient.put<Dependent>(`${this.endpoint}/${id}`, {
      ...updates,
      lastUpdate: new Date().toISOString(),
    });
  }

  async delete(id: string | number): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(`${this.endpoint}/${id}`);
  }

  async search(query: string): Promise<ApiResponse<Dependent[]>> {
    return apiClient.get<Dependent[]>(this.endpoint, {
      params: { search: query },
    });
  }

  async getStats(): Promise<
    ApiResponse<{
      total: number;
      active: number;
      inactive: number;
      archived: number;
    }>
  > {
    return apiClient.get(this.endpoint + "/stats", {});
  }
}

export const dependentsApi = new DependentsApi();

export default dependentsApi;
