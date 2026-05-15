import { TransactionLoader } from "@/components/transaction/TransactionLoader";

export default async function TransactionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransactionLoader id={id} />;
}
