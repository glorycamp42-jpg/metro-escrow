"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransactionDetail } from "@/components/transaction/TransactionDetail";
import { findEscrow } from "@/lib/data/userEscrows";
import type { Escrow } from "@/lib/data/mock";

export function TransactionLoader({ id }: { id: string }) {
  const [escrow, setEscrow] = React.useState<Escrow | null | undefined>(undefined);

  React.useEffect(() => {
    setEscrow(findEscrow(id) ?? null);
  }, [id]);

  if (escrow === undefined) {
    return <p className="text-[13px] text-ink-400 text-center py-12">Loading...</p>;
  }
  if (escrow === null) {
    return (
      <div className="max-w-[700px] mx-auto py-12 text-center">
        <p className="text-[15px] font-medium text-ink-700">
          Transaction {id} not found
        </p>
        <p className="text-[13px] text-ink-400 mt-1">
          It may not exist yet — try opening it from the New escrow form.
        </p>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 mt-4 text-[13px] text-hermes-500"
        >
          <ArrowLeft size={14} /> Back to transactions
        </Link>
      </div>
    );
  }
  return <TransactionDetail escrow={escrow} />;
}
