import { ApiResponse } from "../../types/admin";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private getHeaders(options?: ApiRequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  async get<T>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(
        this.buildUrl(endpoint, options?.params),
        {
          method: "GET",
          headers: this.getHeaders(options),
        }
      );
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(options),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(options),
        body: data ? JSON.stringify(data) : undefined,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(options),
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        message: error.message || `HTTP ${response.status}`,
        data: null as any,
        statusCode: response.status,
      };
    }

    const json = await response.json();
    return {
      success: true,
      message: json.message || "Success",
      data: json.data,
      statusCode: response.status,
    };
  }

  private handleError<T>(error: any): ApiResponse<T> {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
      data: null as any,
      statusCode: 0,
    };
  }
}

export const apiClient = new ApiClient();

export default apiClient;
