-- Subscription services (e.g. ChatGPT Team, Figma, Google Workspace) as company assets.
-- A subscription can be assigned to several people; physical assets keep a single holder.
-- Every person added / removed is recorded in asset_assignments, like a handover.

-- 1. Category + subscription fields
alter table public.assets drop constraint if exists assets_category_check;
alter table public.assets add constraint assets_category_check
  check (category in ('Laptop', 'Desktop', 'Monitor', 'Mobile Device', 'Camera', 'Audio', 'Networking', 'Furniture', 'Software License', 'Subscription', 'Other'));

alter table public.assets
  add column if not exists assignees     text[] not null default '{}',   -- employee IDs (subscriptions)
  add column if not exists seats         int check (seats is null or seats >= 0),
  add column if not exists billing_cycle text check (billing_cycle in ('Monthly', 'Quarterly', 'Annual', 'One-time')),
  add column if not exists renewal_date  date;

create index if not exists assets_assignees_idx on public.assets using gin (assignees);

-- 2. Keep the right holder field per type, and keep status in sync.
create or replace function public.assets_sync_status() returns trigger
language plpgsql as $$
declare has_holder boolean;
begin
  if new.category = 'Subscription' then
    if new.assigned_to is not null and not (new.assigned_to = any (new.assignees)) then
      new.assignees := array_append(new.assignees, new.assigned_to);
    end if;
    new.assigned_to := null;
  else
    if new.assigned_to is null and cardinality(new.assignees) = 1 then
      new.assigned_to := new.assignees[1];
    end if;
    new.assignees := '{}';
  end if;

  -- de-duplicate assignees
  new.assignees := coalesce((select array_agg(distinct x) from unnest(new.assignees) x where x is not null), '{}');

  has_holder := new.assigned_to is not null or cardinality(new.assignees) > 0;
  if has_holder and new.status = 'Available' then
    new.status := 'Assigned';
  elsif not has_holder and new.status = 'Assigned' then
    new.status := 'Available';
  end if;
  return new;
end $$;

-- 3. Log per person: close the log for removed people, open one for added people.
create or replace function public.assets_log_assignment() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  old_set text[] := '{}';
  new_set text[];
  emp text;
begin
  new_set := array_remove(array_append(new.assignees, new.assigned_to), null);
  if tg_op = 'UPDATE' then
    old_set := array_remove(array_append(old.assignees, old.assigned_to), null);
  end if;

  foreach emp in array old_set loop
    if not (emp = any (new_set)) then
      update asset_assignments
         set returned_at = now(), condition_returned = new.condition
       where asset_id = new.id and employee_id = emp and returned_at is null;
    end if;
  end loop;

  foreach emp in array new_set loop
    if not (emp = any (old_set)) then
      insert into asset_assignments (asset_id, employee_id, condition_assigned)
      values (new.id, emp, new.condition);
    end if;
  end loop;
  return null;
end $$;

-- 4. Asset view: one "holders" list for both types, seats used and renewal status.
drop view if exists public.assets_v;
create view public.assets_v with (security_invoker = true) as
select
  a.*,
  case when a.category = 'Subscription' then a.assignees
       else array_remove(array[a.assigned_to], null) end as holders,
  case when a.category = 'Subscription' then cardinality(a.assignees) end as seats_used,
  case when a.category = 'Subscription' then a.renewal_date else a.warranty_until end as expiry_date,
  e.name as assigned_name,
  (select max(l.assigned_at) from public.asset_assignments l
    where l.asset_id = a.id and l.returned_at is null) as assigned_since,
  case when a.category = 'Subscription' then
         case when a.renewal_date is null then 'No Renewal Date'
              when a.renewal_date < current_date then 'Expired'
              when a.renewal_date - current_date <= 14 then 'Renewing Soon'
              else 'Active' end
       when a.warranty_until is null then 'No Warranty'
       when a.warranty_until < current_date then 'Expired'
       when a.warranty_until - current_date <= 60 then 'Expiring Soon'
       else 'Active' end as warranty_status
from public.assets a
left join public.employees e on e.id = a.assigned_to;

grant select on public.assets_v to authenticated;
