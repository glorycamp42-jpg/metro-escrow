"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Printer, FileDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { escrows, fmtMoney } from "@/lib/data/mock";
import { renderBody, type MergeFields } from "@/lib/templates";
import { logAudit } from "@/lib/data/audit";
import { useToast } from "@/components/ui/Toast";

export function TemplateBuilder({
  slug,
  name,
  category
}: {
  slug: string;
  name: string;
  category: string;
}) {
  const toast = useToast();
  const [escrowId, setEscrowId] = React.useState(escrows[0]?.id ?? "");
  const e = escrows.find((x) => x.id === escrowId);

  const merge: MergeFields = React.useMemo(() => {
    const buyer = e?.parties.find((p) => p.role === "buyer")?.name ?? "";
    const seller = e?.parties.find((p) => p.role === "seller")?.name ?? "";
    const lender = e?.parties.find((p) => p.role === "lender")?.company ?? "";
    const title = e?.parties.find((p) => p.role === "title")?.company ?? "";
    return {
      fileNumber: e?.id ?? "",
      propertyAddress: e?.property.address ?? "",
      city: e?.property.city ?? "",
      state: e?.property.state ?? "",
      zip: e?.property.zip ?? "",
      apn: e?.property.apn ?? "",
      closingDate: e?.closingDate ?? "",
      price: e ? fmtMoney(e.price).replace("$", "") : "",
      buyer,
      seller,
      lender,
      title,
      officer: e?.officer ?? "Jin Yu",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      })
    };
  }, [e]);

  const body = renderBody(slug, merge);

  function handlePrint() {
    if (e) {
      logAudit({
        who: "Jin Yu",
        role: "Officer",
        action: "Document generated",
        target: e.id,
        detail: name + " generated and sent to print"
      });
    }
    window.print();
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/templates"
        className="text-ink-500 hover:text-ink-800 inline-flex items-center gap-1.5 text-[13px] w-fit"
      >
        <ArrowLeft size={14} /> All templates
      </Link>
      <header className="flex items-end justify-between gap-3 flex-wrap print:hidden">
        <div>
          <p className="text-[12px] text-ink-400">{category}</p>
          <h1 className="text-[28px] font-medium tracking-tighter2">{name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={14} /> Print
          </Button>
          <Button variant="primary" onClick={() => {
            if (e) logAudit({ who: "Jin Yu", role: "Officer", action: "Document saved as PDF", target: e.id, detail: name });
            toast.push(name + " saved as PDF (print dialog opening)", "ok");
            window.print();
          }}>
            <FileDown size={14} /> Save PDF
          </Button>
        </div>
      </header>

      <Card className="p-4 print:hidden">
        <p className="text-[12px] font-medium text-ink-600 mb-2">Merge from escrow file</p>
        <Select value={escrowId} onChange={(ev) => setEscrowId(ev.target.value)}>
          {escrows.map((x) => (
            <option key={x.id} value={x.id}>
              {x.id} - {x.property.address}
            </option>
          ))}
        </Select>
      </Card>


      <div className="bg-white border border-cream-300 rounded-lg shadow-card p-10 max-w-[800px] mx-auto print:border-0 print:shadow-none print:p-0 print:max-w-full">
        <p className="text-[10px] text-ink-400 uppercase tracking-tightish mb-2">
          Metro Escrow - {category}
        </p>
        <h2 className="text-[22px] font-medium tracking-tighter2 mb-1">{name}</h2>
        <p className="text-[12px] text-ink-500 mb-6">
          File: {merge.fileNumber} - {merge.propertyAddress}, {merge.city}, {merge.state} {merge.zip}
        </p>
        <pre className="whitespace-pre-wrap font-sans text-[13px] leading-[1.7] text-ink-800">
{body}
        </pre>
      </div>
    </div>
  );
}
