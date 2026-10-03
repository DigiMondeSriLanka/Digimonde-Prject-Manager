-- Employees can add new tasks and edit any task (including existing ones).
-- Deleting tasks stays admin-only (covered by the existing "tasks: admin write" policy).

drop policy if exists "tasks: employee insert" on public.tasks;
create policy "tasks: employee insert" on public.tasks
  for insert to authenticated with check (true);

drop policy if exists "tasks: employee update" on public.tasks;
create policy "tasks: employee update" on public.tasks
  for update to authenticated using (true) with check (true);
