import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, Sparkles } from "lucide-react";

const SAMPLE = [
  { name: "Purchase Agreement.pdf", type: "Purchase Agreement", who: "John Buyer", date: "Apr 9", size: "239 KB", status: "Signed" },
  { name: "Home Inspection Report.pdf", type: "Inspection", who: "Inspector", date: "Apr 11", size: "1.14 MB", status: "AI summarized" },
  { name: "Appraisal Report.pdf", type: "Appraisal", who: "Appraiser", date: "Apr 14", size: "869 KB", status: "Uploaded" },
  { name: "Title Report.pdf", type: "Title", who: "Title Co.", date: "Apr 17", size: "445 KB", status: "Uploaded" }
];

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-medium tracking-tighter2">Documents</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Drop a PDF — the AI extracts key terms and routes signatures.
          </p>
        </div>
        <Button variant="primary">
          <Upload size={14} /> Upload document
        </Button>
      </header>
      <Card className="p-0 overflow-hidden">
        <ul>
          {SAMPLE.map((d) => (
            <li
              key={d.name}
              className="flex items-center gap-3 px-4 py-3 border-b border-cream-200 last:border-0"
            >
              <div className="grid place-items-center w-9 h-9 rounded-md bg-cream-100 text-ink-700">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{d.name}</p>
                <p className="text-[11px] text-ink-400">
                  {d.type} · {d.who} · {d.date} · {d.size}
                </p>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: d.status === "AI summarized" ? "var(--hermes-soft)" : "#F2EBDA",
                  color: d.status === "AI summarized" ? "var(--hermes)" : "#6B5640"
                }}
              >
                {d.status === "AI summarized" && (
                  <Sparkles size={9} className="inline -mt-0.5 mr-1" />
                )}
                {d.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
