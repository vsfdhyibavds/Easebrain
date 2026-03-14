import React from "react";

export function Avatar({ children, className = "" }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-full w-10 h-10 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = "avatar", className = "" }) {
  return <img src={src} alt={alt} className={`rounded-full w-full h-full object-cover ${className}`} />;
}

export function AvatarFallback({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-center rounded-full bg-teal-500 text-white w-10 h-10 font-bold ${className}`}>
      {children}
    </div>
  );
}