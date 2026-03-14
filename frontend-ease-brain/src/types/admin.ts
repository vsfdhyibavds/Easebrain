/**
 * Admin Dashboard Types
 * Shared interfaces and types for admin-related features
 */

export interface Dependent {
  id: number;
  name: string;
  age: number;
  caregiver: string;
  status: "Active" | "Inactive" | "Archived";
  lastUpdate: string;
}

export interface Task {
  id: number;
  title: string;
  dependent: string;
  assignedTo: string;
  status: "Completed" | "Pending" | "Overdue";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  permissions: string[];
}

export interface AdminStats {
  totalDependents: number;
  activeTasks: number;
  completedTasks: number;
  totalCaregivers: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
