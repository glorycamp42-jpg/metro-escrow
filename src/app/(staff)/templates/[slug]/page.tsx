import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { TemplateBuilder } from "@/components/templates/TemplateBuilder";

export default async function TemplateDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tpl = TEMPLATES.find((t) => t.slug === slug);
  if (!tpl) {
    return (
      <div className="max-w-[700px] mx-auto py-12 text-center">
        <p className="text-[14px] font-medium text-ink-700">Template not found</p>
        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 mt-4 text-[13px] text-hermes-500"
        >
          <ArrowLeft size={14} /> Back to templates
        </Link>
      </div>
    );
  }
  return <TemplateBuilder slug={tpl.slug} name={tpl.name} category={tpl.category} />;
}
