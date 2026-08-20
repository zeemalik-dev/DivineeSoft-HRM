# Divineesoft HRM

People, payroll, employee portal and project delivery in one console — built for
Divineesoft Technologies.

Next.js 16 · TypeScript · Tailwind · Prisma · deploys to Vercel in about two minutes.

---

## Which database is this using?

**Right now: none.** The app ships with a complete demo company (16 people, 6
projects, 3 payroll runs, 12 months of history) generated in `src/lib/seed.ts` and
held in memory. That is deliberate — you can push this to GitHub, deploy it, and
click through every screen without provisioning anything.

What that means in practice:

- Everything works: approve leave, run payroll, drag tasks, open payslips.
- Changes last for the browser session. Refresh and the seeded company returns.
- Nothing is shared between visitors.

**When you're ready for real data**, the target is **PostgreSQL on Supabase**.
`prisma/schema.prisma` is the full production schema (26 models, multi-tenant,
soft deletes, audit fields) and `prisma/seed.ts` loads the same company into it.
See *Connecting the database* below.

---

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

No `.env` file is needed to start.

## Deploy it

**GitHub**

```bash
git init
git add .
git commit -m "Divineesoft HRM"
git branch -M main
git remote add origin https://github.com/<your-org>/divineesoft-hrm.git
git push -u origin main
```

**Vercel** — go to vercel.com → *Add New → Project* → import the repository →
*Deploy*. Framework detection, build command and output are all automatic. You get
a live preview URL, plus a fresh preview deployment on every pull request.

Optional environment variable, set in Vercel → *Settings → Environment Variables*:

| Key | Effect |
|---|---|
| `ANTHROPIC_API_KEY` | Turns on the live AI assistant. Without it the assistant still answers, using built-in rules over the same data. |

---

## What's in here

```
src/
  app/
    page.tsx                 Dashboard — headcount, payroll status, delivery health
    employees/               List, filters, and an 8-tab profile per person
    departments/             Team cards with cost against budget
    attendance/              Daily register, punctuality, turnout chart
    leaves/                  Approve or reject; balance and email follow automatically
    salary/  payroll/  payslips/
                             Structures, the Draft→Paid run, printable payslips
    projects/  tasks/        Project cards, detail pages, drag-and-drop Kanban
    announcements/  email/  notifications/
    reports/  audit/  settings/  portal/
    api/ai/chat/route.ts     Server-side proxy to Claude
  components/
    shell/                   Sidebar, top bar, layout chrome
    ui/                      Card, Pill, Avatar, Icon, Stat, Steps, Bar
    charts/                  Area, bar and donut charts drawn as plain SVG
    modals/                  Payslip, status change, salary revision, add person…
    ai/                      Assistant drawer
  lib/
    seed.ts                  The company + payroll calculation engine
    store.tsx                State and every mutation (the future server actions)
    types.ts  format.ts  rbac.ts
prisma/
  schema.prisma              Production database schema
  seed.ts                    Loads the demo company into Postgres
```

### Things worth trying

- **Switch role** in the top bar. The sidebar shrinks to what that role may reach —
  sign in as Employee and only the portal remains.
- **Approve a leave request.** The balance drops, an email is queued, a notification
  appears and an audit row is written.
- **Advance the August payroll** from Draft through to Paid. Confirming generates
  16 payslips; open one and print it.
- **Drag a task** across the board — the move is logged and the owner notified.
- **Toggle dark mode**, top right.

---

## Design

Brand blue `#0A4BF1` is sampled directly from the supplied logo files. The chevron
notch inside the D-mark is reused as the structural motif: it's the active-nav
indicator, the payroll status stepper, and the fill on every progress bar. Type is
Space Grotesk for headings and figures, IBM Plex Sans for body, IBM Plex Mono for
money and IDs.

Fonts load by `<link>` rather than `next/font` so the project also builds in offline
CI. Each family has a system fallback.

---

## The AI assistant

`POST /api/ai/chat` proxies to Claude server-side. Two reasons it is not called from
the browser:

1. The API key would end up in the client bundle.
2. The context must be filtered to what the caller may see.

Point 2 is the important one. The route currently receives context from the client;
once authentication is wired, read the role from the session **on the server** and
build the context from the database using the same `WHERE` clauses the REST
endpoints use. An assistant with unfiltered payroll access will read a colleague's
salary to anyone who asks.

Without `ANTHROPIC_API_KEY` the route returns 503 and the drawer falls back to
built-in answers over the same data, so the feature never appears broken.

---

## Connecting the database

```bash
# 1. Create a Supabase project, then copy both connection strings into .env
DATABASE_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:5432/postgres"

# 2. Create the tables and load the company
npm install @prisma/client
npm run db:push
npm run db:seed
```

Then replace the mutations in `src/lib/store.tsx` with server actions one at a
time. Each one already performs exactly the operation its database version will:
same inputs, same audit row, same notification. No component needs to change.

### Payroll rules, as implemented

```
housing    = basic × 0.20     transport = basic × 0.08     medical = basic × 0.06
hourlyRate = basic ÷ 176
overtime   = approvedHours × hourlyRate × 1.5
unpaidLeave= unpaidDays × (basic ÷ 26)

gross = basic + allowances + bonus + commission + overtime
net   = gross − tax − loan − unpaidLeave − otherDeductions
```

`@@unique([companyId, month, year])` on `Payroll` is what actually prevents a
duplicate run for a month — never rely on a UI check for that.

---

## Roadmap

| Phase | Scope |
|---|---|
| 1 | Supabase connected, Prisma replacing the in-memory store |
| 2 | Auth: JWT access + rotating refresh, argon2id, 2FA, session revocation on suspend |
| 3 | Server actions for every mutation, permission guards enforced server-side |
| 4 | Real payslip PDFs, SMTP through NodeMailer with a retry queue |
| 5 | File uploads to Supabase Storage with signed URLs |
| 6 | CSV / Excel / PDF report exports |
| 7 | Multi-tenancy, branches, biometric attendance feed |

Ship phases 1–4 before anything else. Payroll accuracy is what this system is
judged on.

---

Divineesoft Technologies · [www.divineesoft.com](https://www.divineesoft.com) ·
info@divineesoft.com · +92 314 6256754
