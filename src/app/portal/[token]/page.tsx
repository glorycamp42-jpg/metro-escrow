import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { escrows, fmtMoney } from "@/lib/data/mock";
import { PortalNotifications } from "@/components/portal/PortalNotifications";
import { PortalActions } from "@/components/portal/PortalActions";

const STEP_LABELS = [
  "Escrow opened",
  "Inspection",
  "Appraisal",
  "Loan approval",
  "Title cleared",
  "Final walkthrough",
  "Signing",
  "Closed"
];

export default async function ClientPortalPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const e = escrows.find((x) => x.portalToken === token);
  if (!e) {
    return (
      <div className="max-w-[480px] mx-auto py-16 text-center px-6">
        <p className="text-[15px] font-medium text-ink-800">Invalid link</p>
        <p className="text-[13px] text-ink-500 mt-1">
          Ask your escrow officer to resend you a fresh portal link.
        </p>
      </div>
    );
  }
  const buyer = e.parties.find((p) => p.role === "buyer");
  const pct = Math.round((e.step / 8) * 100);

  return (
    <div className="max-w-[560px] mx-auto pb-12 px-5">
      <header
        className="rounded-b-2xl px-6 pt-9 pb-6 text-cream-50"
        style={{ background: "var(--ink)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="grid place-items-center w-7 h-7 rounded-md text-cream-50 text-[13px] font-medium"
            style={{ background: "var(--hermes)" }}
          >
            M
          </span>
          <span className="text-[12px] tracking-tightish">Metro Escrow</span>
        </div>
        <p className="text-[12px]" style={{ color: "var(--hermes-soft)" }}>
          Hi {buyer?.name?.split(" ")[0] ?? "there"} — here's your escrow
        </p>
        <h1 className="text-[22px] font-medium mt-1 tracking-tighter2">
          {e.property.address}
        </h1>
        <p className="text-[12px] mt-1 inline-flex items-center gap-1" style={{ color: "var(--hermes-soft)" }}>
          <MapPin size={12} />
          {e.property.city}, {e.property.state} {e.property.zip}
        </p>
        <div className="grid grid-cols-3 gap-2 mt-5">
          <Stat label="Price" value={fmtMoney(e.price)} />
          <Stat
            label="Closing"
            value={new Date(e.closingDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })}
          />
          <Stat label="Progress" value={`${pct}%`} accent />
        </div>
      </header>

      <PortalNotifications escrowId={e.id} />

      <section className="mt-6">
        <p className="text-[13px] font-medium mb-3 text-ink-700">
          Where you are now
        </p>
        <ol className="rounded-lg border border-cream-300 bg-white overflow-hidden">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const done = stepNum < e.step;
            const current = stepNum === e.step;
            return (
              <li
                key={label}
                className={
                  "flex items-center gap-3 px-4 py-3 border-b border-cream-200 last:border-0 " +
                  (current ? "bg-hermes-50" : "")
                }
              >
                {done ? (
                  <CheckCircle2 size={16} className="text-hermes-500 shrink-0" />
                ) : current ? (
                  <span
                    className="w-4 h-4 rounded-full grid place-items-center shrink-0"
                    style={{ background: "var(--hermes)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cream-50" />
                  </span>
                ) : (
                  <Clock size={16} className="text-ink-400 shrink-0" />
                )}
                <span
                  className={
                    "text-[13px] " +
                    (done ? "text-ink-500 line-through" : current ? "font-medium text-ink-800" : "text-ink-500")
                  }
                >
                  {label}
                </span>
                {current && (
                  <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "var(--hermes)", color: "var(--cream)" }}>
                    Now
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <PortalActions
        escrowId={e.id}
        buyerName={buyer?.name ?? "Client"}
      />

      <p className="text-[10px] text-ink-400 mt-10 text-center">
        Secured link · {token.slice(0, 8)}… · expires when escrow closes
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2.5"
      style={{
        background: accent ? "var(--hermes)" : "rgba(250,246,238,0.08)",
        color: "var(--cream)"
      }}
    >
      <p className="text-[10px]" style={{ color: accent ? "var(--hermes-soft)" : "rgba(250,246,238,0.6)" }}>{label}</p>
      <p className="text-[15px] font-medium tracking-tightish mt-0.5">{value}</p>
    </div>
  );
}

