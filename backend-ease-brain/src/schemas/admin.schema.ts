import { z } from "zod";

export const dependentSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  age: z.number().min(0, "Age must be positive").max(150, "Invalid age"),
  caregiver: z.string().min(1, "Caregiver name is required"),
  status: z.enum(["Active", "Inactive", "Archived"]).default("Active"),
  lastUpdate: z.string().datetime().optional(),
});

export const taskSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  dependent: z.string().min(1, "Dependent is required"),
  assignedTo: z.string().min(1, "Assignee is required"),
  status: z.enum(["Completed", "Pending", "Overdue"]).default("Pending"),
  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
  dueDate: z.string().datetime("Invalid date format"),
  description: z.string().optional().default(""),
});

export const adminUserSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "super_admin"]).default("admin"),
  permissions: z.array(z.string()).default([]),
});

export const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// Form submission schemas
export const createDependentFormSchema = dependentSchema.omit({ id: true });
export const updateDependentFormSchema = dependentSchema.partial();

export const createTaskFormSchema = taskSchema.omit({ id: true });
export const updateTaskFormSchema = taskSchema.partial();

export const createAdminUserFormSchema = adminUserSchema.omit({ id: true });
export const updateAdminUserFormSchema = adminUserSchema.partial();

// Type exports for use in components
export type Dependent = z.infer<typeof dependentSchema>;
export type Task = z.infer<typeof taskSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type CreateDependentForm = z.infer<typeof createDependentFormSchema>;
export type UpdateDependentForm = z.infer<typeof updateDependentFormSchema>;
export type CreateTaskForm = z.infer<typeof createTaskFormSchema>;
export type UpdateTaskForm = z.infer<typeof updateTaskFormSchema>;

export default {
  dependentSchema,
  taskSchema,
  adminUserSchema,
  paginationParamsSchema,
  createDependentFormSchema,
  updateDependentFormSchema,
  createTaskFormSchema,
  updateTaskFormSchema,
  createAdminUserFormSchema,
  updateAdminUserFormSchema,
};
