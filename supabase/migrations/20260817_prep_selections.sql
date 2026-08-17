-- Daily prep menu: items chefs can mark for preparation
create table if not exists public.prep_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section text not null default 'Menu',
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists public.prep_selections (
  id uuid primary key default gen_random_uuid(),
  prep_item_id uuid not null references public.prep_items(id) on delete cascade,
  prep_date date not null default current_date,
  selected_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (prep_item_id, prep_date)
);

create index if not exists prep_selections_date_idx
  on public.prep_selections (prep_date desc);

alter table public.prep_items enable row level security;
alter table public.prep_selections enable row level security;

drop policy if exists "prep_items_select" on public.prep_items;
create policy "prep_items_select" on public.prep_items
  for select using (auth.role() = 'authenticated');

drop policy if exists "prep_items_manage" on public.prep_items;
create policy "prep_items_manage" on public.prep_items
  for all using (public.current_role() = 'admin');

drop policy if exists "prep_selections_select" on public.prep_selections;
create policy "prep_selections_select" on public.prep_selections
  for select using (public.current_role() in ('chef', 'senior_chef', 'admin'));

drop policy if exists "prep_selections_insert" on public.prep_selections;
create policy "prep_selections_insert" on public.prep_selections
  for insert with check (public.current_role() in ('chef', 'admin'));

drop policy if exists "prep_selections_delete" on public.prep_selections;
create policy "prep_selections_delete" on public.prep_selections
  for delete using (public.current_role() in ('chef', 'admin'));
