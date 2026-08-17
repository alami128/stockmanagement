-- Run this once in Supabase → SQL Editor if preps / kitchen status fail with
-- "Could not find the table 'public.prep_selections'" (or similar).

-- ============================================================
-- PREP TABLES
-- ============================================================

create table if not exists public.prep_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section text not null default 'Menu',
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists public.prep_selections (
  id uuid primary key default gen_random_uuid(),
  prep_item_id uuid references public.prep_items(id) on delete cascade,
  prep_date date not null default current_date,
  name text not null,
  section text not null default 'Menu',
  done boolean not null default false,
  done_at timestamptz,
  selected_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists prep_selections_menu_item_date_idx
  on public.prep_selections (prep_item_id, prep_date)
  where prep_item_id is not null;

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

drop policy if exists "prep_selections_update" on public.prep_selections;
create policy "prep_selections_update" on public.prep_selections
  for update using (public.current_role() in ('chef', 'admin'));

drop policy if exists "prep_selections_delete" on public.prep_selections;
create policy "prep_selections_delete" on public.prep_selections
  for delete using (public.current_role() in ('chef', 'admin'));

-- ============================================================
-- KITCHEN STATUS TABLES
-- ============================================================

create table if not exists public.kitchen_equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null default 'Kitchen',
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists public.kitchen_status_tasks (
  id uuid primary key default gen_random_uuid(),
  task_date date not null default current_date,
  task_type text not null check (task_type in ('clean', 'fix')),
  name text not null,
  equipment_id uuid references public.kitchen_equipment(id) on delete set null,
  done boolean not null default false,
  done_at timestamptz,
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists kitchen_status_tasks_equipment_date_type_idx
  on public.kitchen_status_tasks (equipment_id, task_date, task_type)
  where equipment_id is not null;

create index if not exists kitchen_status_tasks_date_idx
  on public.kitchen_status_tasks (task_date desc);

alter table public.kitchen_equipment enable row level security;
alter table public.kitchen_status_tasks enable row level security;

drop policy if exists "kitchen_equipment_select" on public.kitchen_equipment;
create policy "kitchen_equipment_select" on public.kitchen_equipment
  for select using (auth.role() = 'authenticated');

drop policy if exists "kitchen_equipment_manage" on public.kitchen_equipment;
create policy "kitchen_equipment_manage" on public.kitchen_equipment
  for all using (public.current_role() = 'admin');

drop policy if exists "kitchen_status_tasks_select" on public.kitchen_status_tasks;
create policy "kitchen_status_tasks_select" on public.kitchen_status_tasks
  for select using (public.current_role() in ('chef', 'senior_chef', 'admin'));

drop policy if exists "kitchen_status_tasks_insert" on public.kitchen_status_tasks;
create policy "kitchen_status_tasks_insert" on public.kitchen_status_tasks
  for insert with check (public.current_role() in ('chef', 'admin'));

drop policy if exists "kitchen_status_tasks_update" on public.kitchen_status_tasks;
create policy "kitchen_status_tasks_update" on public.kitchen_status_tasks
  for update using (public.current_role() in ('chef', 'admin'));

drop policy if exists "kitchen_status_tasks_delete" on public.kitchen_status_tasks;
create policy "kitchen_status_tasks_delete" on public.kitchen_status_tasks
  for delete using (public.current_role() in ('chef', 'admin'));
