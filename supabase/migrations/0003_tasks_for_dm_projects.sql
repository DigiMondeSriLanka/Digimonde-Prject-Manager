-- Tasks can belong to a Dev project (PRJ-…) or a DM project (DM-…).
-- The app always sends the chosen ID in tasks.project_id; a trigger moves DM IDs into
-- tasks.dm_project_id so both columns keep real foreign keys (and cascade deletes).

alter table public.tasks
  add column if not exists dm_project_id text references public.projects_dm(id) on delete cascade;

alter table public.tasks alter column project_id drop not null;

alter table public.tasks drop constraint if exists tasks_one_project_check;
alter table public.tasks
  add constraint tasks_one_project_check check (num_nonnulls(project_id, dm_project_id) = 1);

create index if not exists tasks_dm_project_idx on public.tasks (dm_project_id);

create or replace function public.tasks_route_project() returns trigger
language plpgsql as $$
begin
  if new.project_id like 'DM-%' then
    new.dm_project_id := new.project_id;
    new.project_id := null;
  elsif new.project_id is not null then
    new.dm_project_id := null;
  end if;
  return new;
end $$;

drop trigger if exists tasks_route_project on public.tasks;
create trigger tasks_route_project before insert or update on public.tasks
  for each row execute function public.tasks_route_project();

-- Task view: project_id shows whichever project the task belongs to.
drop view if exists public.tasks_v;
create view public.tasks_v with (security_invoker = true) as
select
  t.id,
  coalesce(t.project_id, t.dm_project_id) as project_id,
  t.name,
  t.description,
  t.category,
  t.assigned_to,
  t.owner_id,
  t.priority,
  t.status,
  t.start_date,
  t.due_date,
  t.completion_date,
  t.estimated_hours,
  t.risk,
  t.comments,
  t.created_at,
  t.updated_at,
  case when t.dm_project_id is not null then 'DM' else 'Dev' end as project_type,
  coalesce(p.name, d.name)                                       as project_name,
  case when t.dm_project_id is not null then 'DM' else p.department end as department,
  case when t.status = 'Completed' or t.due_date is null then null
       else t.due_date - current_date end as days_remaining,
  case when t.status = 'Completed' then 'Completed'
       when t.due_date is null then 'On Track'
       when t.due_date < current_date then 'Overdue'
       when t.due_date - current_date <= 3 then 'Urgent'
       else 'On Track' end as health
from public.tasks t
left join public.projects_dev p on p.id = t.project_id
left join public.projects_dm d on d.id = t.dm_project_id;

-- DM projects with their task progress.
create or replace view public.projects_dm_v with (security_invoker = true) as
with agg as (
  select
    dm_project_id,
    count(*)                                                                   as total_tasks,
    count(*) filter (where status = 'Completed')                               as completed_tasks,
    count(*) filter (where status <> 'Completed' and due_date < current_date)  as overdue_tasks
  from public.tasks
  where dm_project_id is not null
  group by dm_project_id
)
select
  d.*,
  coalesce(a.total_tasks, 0)                                  as total_tasks,
  coalesce(a.completed_tasks, 0)                              as completed_tasks,
  coalesce(a.total_tasks, 0) - coalesce(a.completed_tasks, 0) as open_tasks,
  coalesce(a.overdue_tasks, 0)                                as overdue_tasks
from public.projects_dm d
left join agg a on a.dm_project_id = d.id;

-- Team workload: "current projects" now includes DM projects (same columns as before).
create or replace view public.employees_v with (security_invoker = true) as
with w as (
  select
    e.id as employee_id,
    count(tk.id)                                                       as assigned_tasks,
    count(tk.id) filter (where tk.status = 'Completed')                 as completed_tasks,
    coalesce(sum(tk.estimated_hours) filter (where tk.status <> 'Completed'), 0) as assigned_hours,
    array_remove(array_agg(distinct coalesce(p.name, d.name)) filter (where tk.status <> 'Completed'), null) as current_projects
  from public.employees e
  left join public.tasks tk on e.id = any (tk.assigned_to)
  left join public.projects_dev p on p.id = tk.project_id
  left join public.projects_dm d on d.id = tk.dm_project_id
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

-- Views were recreated: make sure signed-in users can read them (RLS on the base tables still applies).
grant select on public.tasks_v, public.projects_dm_v, public.employees_v to authenticated;
