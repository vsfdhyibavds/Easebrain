import { FC, ChangeEvent, FormEvent } from "react";
import React from "react";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[];
  className?: string;
  error?: string;
}

export interface AdminFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (formData: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  initialValues?: Record<string, any>;
}

const AdminForm: FC<AdminFormProps> = ({
  title,
  fields,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onCancel,
  isLoading = false,
  initialValues = {},
}) => {
  const [formData, setFormData] = React.useState<Record<string, any>>(
    initialValues
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Invalid email address";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="space-y-4 rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full rounded border px-3 py-2 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100 ${
                  errors[field.name]
                    ? "border-red-500"
                    : "border-gray-300"
                } ${field.className || ""}`}
                rows={4}
              />
            ) : field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full rounded border px-3 py-2 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100 ${
                  errors[field.name]
                    ? "border-red-500"
                    : "border-gray-300"
                } ${field.className || ""}`}
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full rounded border px-3 py-2 text-sm focus:border-teal-500 focus:outline-none disabled:bg-gray-100 ${
                  errors[field.name]
                    ? "border-red-500"
                    : "border-gray-300"
                } ${field.className || ""}`}
              />
            )}

            {errors[field.name] && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;
