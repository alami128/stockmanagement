-- Fix items RLS so chefs/admins can insert, and current_role() is reliable.
-- Run in Supabase SQL Editor if you still want user-scoped inserts to work
-- without the service-role path.

create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

revoke all on function public.current_role() from public;
grant execute on function public.current_role() to authenticated;
grant execute on function public.current_role() to service_role;

drop policy if exists "items_insert" on public.items;
create policy "items_insert" on public.items
  for insert with check (public.current_role() in ('chef', 'admin'));

drop policy if exists "items_update" on public.items;
create policy "items_update" on public.items
  for update using (public.current_role() in ('chef', 'admin'));

drop policy if exists "items_delete" on public.items;
create policy "items_delete" on public.items
  for delete using (public.current_role() = 'admin');
