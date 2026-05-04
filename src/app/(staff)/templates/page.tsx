import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TEMPLATES } from "@/lib/templates";
import { FileText } from "lucide-react";

export default function TemplatesIndexPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[28px] font-medium tracking-tighter2">Document templates</h1>
        <p className="text-[14px] text-ink-500 mt-1">
          Pick a form, choose an escrow, and the merge fields fill in. Print or save to file.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATES.map((t) => (
          <Link key={t.slug} href={"/templates/" + t.slug}>
            <Card className="p-4 hover:border-hermes-300 transition-colors h-full">
              <div className="flex items-start gap-3">
                <div className="grid place-items-center w-10 h-10 rounded-md bg-cream-100 text-ink-700 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium">{t.name}</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">{t.category}</p>
                  <p className="text-[12px] text-ink-500 mt-2 leading-relaxed">
                    {t.blurb}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
