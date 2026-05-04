"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field, Select } from "@/components/ui/Input";
import { useAi } from "@/components/ai/AiProvider";
import { DocReader, type Extracted } from "@/components/ai/DocReader";

type FormState = {
  txnNumber: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: string;
  closingDate: string;
  buyer: string;
  buyerEmail: string;
};

const empty: FormState = {
  txnNumber: "",
  type: "Residential Resale",
  address: "",
  city: "",
  state: "CA",
  zip: "",
  price: "",
  closingDate: "",
  buyer: "",
  buyerEmail: ""
};

export default function NewTransactionPage() {
  const router = useRouter();
  const { open } = useAi();
  const [form, setForm] = React.useState<FormState>(empty);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>(
    {}
  );
  const [submitting, setSubmitting] = React.useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const next: typeof errors = {};
    if (!form.txnNumber.match(/^TXN-\d{4}-\d{3}$/))
      next.txnNumber = "Use the format TXN-YYYY-NNN (e.g., TXN-2026-005).";
    if (!form.address.trim()) next.address = "Property address is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.state.trim()) next.state = "State is required.";
    if (!form.zip.match(/^\d{5}$/)) next.zip = "ZIP must be 5 digits.";
    if (!form.price.match(/^\d+(\.\d+)?$/))
      next.price = "Enter a number (no commas, no $).";
    if (!form.closingDate) next.closingDate = "Pick a closing date.";
    if (!form.buyer.trim()) next.buyer = "Buyer name is required.";
    if (form.buyerEmail && !form.buyerEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))
      next.buyerEmail = "That doesn't look like a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Phase 1: simulate persistence with a short delay, then route to detail.
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    router.push(`/transactions/${form.txnNumber}`);
  }

  return (
    <div className="max-w-[860px] mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link
          href="/transactions"
          className="text-ink-500 hover:text-ink-800 inline-flex items-center gap-1.5 text-[12px]"
        >
          <ArrowLeft size={14} /> Back
        </Link>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-medium tracking-tighter2">New escrow</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Enter the basics — the AI assistant will fill the rest from documents.
          </p>
        </div>
        <Button variant="ink" onClick={open}>
          <Sparkles size={14} />
          Open with AI instead
        </Button>
      </div>

      <DocReader
        onExtract={(ex: Extracted) =>
          setForm((f) => ({
            ...f,
            txnNumber: ex.txnNumber ?? f.txnNumber,
            type: ex.type ?? f.type,
            address: ex.address ?? f.address,
            city: ex.city ?? f.city,
            state: ex.state ?? f.state,
            zip: ex.zip ?? f.zip,
            price: ex.price ?? f.price,
            closingDate: ex.closingDate ?? f.closingDate,
            buyer: ex.buyer ?? f.buyer,
            buyerEmail: ex.buyerEmail ?? f.buyerEmail
          }))
        }
      />

      <Card className="p-5">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <Section title="Transaction details">
            <Field label="Transaction number" error={errors.txnNumber}>
              <Input
                value={form.txnNumber}
                onChange={(e) => set("txnNumber", e.target.value.toUpperCase())}
                placeholder="TXN-2026-005"
                invalid={!!errors.txnNumber}
              />
            </Field>
            <Field label="Type">
              <Select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option>Residential Resale</option>
                <option>Commercial</option>
                <option>1031 Exchange</option>
                <option>Investment Property</option>
                <option>REO</option>
              </Select>
            </Field>
          </Section>

          <Section title="Property">
            <div className="md:col-span-2">
              <Field label="Address" error={errors.address}>
                <Input
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="123 Main St"
                  invalid={!!errors.address}
                />
              </Field>
            </div>
            <Field label="City" error={errors.city}>
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Los Angeles"
                invalid={!!errors.city}
              />
            </Field>
            <Field label="State" error={errors.state}>
              <Input
                value={form.state}
                onChange={(e) => set("state", e.target.value.toUpperCase())}
                placeholder="CA"
                maxLength={2}
                invalid={!!errors.state}
              />
            </Field>
            <Field label="ZIP" error={errors.zip}>
              <Input
                value={form.zip}
                onChange={(e) => set("zip", e.target.value)}
                placeholder="90001"
                invalid={!!errors.zip}
              />
            </Field>
          </Section>

          <Section title="Financials">
            <Field
              label="Purchase price"
              hint="USD, digits only"
              error={errors.price}
            >
              <Input
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="850000"
                invalid={!!errors.price}
              />
            </Field>
            <Field label="Closing date" error={errors.closingDate}>
              <Input
                type="date"
                value={form.closingDate}
                onChange={(e) => set("closingDate", e.target.value)}
                invalid={!!errors.closingDate}
              />
            </Field>
          </Section>

          <Section title="Buyer">
            <Field label="Full name" error={errors.buyer}>
              <Input
                value={form.buyer}
                onChange={(e) => set("buyer", e.target.value)}
                placeholder="John Buyer"
                invalid={!!errors.buyer}
              />
            </Field>
            <Field label="Email (optional)" error={errors.buyerEmail}>
              <Input
                type="email"
                value={form.buyerEmail}
                onChange={(e) => set("buyerEmail", e.target.value)}
                placeholder="john@example.com"
                invalid={!!errors.buyerEmail}
              />
            </Field>
          </Section>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
            <Link href="/transactions">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Opening..." : "Open escrow"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[12px] font-medium text-ink-600 mb-2.5">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">{children}</div>
    </div>
  );
}
