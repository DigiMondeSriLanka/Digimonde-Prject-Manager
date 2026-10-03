-- DM projects use a simple Active / Inactive status (separate from Dev project statuses).
-- Safe to run on a database created with the original 0001 schema; harmless on a fresh one.

alter table public.projects_dm drop constraint if exists projects_dm_status_check;

update public.projects_dm
   set status = case when status in ('Completed', 'Cancelled', 'On Hold', 'Inactive') then 'Inactive' else 'Active' end;

alter table public.projects_dm
  alter column status set default 'Active',
  add constraint projects_dm_status_check check (status in ('Active', 'Inactive'));
