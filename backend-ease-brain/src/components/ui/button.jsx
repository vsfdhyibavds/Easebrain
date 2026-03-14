import * as React from "react";

// Minimal Button component to avoid lint noise from unused variant helpers.
export function Button({ children, className = "", variant = "primary", ...props }) {
  const base = "inline-flex items-center justify-center px-3 py-1.5 rounded-md font-medium";
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-gray-100"
      : variant === "outline"
      ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
      : "bg-teal-600 text-white hover:bg-teal-700";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
