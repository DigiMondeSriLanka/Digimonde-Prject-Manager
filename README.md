# Digimonde — Project Management

A React + Supabase project management system for Digimonde: plan, track and report projects, tasks, people, clients, finance, risks and company assets, with a live executive dashboard.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, Recharts, Supabase (Postgres, Auth, Row Level Security, Realtime).

---

## 1. Set up the database (≈5 minutes)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → run the files in [`supabase/migrations/`](supabase/migrations) in order: `0001_schema.sql`, `0002_dm_status_active_inactive.sql`, `0003_tasks_for_dm_projects.sql`. Each file is safe to run on a database that already has the earlier ones, so on an existing database just run the ones you haven't run yet.
3. *(Optional, recommended for a demo)* run [`supabase/seed.sql`](supabase/seed.sql). It loads 15 employees, 6 clients, 9 dev projects (including MVP, Mobile Launch, Marketing Growth, Customer Acquisition, Fundraising and Hiring), 5 DM projects, 43 tasks, meetings, invoices, expenses, risks and assets. All dates are relative to today, so the demo always looks current.
4. **Authentication → Providers → Email**: keep it enabled. For quick internal testing you can switch off “Confirm email”.

## 2. Run the app

```bash
cp .env.example .env      # then fill in the URL + anon key from Supabase → Project Settings → API
npm install
npm run dev
```

Open http://localhost:5173 and **sign up. The first account becomes Admin automatically**; everyone after that starts as Employee. Admins can promote people under **Users & Access**.

Set `VITE_CURRENCY` in `.env` (e.g. `USD`, `LKR`, `GBP`) to change how money is displayed.

## 3. Deploy to Cloudflare Pages (via GitHub)

1. Push this folder to a GitHub repository.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build settings:
   - Framework preset: **React (Vite)** (or None)
   - Build command: `npm run build`
   - Build output directory: `dist`
4. **Environment variables** (add to both *Production* and *Preview*):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_CURRENCY`
   - They are baked in at build time, so **redeploy after changing them**.
   - Use the **anon / publishable** key only, never the `service_role` key. The anon key is safe in the browser because Row Level Security protects the data.
5. Supabase → **Authentication → URL Configuration**:
   - **Site URL** = your Pages URL, e.g. `https://digimonde-pm.pages.dev` (or your custom domain)
   - **Redirect URLs**: add `https://digimonde-pm.pages.dev/**`, `https://*.digimonde-pm.pages.dev/**` (preview builds) and `http://localhost:5173/**`

Routing: Cloudflare Pages serves `index.html` for every path when the site has no `404.html`, so deep links like `/tasks` work without a `_redirects` file. Node 22 is pinned in `.node-version`.

---

## Access levels

| | Admin | Employee |
|---|---|---|
| Executive Dashboard | ✅ view | ✅ view |
| Projects — Dev, Projects — DM, Tasks | ✅ view / add / edit / delete | ✅ view only |
| Meetings, Team, Clients, Invoices & Expenses, Risks, Assets, Users | ✅ full | ❌ hidden |

Access is enforced **in the database** with Row Level Security, not just hidden in the UI. An employee calling the API directly still cannot read finance data or edit anything.

## Modules

