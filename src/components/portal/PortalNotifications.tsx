"use client";

import * as React from "react";
import {
  Bell, CheckCircle2, AlertCircle, MessageCircle, FileText, Check
} from "lucide-react";
import {
  getPortalNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type PortalNotification
} from "@/lib/data/userEscrows";

const ICON_BY_TYPE: Record<PortalNotification["type"], React.ReactNode> = {
  milestone: <CheckCircle2 size={14} />,
  action_required: <AlertCircle size={14} />,
  message: <MessageCircle size={14} />,
  document: <FileText size={14} />
};

const TINT_BY_TYPE: Record<PortalNotification["type"], { bg: string; fg: string }> = {
  milestone: { bg: "#E1F5EE", fg: "#0F6E56" },
  action_required: { bg: "#FAEEDA", fg: "#854F0B" },
  message: { bg: "#FFE8D6", fg: "#A8470F" },
  document: { bg: "#E5DCC9", fg: "#3B2A1A" }
};

const LABEL_BY_TYPE: Record<PortalNotification["type"], string> = {
  milestone: "Milestone",
  action_required: "Action needed",
  message: "Message",
  document: "Document"
};

export function PortalNotifications({ escrowId }: { escrowId: string }) {
  const [notifs, setNotifs] = React.useState<PortalNotification[]>([]);
  const [expanded, setExpanded] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setNotifs(getPortalNotifications(escrowId));
    setMounted(true);
  }, [escrowId]);

  // Refresh every 30 sec to pick up new notifications written by officer
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => {
      setNotifs(getPortalNotifications(escrowId));
    }, 30000);
    return () => window.clearInterval(id);
  }, [escrowId, mounted]);

  // Refresh when tab becomes visible
  React.useEffect(() => {
    function onVis() {
      if (!document.hidden) setNotifs(getPortalNotifications(escrowId));
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [escrowId]);

  function handleMarkAll() {
    markAllNotificationsRead(escrowId);
    setNotifs(getPortalNotifications(escrowId));
  }

  function handleClickItem(n: PortalNotification) {
    if (!n.read) {
      markNotificationRead(escrowId, n.id);
      setNotifs(getPortalNotifications(escrowId));
    }
  }

  if (!mounted || notifs.length === 0) return null;

  const unread = notifs.filter((n) => !n.read).length;
  const visible = expanded ? notifs : notifs.slice(0, 3);

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-medium text-ink-700 flex items-center gap-1.5">
          <Bell size={14} />
          Notifications
          {unread > 0 && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-cream-50"
              style={{ background: "var(--hermes)" }}
            >
              {unread}
            </span>
          )}
        </p>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-[11px] text-hermes-500 hover:underline inline-flex items-center gap-1"
          >
            <Check size={11} /> Mark all read
          </button>
        )}
      </div>

      <ul className="rounded-lg border border-cream-300 bg-white overflow-hidden">
        {visible.map((n) => {
          const tint = TINT_BY_TYPE[n.type];
          return (
            <li
              key={n.id}
              onClick={() => handleClickItem(n)}
              className={
                "flex items-start gap-3 px-4 py-3 border-b border-cream-200 last:border-0 cursor-pointer hover:bg-cream-50 " +
                (n.read ? "opacity-70" : "")
              }
            >
              <div
                className="grid place-items-center w-7 h-7 rounded-md shrink-0 mt-0.5"
                style={{ background: tint.bg, color: tint.fg }}
              >
                {ICON_BY_TYPE[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-medium text-ink-800">{n.title}</p>
                  {!n.read && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "var(--hermes)" }}
                    />
                  )}
                </div>
                <p className="text-[12px] text-ink-700 mt-0.5">{n.body}</p>
                <p className="text-[10px] text-ink-400 mt-1.5 uppercase tracking-tightish">
                  {LABEL_BY_TYPE[n.type]} · {n.from} ·{" "}
                  {new Date(n.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {notifs.length > 3 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[11px] text-ink-500 hover:text-ink-800 mt-2"
        >
          {expanded ? "Show less" : `Show all ${notifs.length}`}
        </button>
      )}
    </section>
  );
}
