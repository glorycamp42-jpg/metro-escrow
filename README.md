# Metro Escrow

Modern, AI-native escrow platform. Hermès-inspired tone (orange + cream + ink).
Built with Next.js 15 (App Router), TypeScript, Tailwind, and `@dnd-kit`.

## Quick start

```bash
cd C:\Users\eugen\Documents\projects\06-metro-escrow
npm install
npm run dev
# open http://localhost:3030
# (port 3030 is hard-coded so it doesn't clash with ailivenow on 3000)
```

> If the first `npm install` complains with `ENOTEMPTY` errors, delete the
> `node_modules` folder in Explorer (it may contain leftover staging dirs from
> previous attempts) and run `npm install` again. The first clean install
> takes ~60–90 seconds.

Verified locally with `tsc --noEmit` — 0 type errors across all source files.

## Deploy to Vercel

1. Push this folder to a new GitHub repo:
   ```bash
   cd C:\Users\eugen\Documents\projects\06-metro-escrow
   git init
   git add .
   git commit -m "metro-escrow initial"
   gh repo create metro-escrow --public --source=. --push
   # or manually: create repo on github.com, then `git remote add origin ...` + `git push -u origin main`
   ```
2. Go to https://vercel.com/new and import the repo.
3. Vercel auto-detects Next.js. No env vars needed for the demo build.
4. Click **Deploy**. URL will be something like `metro-escrow.vercel.app` (or your team subdomain).
5. **Enable real AI Document Reader** — Vercel dashboard → Settings → Environment Variables:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from https://console.anthropic.com/
   - Apply to: Production, Preview, Development (all 3)
   - Save → trigger a new deployment (or push any commit)
   - Now `/transactions/new` → drop a real Purchase Agreement → Claude actually reads it.
   - Without the key, the DocReader falls back to sample data with a yellow notice.
6. (Phase 3) Additional env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — for auth + persistence.
   - `RESEND_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` — for the reminders worker.

Optional (Phase 2 onwards):

```bash
cp .env.local.example .env.local
# fill ANTHROPIC_API_KEY to flip the AI Assistant from local stub to real LLM
```

## Routes

| Route | What it shows |
| --- | --- |
| `/` | Dashboard — KPIs, week strip, active escrows, AI panel CTA, risk flags, portal preview |
| `/transactions` | Searchable list with status + risk pills |
| `/transactions/new` | Validated form (TXN-YYYY-NNN format, inline errors) |
| `/transactions/[id]` | Detail — info, AI risk flags, timeline, parties, quick actions |
| `/calendar` | Drag-and-drop weekly calendar with conflict detection |
| `/clients` | Buyers and sellers across active escrows |
| `/documents` | Uploaded docs with AI-summarized status |
| `/messages` | Phase 2 stub |
| `/analytics` | Single source of truth KPIs |
| `/settings` | Profile, security (2FA prompt), notifications, AI key |
| `/portal/[token]` | Public client portal — mobile-first, 8-step progress, next actions |

⌘K (or Ctrl+K) opens the **AI Assistant** from any staff page.

## What's wired up

**Phase 1 (✓ shipped this session)**
- Project scaffold + Hermès design tokens (orange `#F37021`, cream `#FAF6EE`, ink `#2C1810`)
- Layouts split into `(staff)` and `portal` route groups so the client view has no chrome
- Sidebar + Topbar + AI side sheet shell
- Dashboard, Transactions list/detail/new, Calendar, Documents, Clients, Analytics, Settings, Client Portal
- Mock data in `src/lib/data/mock.ts` (4 escrows, 4 appointments, risks, milestones, portal tokens)

**Phase 2 (✓ in this build)**
- Drag-and-drop weekly calendar with live conflict detection (`@dnd-kit`)
- Form validation on New Transaction (regex for TXN ID, ZIP, email, price)
- Smart Risk Flags (data-driven; surfaced on dashboard + transaction detail)
- AI Assistant with intent matcher (`src/lib/aiAgent.ts`) — recognizes:
  - "Open escrow for [address] with [name] as buyer, $X, close [date]"
  - "Summarize today"
  - "Send reminders"
  - "Show risk flags"

## Phase 3 — to do

- Supabase auth (Magic Link) + RLS
- Replace mock data layer with Supabase queries (the boundary is `src/lib/data/mock.ts`)
- Real LLM call through `/api/agent` route, swapping `runAgent` in `aiAgent.ts`
- Document upload + AI extraction (PDF → fields)
- Email/SMS reminder dispatch (Resend + Twilio)
- i18n (English / Korean / Spanish / Chinese)

## Folder layout

```
src/
  app/
    (staff)/
      layout.tsx          # sidebar + topbar + AI panel
      page.tsx            # dashboard
      transactions/{,new,[id]}
      calendar/
      clients/
      documents/
      messages/
      analytics/
      settings/
    portal/[token]/       # public client portal (no staff chrome)
    layout.tsx            # root <html><body>
  components/
    Sidebar.tsx
    Topbar.tsx
    ai/{AiProvider,AiPanel}.tsx
    calendar/CalendarBoard.tsx
    dashboard/WeekStrip.tsx
    ui/{Card,Button,Badge,Input}.tsx
  lib/
    cn.ts
    aiAgent.ts            # local intent matcher (swap to API in Phase 3)
    data/mock.ts
  styles/globals.css
tailwind.config.ts        # Hermès tokens
```

## Design tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `hermes-500` | `#F37021` | Brand accent, CTA, active state |
| `hermes-50` / `hermes-soft` | `#FFE8D6` / `#FFF3E8` | Tints, badges |
| `cream-100` | `#FAF6EE` | Page canvas |
| `cream-300` | `#E5DCC9` | Card borders |
| `ink-800` | `#2C1810` | Body text, dark headers |
| `ink-400` | `#8A6F4E` | Muted labels |

Inter loaded from Google Fonts in `globals.css`.
