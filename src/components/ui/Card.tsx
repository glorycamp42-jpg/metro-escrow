import { cn } from "@/lib/cn";
import * as React from "react";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white border border-cream-300 rounded-lg shadow-card",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  trailing,
  className
}: {
  title: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <p className="text-[13px] font-medium text-ink-800">{title}</p>
      {trailing && (
        <span className="text-[11px] text-ink-400">{trailing}</span>
      )}
    </div>
  );
}
