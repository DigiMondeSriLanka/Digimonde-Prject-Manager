-- =====================================================================
-- Digimonde Project Management — database schema
-- Run in the Supabase SQL editor (or `supabase db push`), then seed.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create sequence if not exists public.emp_seq;
create sequence if not exists public.cli_seq;
create sequence if not exists public.prj_seq;
create sequence if not exists public.dm_seq;
create sequence if not exists public.tsk_seq;
create sequence if not exists public.mtg_seq;
create sequence if not exists public.inv_seq;
create sequence if not exists public.exp_seq;
create sequence if not exists public.rsk_seq;
create sequence if not exists public.ast_seq;

-- ---------------------------------------------------------------------
-- 1. Users & access levels (Admin / Employee)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'employee' check (role in ('admin', 'employee')),
  employee_id text,
  created_at  timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- New sign-ups become employees; the very first account becomes admin.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when exists (select 1 from public.profiles) then 'employee' else 'admin' end
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2. Team / employees
-- ---------------------------------------------------------------------
create table public.employees (
  id                text primary key default 'EMP-' || lpad(nextval('public.emp_seq')::text, 3, '0'),
  name              text not null,
  email             text,
  phone             text,
  role_title        text,
  department        text check (department in ('Web', 'SD', 'Media', 'DM', 'Management', 'Operations', 'Finance', 'Other')),
  skill_area        text,
  availability_pct  int not null default 100 check (availability_pct between 0 and 100),
  available_hours   numeric(6,1) not null default 80,   -- capacity for the current planning period (2-week sprint)
  employment_status text not null default 'Active' check (employment_status in ('Active', 'On Leave', 'Inactive')),
  join_date         date,
  performance_notes text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_employee_fk foreign key (employee_id) references public.employees(id) on delete set null;

-- ---------------------------------------------------------------------
-- 3. Clients
-- ---------------------------------------------------------------------
create table public.clients (
  id              text primary key default 'CLI-' || lpad(nextval('public.cli_seq')::text, 3, '0'),
  company_name    text not null,
  contact_person  text,
  phone           text,
  email           text,
  country         text,
  service_type    text check (service_type in ('Web Development', 'Software Development', 'Media Production', 'Digital Marketing', 'Consulting', 'Other')),
  project_name    text,
  contract_value  numeric(14,2) not null default 0,
  start_date      date,
  end_date        date,
  status          text not null default 'Active' check (status in ('Lead', 'Active', 'On Hold', 'Completed', 'Churned')),
  project_manager text references public.employees(id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. Project master database — Dev (Web / SD / Media / Other)
-- ---------------------------------------------------------------------
create table public.projects_dev (
  id           text primary key default 'PRJ-' || lpad(nextval('public.prj_seq')::text, 3, '0'),
  name         text not null,
  description  text,
  department   text not null default 'Web' check (department in ('Web', 'SD', 'Media', 'Other')),
  owner_id     text references public.employees(id) on delete set null,
  manager_id   text references public.employees(id) on delete set null,
  client_id    text references public.clients(id) on delete set null,
  objective    text,
  priority     text not null default 'Medium' check (priority in ('Critical', 'High', 'Medium', 'Low')),
  status       text not null default 'Planning' check (status in ('Planning', 'Research', 'Development', 'Testing', 'Launch', 'Completed', 'On Hold', 'Cancelled')),
  start_date   date,
  target_date  date,
  actual_date  date,
  budget       numeric(14,2) not null default 0,
  risk_level   text not null default 'Low' check (risk_level in ('Low', 'Medium', 'High', 'Critical')),
  dependencies text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Stamp the actual completion date automatically.
create or replace function public.projects_dev_completion() returns trigger
language plpgsql as $$
begin
  if new.status = 'Completed' and new.actual_date is null then
    new.actual_date := current_date;
  elsif new.status <> 'Completed' and tg_op = 'UPDATE' and old.status = 'Completed' then
    new.actual_date := null;
  end if;
  return new;
end $$;

create trigger projects_dev_completion before insert or update on public.projects_dev
  for each row execute function public.projects_dev_completion();

-- ---------------------------------------------------------------------
-- 5. Project master database — DM (Digital Marketing)
-- ---------------------------------------------------------------------
create table public.projects_dm (
  id              text primary key default 'DM-' || lpad(nextval('public.dm_seq')::text, 3, '0'),
  name            text not null,
  description     text,
  client_id       text references public.clients(id) on delete set null,
  owner_id        text references public.employees(id) on delete set null,
  manager_id      text references public.employees(id) on delete set null,
  handler_id      text references public.employees(id) on delete set null,
  priority        text not null default 'Medium' check (priority in ('Critical', 'High', 'Medium', 'Low')),
  status          text not null default 'Active' check (status in ('Active', 'Inactive')),
  start_date      date,
  reporting_month date not null default date_trunc('month', current_date)::date,
  posts_per_month int not null default 0 check (posts_per_month >= 0),
  published_posts int not null default 0 check (published_posts >= 0),
  remaining_posts int generated always as (greatest(posts_per_month - published_posts, 0)) stored,
  completion_pct  numeric(5,1) generated always as (
    case when posts_per_month > 0
      then round(least(published_posts::numeric / posts_per_month, 1) * 100, 1)
      else 0 end) stored,
  risk_level      text not null default 'Low' check (risk_level in ('Low', 'Medium', 'High', 'Critical')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 6. Task management system (Dev / SD / Media / Other)
-- ---------------------------------------------------------------------
create table public.tasks (
  id              text primary key default 'TSK-' || lpad(nextval('public.tsk_seq')::text, 4, '0'),
  project_id      text not null references public.projects_dev(id) on delete cascade,
  name            text not null,
  description     text,
  category        text not null default 'Development' check (category in ('Development', 'Design', 'QA', 'DevOps', 'Content', 'Research', 'Management', 'Marketing', 'Other')),
  assigned_to     text[] not null default '{}',     -- employee IDs (multiple people)
  owner_id        text references public.employees(id) on delete set null,
  priority        text not null default 'Medium' check (priority in ('Critical', 'High', 'Medium', 'Low')),
  status          text not null default 'Backlog' check (status in ('Backlog', 'Assigned', 'In Progress', 'Review', 'Testing', 'Completed', 'Blocked')),
  start_date      date,
  due_date        date,
  completion_date date,
  estimated_hours numeric(6,1) not null default 0,
  risk            text not null default 'Low' check (risk in ('Low', 'Medium', 'High', 'Critical')),
  comments        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index tasks_project_idx on public.tasks (project_id);
create index tasks_assigned_idx on public.tasks using gin (assigned_to);

create or replace function public.tasks_completion() returns trigger
language plpgsql as $$
begin
  if new.status = 'Completed' and new.completion_date is null then
    new.completion_date := current_date;
  elsif new.status <> 'Completed' then
    new.completion_date := null;
  end if;
  return new;
end $$;

create trigger tasks_completion before insert or update on public.tasks
  for each row execute function public.tasks_completion();

-- ---------------------------------------------------------------------
-- 7. Meetings & action tracker
-- ---------------------------------------------------------------------
create table public.meetings (
  id           text primary key default 'MTG-' || lpad(nextval('public.mtg_seq')::text, 3, '0'),
  meeting_date date not null default current_date,
  meeting_type text not null default 'Management' check (meeting_type in ('Daily Standup', 'Sprint Planning', 'Sprint Review', 'Client Meeting', 'Management', 'Investor Update', 'All Hands', 'One-on-One', 'Other')),
  participants text[] not null default '{}',
  topic        text not null,
  decision     text,
  action_item  text,
  owner_id     text references public.employees(id) on delete set null,
  deadline     date,
  status       text not null default 'Open' check (status in ('Open', 'In Progress', 'Completed', 'Cancelled')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. Finance — invoices (income) and expenses
-- ---------------------------------------------------------------------
create table public.invoices (
  id         text primary key default 'INV-' || lpad(nextval('public.inv_seq')::text, 4, '0'),
  client_id  text references public.clients(id) on delete set null,
  project_id text references public.projects_dev(id) on delete set null,
  issue_date date not null default current_date,
  due_date   date,
  amount     numeric(14,2) not null default 0 check (amount >= 0),
  paid       numeric(14,2) not null default 0 check (paid >= 0),
  balance    numeric(14,2) generated always as (amount - paid) stored,
  status     text not null default 'Sent' check (status in ('Draft', 'Sent', 'Cancelled')),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expenses (
  id             text primary key default 'EXP-' || lpad(nextval('public.exp_seq')::text, 4, '0'),
  expense_date   date not null default current_date,
  category       text not null default 'Other' check (category in ('Salaries', 'Software & Tools', 'Hosting & Infrastructure', 'Marketing', 'Office & Rent', 'Equipment', 'Travel', 'Professional Services', 'Utilities', 'Other')),
  description    text not null,
  vendor         text,
  project_id     text references public.projects_dev(id) on delete set null,
  amount         numeric(14,2) not null default 0 check (amount >= 0),
  payment_method text not null default 'Bank Transfer' check (payment_method in ('Bank Transfer', 'Card', 'Cash', 'Cheque', 'Other')),
  status         text not null default 'Paid' check (status in ('Paid', 'Pending')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 9. Risks & issues register
-- ---------------------------------------------------------------------
create table public.risks (
  id             text primary key default 'RSK-' || lpad(nextval('public.rsk_seq')::text, 3, '0'),
  project_id     text references public.projects_dev(id) on delete cascade,
  description    text not null,
  category       text not null default 'Technical' check (category in ('Technical', 'Financial', 'Market', 'Customer', 'Operational', 'Legal', 'Team')),
  probability    int not null default 1 check (probability between 1 and 5),
  impact         int not null default 1 check (impact between 1 and 5),
  severity_score int generated always as (probability * impact) stored,
  severity_level text generated always as (
    case when probability * impact <= 5 then 'Low'
         when probability * impact <= 12 then 'Medium'
         else 'Critical' end) stored,
  owner_id       text references public.employees(id) on delete set null,
  mitigation     text,
  status         text not null default 'Open' check (status in ('Open', 'Monitoring', 'Mitigated', 'Escalated', 'Closed')),
  target_date    date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 10. Company assets + assignment / handover log
-- ---------------------------------------------------------------------
create table public.assets (
  id             text primary key default 'AST-' || lpad(nextval('public.ast_seq')::text, 3, '0'),
  name           text not null,
  category       text not null default 'Laptop' check (category in ('Laptop', 'Desktop', 'Monitor', 'Mobile Device', 'Camera', 'Audio', 'Networking', 'Furniture', 'Software License', 'Other')),
  serial_number  text,
  assigned_to    text references public.employees(id) on delete set null,
  purchase_date  date,
  purchase_cost  numeric(14,2) not null default 0,
  warranty_until date,
  condition      text not null default 'New' check (condition in ('New', 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged')),
  status         text not null default 'Available' check (status in ('Available', 'Assigned', 'Under Repair', 'Retired', 'Lost')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.asset_assignments (
  id                  bigint generated always as identity primary key,
  asset_id            text not null references public.assets(id) on delete cascade,
  employee_id         text references public.employees(id) on delete set null,
  assigned_at         timestamptz not null default now(),
  returned_at         timestamptz,
  condition_assigned  text,
  condition_returned  text,
  notes               text
);

create index asset_assignments_asset_idx on public.asset_assignments (asset_id);

-- Keep status in sync with assignment.
create or replace function public.assets_sync_status() returns trigger
language plpgsql as $$
begin
  if new.assigned_to is not null and new.status = 'Available' then
    new.status := 'Assigned';
  elsif new.assigned_to is null and new.status = 'Assigned' then
    new.status := 'Available';
  end if;
  return new;
end $$;

create trigger assets_sync_status before insert or update on public.assets
  for each row execute function public.assets_sync_status();

-- Write a log row every time an asset is assigned or handed over.
create or replace function public.assets_log_assignment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.assigned_to is not null then
      insert into asset_assignments (asset_id, employee_id, condition_assigned)
      values (new.id, new.assigned_to, new.condition);
    end if;
  elsif new.assigned_to is distinct from old.assigned_to then
    update asset_assignments
       set returned_at = now(), condition_returned = new.condition
     where asset_id = new.id and returned_at is null;
    if new.assigned_to is not null then
      insert into asset_assignments (asset_id, employee_id, condition_assigned)
      values (new.id, new.assigned_to, new.condition);
    end if;
  end if;
  return null;
end $$;

create trigger assets_log_assignment after insert or update on public.assets
  for each row execute function public.assets_log_assignment();

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['employees', 'clients', 'projects_dev', 'projects_dm', 'tasks', 'meetings', 'invoices', 'expenses', 'risks', 'assets']
  loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- =====================================================================
-- "Formula" views — computed columns that update automatically
-- (security_invoker so the caller's RLS still applies)
-- =====================================================================

create view public.tasks_v with (security_invoker = true) as
select
  t.*,
  p.name       as project_name,
  p.department as department,
  case when t.status = 'Completed' or t.due_date is null then null
       else t.due_date - current_date end as days_remaining,
  case when t.status = 'Completed' then 'Completed'
       when t.due_date is null then 'On Track'
       when t.due_date < current_date then 'Overdue'
       when t.due_date - current_date <= 3 then 'Urgent'
       else 'On Track' end as health
from public.tasks t
join public.projects_dev p on p.id = t.project_id;

create view public.projects_dev_v with (security_invoker = true) as
with agg as (
  select
    project_id,
    count(*)                                                  as total_tasks,
    count(*) filter (where status = 'Completed')              as completed_tasks,
    count(*) filter (where status <> 'Completed' and due_date < current_date) as overdue_tasks
  from public.tasks
  group by project_id
)
select
  p.*,
  coalesce(a.total_tasks, 0)                                  as total_tasks,
  coalesce(a.completed_tasks, 0)                              as completed_tasks,
  coalesce(a.total_tasks, 0) - coalesce(a.completed_tasks, 0) as remaining_tasks,
  coalesce(a.overdue_tasks, 0)                                as overdue_tasks,
  case when coalesce(a.total_tasks, 0) = 0
       then case when p.status = 'Completed' then 100 else 0 end
       else round(a.completed_tasks::numeric * 100 / a.total_tasks, 1) end as completion_pct,
  case when p.status in ('Completed', 'Cancelled') or p.target_date is null then null
       else p.target_date - current_date end                   as days_to_deadline,
  (p.status not in ('Completed', 'Cancelled') and p.target_date < current_date) as is_delayed,
  case when p.status = 'Completed' then 'Green'
       when p.status = 'Cancelled' then 'Gray'
       when p.target_date < current_date then 'Red'
       when p.target_date - current_date <= 7 then 'Yellow'
       when coalesce(a.overdue_tasks, 0) > 0 or p.risk_level = 'Critical' then 'Yellow'
       else 'Green' end                                        as health
from public.projects_dev p
left join agg a on a.project_id = p.id;

create view public.invoices_v with (security_invoker = true) as
select
  i.*,
  c.company_name as client_name,
  p.name         as project_name,
  case when i.status = 'Cancelled' then 'Cancelled'
       when i.status = 'Draft' then 'Draft'
       when i.paid >= i.amount and i.amount > 0 then 'Paid'
       when i.due_date < current_date then 'Overdue'
       when i.paid > 0 then 'Partially Paid'
       else 'Unpaid' end as payment_status,
  case when i.status = 'Sent' and i.paid < i.amount and i.due_date < current_date
       then current_date - i.due_date else 0 end as days_overdue
from public.invoices i
left join public.clients c on c.id = i.client_id
left join public.projects_dev p on p.id = i.project_id;

create view public.assets_v with (security_invoker = true) as
select
  a.*,
  e.name as assigned_name,
  (select max(l.assigned_at) from public.asset_assignments l
    where l.asset_id = a.id and l.returned_at is null) as assigned_since,
  case when a.warranty_until is null then 'No Warranty'
       when a.warranty_until < current_date then 'Expired'
       when a.warranty_until - current_date <= 60 then 'Expiring Soon'
       else 'Active' end as warranty_status
from public.assets a
left join public.employees e on e.id = a.assigned_to;

create view public.employees_v with (security_invoker = true) as
with w as (
  select
    e.id as employee_id,
    count(tk.id)                                                       as assigned_tasks,
    count(tk.id) filter (where tk.status = 'Completed')                 as completed_tasks,
    coalesce(sum(tk.estimated_hours) filter (where tk.status <> 'Completed'), 0) as assigned_hours,
    array_remove(array_agg(distinct p.name) filter (where tk.status <> 'Completed'), null) as current_projects
  from public.employees e
  left join public.tasks tk on e.id = any (tk.assigned_to)
  left join public.projects_dev p on p.id = tk.project_id
  group by e.id
)
select
  e.*,
  w.assigned_tasks,
  w.completed_tasks,
  w.assigned_tasks - w.completed_tasks as pending_tasks,
  w.assigned_hours,
  coalesce(w.current_projects, '{}') as current_projects,
  round(e.available_hours * e.availability_pct / 100.0, 1) as capacity_hours,
  case when e.available_hours * e.availability_pct = 0 then 0
       else round(w.assigned_hours * 100 / (e.available_hours * e.availability_pct / 100.0), 0) end as workload_pct,
  case when e.available_hours * e.availability_pct = 0 then 'Overloaded'
       when w.assigned_hours * 100 / (e.available_hours * e.availability_pct / 100.0) < 60 then 'Underutilized'
       when w.assigned_hours * 100 / (e.available_hours * e.availability_pct / 100.0) <= 100 then 'Balanced'
       else 'Overloaded' end as workload_status
from public.employees e
join w on w.employee_id = e.id;

-- Lightweight, non-sensitive team info for every signed-in user
-- (used for names in dropdowns and the dashboard workload chart).
create or replace function public.get_team_workload()
returns table (
  id text, name text, role_title text, department text,
  assigned_tasks bigint, completed_tasks bigint, pending_tasks bigint,
  workload_pct numeric, workload_status text
)
language sql stable security definer set search_path = public as $$
  select id, name, role_title, department, assigned_tasks, completed_tasks, pending_tasks, workload_pct, workload_status
  from public.employees_v
  where auth.uid() is not null
  order by name;
$$;

revoke execute on function public.get_team_workload() from public, anon;
grant execute on function public.get_team_workload() to authenticated;

create or replace function public.get_client_directory()
returns table (id text, company_name text)
language sql stable security definer set search_path = public as $$
  select id, company_name from public.clients where auth.uid() is not null order by company_name;
$$;

revoke execute on function public.get_client_directory() from public, anon;
grant execute on function public.get_client_directory() to authenticated;

-- =====================================================================
-- Row Level Security
--   Employee: read-only Dashboard, Dev projects, DM projects, Tasks
--   Admin:    full access to everything
-- =====================================================================
alter table public.profiles          enable row level security;
alter table public.employees         enable row level security;
alter table public.clients           enable row level security;
alter table public.projects_dev      enable row level security;
alter table public.projects_dm       enable row level security;
alter table public.tasks             enable row level security;
alter table public.meetings          enable row level security;
alter table public.invoices          enable row level security;
alter table public.expenses          enable row level security;
alter table public.risks             enable row level security;
alter table public.assets            enable row level security;
alter table public.asset_assignments enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: admin update" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "profiles: admin delete" on public.profiles
  for delete to authenticated using (public.is_admin());

-- Tables everyone signed in can read; only admins write.
do $$
declare t text;
begin
  foreach t in array array['projects_dev', 'projects_dm', 'tasks']
  loop
    execute format('create policy "%s: read" on public.%I for select to authenticated using (true)', t, t);
    execute format('create policy "%s: admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;

  foreach t in array array['employees', 'clients', 'meetings', 'invoices', 'expenses', 'risks', 'assets', 'asset_assignments']
  loop
    execute format('create policy "%s: admin only" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- Realtime: push changes to the dashboard as they happen (Supabase only).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.tasks, public.projects_dev, public.projects_dm;
  end if;
end $$;
