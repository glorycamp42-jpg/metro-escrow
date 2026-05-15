"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { logAudit } from "@/lib/data/audit";

export default function SettingsPage() {
  const toast = useToast();
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-[24px] font-medium tracking-tighter2">Settings</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Profile, security, and notification preferences.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-[13px] font-medium mb-1">Profile</p>
          <p className="text-[12px] text-ink-400 mb-4">Your name and contact details</p>
          <dl className="grid grid-cols-2 gap-3 text-[13px]">
            <dt className="text-ink-400">Name</dt>
            <dd>Jin Yu</dd>
            <dt className="text-ink-400">Email</dt>
            <dd>glorycamp42@gmail.com</dd>
            <dt className="text-ink-400">Role</dt>
            <dd>Escrow officer</dd>
          </dl>
          <Button className="mt-4" variant="secondary" onClick={() => toast.push("Profile editor opened", "info")}>
            Edit profile
          </Button>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] font-medium mb-1">Security</p>
          <p className="text-[12px] text-ink-400 mb-4">Two-factor auth and active sessions</p>
          <p className="text-[12px]">
            Two-factor authentication: <span className="text-red-600">Off</span>
          </p>
          <Button
            className="mt-4"
            variant="primary"
            onClick={() => {
              logAudit({ who: "Jin Yu", role: "Officer", action: "2FA setup started", target: "account", detail: "TOTP method" });
              toast.push("2FA setup wizard opened - scan QR with authenticator app", "ok");
            }}
          >
            Turn on 2FA
          </Button>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] font-medium mb-1">Notifications</p>
          <p className="text-[12px] text-ink-400 mb-4">How we reach you about deadlines</p>
          <ul className="text-[13px] space-y-2">
            <li>
              <input type="checkbox" defaultChecked className="mr-2" onChange={(e) => toast.push("Email notifications " + (e.target.checked ? "on" : "off"), "info")} />
              Email
            </li>
            <li>
              <input type="checkbox" defaultChecked className="mr-2" onChange={(e) => toast.push("SMS notifications " + (e.target.checked ? "on" : "off"), "info")} />
              SMS
            </li>
            <li>
              <input type="checkbox" className="mr-2" onChange={(e) => toast.push("Slack notifications " + (e.target.checked ? "on" : "off"), "info")} />
              Slack
            </li>
          </ul>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] font-medium mb-1">AI Assistant</p>
          <p className="text-[12px] text-ink-400 mb-4">Connect your Anthropic key to enable real LLM responses</p>
          <p className="text-[11px] text-ink-500 font-mono">ANTHROPIC_API_KEY</p>
          <p className="text-[11px] text-ink-400 mt-1">Set in <code>.env.local</code> (see <code>.env.local.example</code>).</p>
        </Card>
      </div>
    </div>
  );
}
