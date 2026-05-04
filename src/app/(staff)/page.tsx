"use client";

import { useRole } from "@/components/role/RoleProvider";
import { ROLES } from "@/lib/roles";
import { OfficerHome } from "@/components/dashboard/OfficerHome";
import { SeniorHome } from "@/components/dashboard/SeniorHome";
import { ProcessorHome } from "@/components/dashboard/ProcessorHome";
import { AssistantHome } from "@/components/dashboard/AssistantHome";
import { ManagerHome } from "@/components/dashboard/ManagerHome";

export default function DashboardPage() {
  const { role } = useRole();
  const meta = ROLES[role];

  const greeting =
    role === "officer"
      ? "Good morning, Jin"
      : role === "senior"
      ? "Senior dashboard"
      : role === "processor"
      ? "Processor desk"
      : role === "assistant"
      ? "Assistant desk"
      : "Branch overview";

  const sub =
    role === "officer"
      ? "3 closings this week. 2 risk flags need your eyes."
      : role === "senior"
      ? "4 files awaiting your approval. 2 unverified wires."
      : role === "processor"
      ? "12 open tasks across 4 files. 3 title orders pending."
      : role === "assistant"
      ? "6 calls to make. 3 packets to mail."
      : "Pipeline $5.3M. 1 aging file. Q2 on track for $14.8M.";

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-[12px] text-ink-400">Tuesday - May 4</p>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-[30px] font-medium tracking-tighter2 text-ink-800">
            {greeting}
          </h1>
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-full"
            style={{ background: meta.bg, color: meta.fg }}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-[14px] text-ink-500 mt-1">{sub}</p>
      </header>

      {role === "officer" && <OfficerHome />}
      {role === "senior" && <SeniorHome />}
      {role === "processor" && <ProcessorHome />}
      {role === "assistant" && <AssistantHome />}
      {role === "manager" && <ManagerHome />}
    </div>
  );
}
