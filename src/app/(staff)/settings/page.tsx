"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { logAudit } from "@/lib/data/audit";

type Profile = { name: string; email: string; phone: string };

const PROFILE_KEY = "metro-escrow:profile";
const DEFAULT_PROFILE: Profile = {
  name: "Jin Yu",
  email: "glorycamp42@gmail.com",
  phone: ""
};

function readProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<Profile>) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function writeProfile(p: Profile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export default function SettingsPage() {
  const toast = useToast();
  const [profile, setProfile] = React.useState<Profile>(DEFAULT_PROFILE);
  const [editing, setEditing] = React.useState(false);

  React.useEffect(() => {
    setProfile(readProfile());
  }, []);

  function handleSave(next: Profile) {
    setProfile(next);
    writeProfile(next);
    setEditing(false);
    logAudit({
      who: next.name,
      role: "Officer",
      action: "Profile updated",
      target: "account",
      detail: "Name/email/phone"
    });
    toast.push("Profile saved", "ok");
  }

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
            <dd>{profile.name}</dd>
            <dt className="text-ink-400">Email</dt>
            <dd>{profile.email}</dd>
            <dt className="text-ink-400">Phone</dt>
            <dd>{profile.phone || <span className="text-ink-400 italic">not set</span>}</dd>
            <dt className="text-ink-400">Role</dt>
            <dd>Escrow officer</dd>
          </dl>
          <Button className="mt-4" variant="secondary" onClick={() => setEditing(true)}>
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
              logAudit({ who: profile.name, role: "Officer", action: "2FA setup started", target: "account", detail: "TOTP method" });
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

      {editing && (
        <EditProfileModal
          initial={profile}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  initial,
  onClose,
  onSave
}: {
  initial: Profile;
  onClose: () => void;
  onSave: (p: Profile) => void;
}) {
  const [name, setName] = React.useState(initial.name);
  const [email, setEmail] = React.useState(initial.email);
  const [phone, setPhone] = React.useState(initial.phone);

  function submit() {
    if (!name.trim() || !email.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink-900/40">
      <div className="bg-white rounded-lg w-[440px] max-w-[92%] shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cream-200">
          <p className="text-[14px] font-medium">Edit profile</p>
          <button onClick={onClose} aria-label="Close">
            <X size={16} className="text-ink-400 hover:text-ink-700" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="Email">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(213) 555-0100" />
          </Field>
          <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={!name.trim() || !email.trim()}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