| # | Module | Highlights |
|---|---|---|
| 1 | **Executive Dashboard** | Two separate sections. **Development projects:** active / completed / delayed projects, upcoming deadlines, task KPIs, overdue tasks, average completion, team workload overview, project health score (0–100). Charts: project status donut, task completion by project, Gantt timeline with a today line, team workload, priority distribution, a health table, a deadlines list and a **task pivot table** (by project / assignee / category / priority / department × status). A **department slicer** filters the Development section. **Digital marketing projects:** active vs inactive, posts planned / published / remaining, overall completion, open DM tasks, a *posts published per project* chart and a per-project table of posts and task progress. DM tasks are never counted in the Development section. Updates live via Supabase Realtime, on window focus and every 60 s. |
| 2 | **Projects — Dev** | Departments Web / SD / Media / Other. **Number of tasks, completed and remaining tasks, and completion % are pulled automatically from the task tracker.** Project health: 🔴 past target date · 🟡 due within 7 days, overdue tasks or critical risk · 🟢 on schedule. Actual completion date is stamped when status becomes Completed. |
| 3 | **Projects — DM** | A separate project type with a simple **Active / Inactive** status. Posts / month, published, remaining (auto) and completion % = published ÷ posts / month (auto). Shows task counts for DM tasks. Shown in its own section of the dashboard, never mixed into Dev project counts. |
| 4 | **Tasks** | A task belongs to a **Dev or DM project** (one Project picker lists both). Multi-person **Assigned To**, days remaining = due − today, task health (Completed / Overdue / Urgent ≤ 3 days / On Track), colour-coded. Completion date and *Last Updated* are automatic. Sorted most-urgent first. |
| 5 | **Meetings & Actions** | Participants (multi-select), decisions, action items, owner, deadline (overdue highlighted), status. |
| 6 | **Team Resources** | Current projects, assigned / completed tasks, **workload % = open task hours ÷ (available hours × availability %)**. Under 60% = Underutilized (blue), 60–100% = Balanced (green), over 100% = Overloaded (red). |
| 7 | **Clients** | Full client register with contract value and account manager. |
| 8 | **Invoices & Expenses** | Balance = amount − paid (auto). Payment status Paid / Partially Paid / Unpaid / Overdue (auto) with days overdue. Expenses by category. Summary: invoiced, received, outstanding, overdue, expenses and net cash balance. |
| 9 | **Risks & Issues** | Score = probability × impact (auto); 1–5 Low, 6–12 Medium, 13–25 Critical. Includes a 5×5 heat map. |
| 10 | **Company Assets** | Warranty status (auto). **Every assignment and handover is logged automatically** (date assigned, date handed over, condition out/in) by a database trigger. Per-asset history plus a full log, and a one-click "record handover" button. |

### Automation, in spreadsheet terms

- **Dropdown validation:** every status, priority and category is a dropdown, also enforced by database `CHECK` constraints.
- **Linked IDs:** IDs are generated automatically (`EMP-001`, `PRJ-001`, `DM-001`, `CLI-001`, `TSK-0001`, …). As soon as an Employee, Project or Client is added, it appears in the searchable dropdowns on every other page, backed by real foreign keys.
- **Formulas:** computed columns are marked **ƒx** in table headers and appear under "Calculated automatically" in each record. They live in Postgres views and generated columns, so the dashboard, tables and exports always agree.
- **Filters / slicers / sorting / search** on every table; **frozen header row and ID column**; **Export** to CSV, which opens directly in Excel.
- **Conditional formatting:** one colour map (`src/lib/constants.ts → toneFor`) drives every badge.

## Project structure

```
supabase/
  migrations/0001_schema.sql   tables, auto-IDs, formula views, triggers, RLS, realtime
  seed.sql                     realistic sample data
src/
  pages/                       one file per module (Dashboard, ProjectsDev, Tasks, …)
  components/DataTable.tsx     generic table: search, slicers, sort, export, add/edit/delete
  components/RecordForm.tsx    generic add / edit / view dialog
  components/Fields.tsx        searchable ID picker + multi-person picker
  context/                     auth (role) + shared lookups (employees / projects / clients)
  lib/constants.ts             all dropdown values + status colours
```

To add a field: add the column in SQL, then add one line to the page's `columns` array. The table, form, filters and CSV export pick it up automatically.

## Design

Brand colours: Navy `#0F172A` (primary), Blue `#2563EB` (secondary), Green `#16A34A` (success), Orange `#F97316` (warning), Red `#DC2626` (danger), set in `src/index.css`. Font: Inter. Paired chart colours (completed/pending: green/blue; projects/tasks: blue/teal) were checked for colour-blind separation. Status colours are always shown with a text label.
