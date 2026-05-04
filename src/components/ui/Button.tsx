"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "ink";
type Size = "sm" | "md";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button(
  { className, variant = "secondary", size = "md", ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-[12px]",
    md: "h-10 px-4 text-[13px]"
  };
  const variants: Record<Variant, string> = {
    primary:
      "bg-hermes-500 text-cream-50 hover:bg-hermes-600 shadow-card",
    secondary:
      "bg-white text-ink-800 border border-cream-300 hover:bg-cream-100",
    ghost: "bg-transparent text-ink-800 hover:bg-cream-100",
    ink: "bg-ink-800 text-cream-50 hover:bg-ink-700"
  };
  return (
    <button
      ref={ref}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
});
