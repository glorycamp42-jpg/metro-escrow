import { Card } from "@/components/ui/Card";

export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[24px] font-medium tracking-tighter2">Messages</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Threaded conversations, one per escrow.
        </p>
      </header>
      <Card className="p-8 text-center">
        <p className="text-[14px] text-ink-700 font-medium">
          Messaging arrives in Phase 2.
        </p>
        <p className="text-[12px] text-ink-400 mt-1">
          Want it sooner? Ask the AI Assistant to send templated outreach via the ⌘K panel.
        </p>
      </Card>
    </div>
  );
}
