"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, FileText, CalendarDays, Users, MessageSquare, BarChart3,
  Settings, Plus, KanbanSquare, Wallet, FileBarChart, Inbox, ClipboardList,
  ShieldCheck, UserCog, FilePen, Bell, BookOpen
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useRole } from "@/components/role/RoleProvider";
import { ROLES, type Role } from "@/lib/roles";

type Item =
  | { kind: "section"; label: string }
  | { kind: "link"; href: string; label: string; icon: typeof Home };

const NAV_BY_ROLE: Record<Role, Item[]> = {
  officer: [
    { kind: "section", label: "Workspace" },
    { kind: "link", href: "/", label: "Dashboard", icon: Home },
    { kind: "link", href: "/queue", label: "My queue", icon: Inbox },
    { kind: "link", href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
    { kind: "link", href: "/transactions", label: "Transactions", icon: FileText },
    { kind: "link", href: "/calendar", label: "Calendar", icon: CalendarDays },
    { kind: "section", label: "Operations" },
    { kind: "link", href: "/trust", label: "Trust account", icon: Wallet },
    { kind: "link", href: "/documents", label: "Documents", icon: FileText },
    { kind: "link", href: "/templates", label: "Templates", icon: BookOpen },
    { kind: "link", href: "/signatures", label: "Signatures", icon: FilePen },
    { kind: "link", href: "/reminders", label: "Reminders", icon: Bell },
    { kind: "link", href: "/messages", label: "Messages", icon: MessageSquare },
    { kind: "section", label: "Insights" },
    { kind: "link", href: "/clients", label: "Clients", icon: Users },
    { kind: "link", href: "/analytics", label: "Analytics", icon: BarChart3 },
    { kind: "link", href: "/audit", label: "Audit log", icon: ShieldCheck },
    { kind: "section", label: "Account" },
    { kind: "link", href: "/settings", label: "Settings", icon: Settings }
  ],
  senior: [
    { kind: "section", label: "Workspace" },
    { kind: "link", href: "/", label: "Dashboard", icon: Home },
    { kind: "link", href: "/queue", label: "Approval queue", icon: ClipboardList },
    { kind: "link", href: "/pipeline", label: "Team pipeline", icon: KanbanSquare },
    { kind: "link", href: "/transactions", label: "Transactions", icon: FileText },
    { kind: "link", href: "/calendar", label: "Calendar", icon: CalendarDays },
    { kind: "section", label: "Oversight" },
    { kind: "link", href: "/team", label: "Team view", icon: UserCog },
    { kind: "link", href: "/trust", label: "Trust account", icon: Wallet },
    { kind: "link", href: "/signatures", label: "Signatures", icon: FilePen },
    { kind: "link", href: "/audit", label: "Audit log", icon: ShieldCheck },
    { kind: "link", href: "/reports", label: "Reports", icon: FileBarChart },
    { kind: "section", label: "Account" },
    { kind: "link", href: "/settings", label: "Settings", icon: Settings }
  ],
  processor: [
    { kind: "section", label: "Work" },
    { kind: "link", href: "/", label: "Dashboard", icon: Home },
    { kind: "link", href: "/queue", label: "My queue", icon: Inbox },
    { kind: "link", href: "/transactions", label: "Files", icon: FileText },
    { kind: "link", href: "/documents", label: "Documents", icon: FileText },
    { kind: "link", href: "/templates", label: "Templates", icon: BookOpen },
    { kind: "section", label: "Tools" },
    { kind: "link", href: "/calendar", label: "Calendar", icon: CalendarDays },
    { kind: "link", href: "/messages", label: "Messages", icon: MessageSquare },
    { kind: "section", label: "Account" },
    { kind: "link", href: "/settings", label: "Settings", icon: Settings }
  ],
  assistant: [
    { kind: "section", label: "Work" },
    { kind: "link", href: "/", label: "Dashboard", icon: Home },
    { kind: "link", href: "/queue", label: "Today's queue", icon: Inbox },
    { kind: "link", href: "/calendar", label: "Calendar", icon: CalendarDays },
    { kind: "link", href: "/transactions", label: "Files", icon: FileText },
    { kind: "link", href: "/signatures", label: "Signatures", icon: FilePen },
    { kind: "link", href: "/reminders", label: "Reminders", icon: Bell },
    { kind: "section", label: "Tools" },
    { kind: "link", href: "/clients", label: "Clients", icon: Users },
    { kind: "link", href: "/messages", label: "Messages", icon: MessageSquare },
    { kind: "section", label: "Account" },
    { kind: "link", href: "/settings", label: "Settings", icon: Settings }
  ],
  manager: [
    { kind: "section", label: "Overview" },
    { kind: "link", href: "/", label: "Dashboard", icon: Home },
    { kind: "link", href: "/team", label: "Team view", icon: UserCog },
    { kind: "link", href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
    { kind: "section", label: "Insights" },
    { kind: "link", href: "/analytics", label: "Analytics", icon: BarChart3 },
    { kind: "link", href: "/reports", label: "Reports", icon: FileBarChart },
    { kind: "link", href: "/trust", label: "Trust & compliance", icon: ShieldCheck },
    { kind: "link", href: "/audit", label: "Audit log", icon: ShieldCheck },
    { kind: "section", label: "Files" },
    { kind: "link", href: "/transactions", label: "All transactions", icon: FileText },
    { kind: "link", href: "/clients", label: "Clients", icon: Users },
    { kind: "section", label: "Account" },
    { kind: "link", href: "/settings", label: "Settings", icon: Settings }
  ]
};

export function Sidebar() {
  const path = usePathname();
  const { role } = useRole();
  const meta = ROLES[role];
  const NAV = NAV_BY_ROLE[role];

  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-cream-100 border-r border-cream-300 p-4 gap-3 sticky top-0 h-screen">
      <Link href="/" className="flex items-center gap-2 px-1 py-1 mb-1">
        <span
          className="grid place-items-center w-7 h-7 rounded-md text-cream-50 text-[14px] font-medium tracking-tighter2"
          style={{ background: "var(--hermes)" }}
        >
          M
        </span>
        <span className="text-[14px] font-medium tracking-tightish">Metro Escrow</span>
        <span
          className="ml-1 text-[10px] px-1.5 py-[2px] rounded-full font-medium"
          style={{ background: "var(--hermes-soft)", color: "var(--hermes)" }}
        >
          AI
        </span>
      </Link>

      <div
        className="text-[10px] font-medium px-2.5 py-1 rounded-md w-fit"
        style={{ background: meta.bg, color: meta.fg }}
      >
        {meta.label}
      </div>

      <Link href="/transactions/new">
        <Button variant="primary" className="w-full">
          <Plus size={14} />
          New escrow
        </Button>
      </Link>

      <nav className="flex flex-col gap-0.5 mt-1 overflow-y-auto no-scrollbar pr-1">
        {NAV.map((item, i) => {
          if (item.kind === "section") {
            return (
              <p
                key={"s-" + i}
                className="text-[10px] font-medium text-ink-400 uppercase tracking-tightish px-3 mt-3 mb-1"
              >
                {item.label}
              </p>
            );
          }
          const Icon = item.icon;
          const active =
            item.href === "/" ? path === "/" : path?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 h-9 rounded-md text-[14px]",
                active
                  ? "bg-white text-ink-800 shadow-card"
                  : "text-ink-500 hover:text-ink-800 hover:bg-white/60"
              )}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-cream-300 pt-3">
        <div className="flex items-center gap-2.5 px-1">
          <div
            className="grid place-items-center w-8 h-8 rounded-full text-cream-50 text-[11px] font-medium"
            style={{ background: "var(--hermes)" }}
          >
            JY
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium truncate">Jin Yu</p>
            <p className="text-[11px] text-ink-400 truncate">{meta.label}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
