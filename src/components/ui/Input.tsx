"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border bg-white px-3 text-[13px] text-ink-800 placeholder:text-ink-400",
        "transition-shadow focus:outline-none focus:ring-2 focus:ring-hermes-500/30",
        invalid ? "border-red-400" : "border-cream-300",
        className
      )}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-cream-300 bg-white px-3 text-[13px] text-ink-800",
        "transition-shadow focus:outline-none focus:ring-2 focus:ring-hermes-500/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export function Field({
  label,
  hint,
  error,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-ink-600">{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-ink-400">{hint}</span>
      ) : null}
    </label>
  );
}
