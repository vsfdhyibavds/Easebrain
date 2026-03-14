import * as React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        {children}
      </div>
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        onClick={() => onOpenChange(false)}
        aria-label="Close dialog"
      >
        ×
      </button>
    </div>
  );
}

export function DialogContent({ children, className }) {
  return <div className={className}>{children}</div>;
}
export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}
export function DialogTitle({ children }) {
  return <h2 className="text-xl font-semibold mb-2">{children}</h2>;
}
export function DialogDescription({ children }) {
  return <p className="text-gray-600 mb-4">{children}</p>;
}
export function DialogFooter({ children }) {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
}
export function DialogTrigger({ children }) {
  return children;
}
