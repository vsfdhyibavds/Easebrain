import { apiClient } from "./baseApi";

export interface AdminSettingsData {
  dashboardRefreshRate: number;
  notificationsEnabled: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  autoLogoutMinutes: number;
  twoFactorEnabled: boolean;
  timeFormat: "12h" | "24h";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

class AdminSettingsApi {
  private endpoint = "/admin/settings";

  async getSettings(): Promise<ApiResponse<AdminSettingsData>> {
    return apiClient.get<AdminSettingsData>(this.endpoint);
  }

  async saveSettings(settings: AdminSettingsData): Promise<ApiResponse<AdminSettingsData>> {
    return apiClient.post<AdminSettingsData>(this.endpoint, settings);
  }

  async updateSettings(
    updates: Partial<AdminSettingsData>
  ): Promise<ApiResponse<AdminSettingsData>> {
    return apiClient.put<AdminSettingsData>(this.endpoint, updates);
  }
}

export const adminSettingsApi = new AdminSettingsApi();

export default adminSettingsApi;
