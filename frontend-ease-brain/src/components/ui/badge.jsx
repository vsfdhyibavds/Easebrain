import React from "react";

export function Badge({ children, className = "", variant = "secondary" }) {
  const base = "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded";
  const styles =
    variant === "destructive"
      ? "bg-red-100 text-red-800"
      : "bg-teal-100 text-teal-800";
  return <span className={`${base} ${styles} ${className}`}>{children}</span>;
}