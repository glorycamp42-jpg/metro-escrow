"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Plus, Filter, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fmtMoney, STATUS_META, type Escrow, type EscrowStatus } from "@/lib/data/mock";
import { allEscrows, exportUserEscrows, importUserEscrows } from "@/lib/data/userEscrows";
import { useToast } from "@/components/ui/Toast";

type StatusFilter = "all" | EscrowStatus;
type TypeFilter = "all" | Escrow["type"];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "opened", label: "Opened" },
  { value: "in_progress", label: "In progress" },
  { value: "pending_closing", label: "Pending closing" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" }
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Residential Resale", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "1031 Exchange", label: "1031" },
  { value: "Investment Property", label: "Investment" },
  { value: "REO", label: "REO" },
  { value: "Refinance", label: "Refinance" }
];

export default function TransactionsPage() {
  const toast = useToast();
  const [q, setQ] = React.useState("");
  const [escrows, setEscrows] = React.useState<Escrow[]>([]);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [riskOnly, setRiskOnly] = React.useState(false);

  React.useEffect(() => {
    setEscrows(allEscrows());
  }, []);

  const fileRef = React.useRef<HTMLInputElement>(null);
  const filterRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(ev: MouseEvent) {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(ev.target as Node)) setFilterOpen(false);
    }
    if (filterOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [filterOpen]);

  function handleExport() {
    const json = exportUserEscrows();
    if (!json || json === "[]") {
      toast.push("No user-created escrows yet — nothing to back up", "info");
      return;
    }
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date().toISOString().slice(0, 10);
    a.download = "metro-escrow-backup-" + today + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.push("Backup file downloaded", "ok");
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleImportFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const result = importUserEscrows(text);
      setEscrows(allEscrows());
      const noun = result.added === 1 ? "escrow" : "escrows";
      toast.push(result.added + " new " + noun + " imported (total " + result.total + ")", "ok");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.push("Import failed: " + msg, "warn");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const filtered = escrows.filter((e) => {
    const t = (q ?? "").toLowerCase();
    if (t) {
      const matchesText =
        e.id.toLowerCase().includes(t) ||
        e.property.address.toLowerCase().includes(t) ||
        e.property.city.toLowerCase().includes(t);
      if (!matchesText) return false;
    }
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (riskOnly && e.risks.length === 0) return false;
    return true;
  });

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (riskOnly ? 1 : 0);

  function clearFilters() {
    setStatusFilter("all");
    setTypeFilter("all");
    setRiskOnly(false);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-medium tracking-tighter2">Transactions</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Manage every escrow your office is running.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept="application/json,.json"
            ref={fileRef}
            onChange={handleImportFile}
            className="hidden"
          />
          <Button variant="secondary" onClick={handleExport} title="Download a JSON backup of your escrows">
            <Download size={14} />
            Export
          </Button>
          <Button variant="secondary" onClick={handleImportClick} title="Restore escrows from a backup JSON file">
            <Upload size={14} />
            Import
          </Button>
          <Link href="/transactions/new">
            <Button variant="primary">
              <Plus size={14} />
              New escrow
            </Button>
          </Link>
        </div>
      </header>

      <Card className="p-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-md bg-cream-50 border border-cream-300">
          <Search size={14} className="text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by transaction ID, address or city..."
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink-400"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <Button variant="secondary" onClick={() => setFilterOpen((o) => !o)}>
            <Filter size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-hermes-500 text-white text-[10px] font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-cream-300 rounded-md shadow-card z-30 p-4 flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-medium text-ink-500 uppercase tracking-tightish mb-1.5">Status</p>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="h-9 w-full rounded-md border border-cream-300 bg-white px-2 text-[13px]"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[11px] font-medium text-ink-500 uppercase tracking-tightish mb-1.5">Type</p>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                  className="h-9 w-full rounded-md border border-cream-300 bg-white px-2 text-[13px]"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-ink-700">
                <input
                  type="checkbox"
                  checked={riskOnly}
                  onChange={(e) => setRiskOnly(e.target.checked)}
                />
                Has risk flags
              </label>
              <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                <button
                  className="text-[12px] text-ink-500 hover:text-ink-800"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
                <Button size="sm" variant="primary" onClick={() => setFilterOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 text-[11px] font-medium text-ink-400 uppercase tracking-tightish border-b border-cream-200">
          <div className="col-span-3">Transaction</div>
          <div className="col-span-3">Property</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Price</div>
          <div className="col-span-1 text-right">Closing</div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-[14px] font-medium text-ink-700">No matches</p>
            <p className="text-[12px] text-ink-400 mt-1">Try a different search, or open a new escrow.</p>
          </div>
        ) : (
          <ul>
            {filtered.map((e) => {
              const meta = STATUS_META[e.status];
              return (
                <li key={e.id}>
                  <Link href={"/transactions/" + e.id} className="grid grid-cols-12 px-4 py-3.5 hover:bg-cream-50 border-b border-cream-200 last:border-0">
                    <div className="col-span-3 text-[13px] font-medium">{e.id}</div>
                    <div className="col-span-3">
                      <p className="text-[13px]">{e.property.address}</p>
                      <p className="text-[11px] text-ink-400">{e.property.city}, {e.property.state} {e.property.zip}</p>
                    </div>
                    <div className="col-span-2 text-[12px] text-ink-500">{e.type}</div>
                    <div className="col-span-2">
                      <Badge bg={meta.bg} fg={meta.fg}>{meta.label}</Badge>
                      {e.risks.length > 0 && (
                        <Badge bg="#FCEBEB" fg="#A32D2D" className="ml-1.5">Risk</Badge>
                      )}
                    </div>
                    <div className="col-span-1 text-right text-[13px] font-medium">{fmtMoney(e.price)}</div>
                    <div className="col-span-1 text-right text-[12px] text-ink-500">
                      {new Date(e.closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
