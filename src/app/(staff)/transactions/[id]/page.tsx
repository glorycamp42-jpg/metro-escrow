import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { escrows } from "@/lib/data/mock";
import { TransactionDetail } from "@/components/transaction/TransactionDetail";

export default async function TransactionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = escrows.find((x) => x.id === id);
  if (!e) {
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
  return <TransactionDetail escrow={e} />;
}
