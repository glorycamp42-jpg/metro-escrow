import { cn } from "@/lib/cn";

export function Badge({
  children,
  bg,
  fg,
  className
}: {
  children: React.ReactNode;
  bg?: string;
  fg?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] px-2 py-[2px] rounded-full font-medium",
        className
      )}
      style={{
        backgroundColor: bg ?? "var(--hermes-soft)",
        color: fg ?? "var(--hermes)"
      }}
    >
      {children}
    </span>
  );
}
