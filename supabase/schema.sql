-- Kitchen Ordering App - database schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'chef' check (role in ('chef', 'senior_chef', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity numeric not null default 0 check (quantity >= 0),
  unit text not null default 'pcs' check (unit in ('pcs', 'bottle', 'bags', 'packets', 'boxes', 'kg', 'g', 'L', 'ml')),
  category text not null default 'other' check (category in (
    'vegetables', 'meat', 'seafood', 'dairy_eggs', 'bread_bakery',
    'sauces', 'dry_goods', 'desserts', 'beverages',
    'fats_oils', 'grains', 'herbs_spices', 'cleaning', 'other'
  )),
  low_stock_threshold numeric not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null
);

create sequence if not exists public.order_number_seq start 1;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('ORD-' || lpad(nextval('public.order_number_seq')::text, 4, '0')),
  status text not null default 'draft' check (status in ('draft', 'ordered', 'completed')),
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete restrict,
  quantity numeric not null check (quantity > 0),
  notes text
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

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

-- ============================================================
-- NEW USER TRIGGER
-- Automatically creates a public.users row whenever someone is
-- added to auth.users (e.g. via the admin "Create user" form).
-- Name and role are read from the auth user's metadata.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'chef')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ROLE HELPER
-- ============================================================

create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.prep_items enable row level security;
alter table public.prep_selections enable row level security;
alter table public.kitchen_equipment enable row level security;
alter table public.kitchen_status_tasks enable row level security;

-- users: everyone can read their own row; admins can read everyone
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users
  for select using (auth.uid() = id or public.current_role() = 'admin');

drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin" on public.users
  for update using (auth.uid() = id or public.current_role() = 'admin');

-- items: any signed-in user can view; chefs and admins can update
-- availability and add items; only admins can rename/remove items.
drop policy if exists "items_select" on public.items;
create policy "items_select" on public.items
  for select using (auth.role() = 'authenticated');

drop policy if exists "items_insert" on public.items;
create policy "items_insert" on public.items
  for insert with check (public.current_role() in ('chef', 'admin'));

drop policy if exists "items_update" on public.items;
create policy "items_update" on public.items
  for update using (public.current_role() in ('chef', 'admin'));

drop policy if exists "items_delete" on public.items;
create policy "items_delete" on public.items
  for delete using (public.current_role() = 'admin');

-- orders: senior chefs and admins can view/create/update
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
  for select using (public.current_role() in ('chef', 'senior_chef', 'admin'));

drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders
  for insert with check (public.current_role() in ('senior_chef', 'admin'));

drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders
  for update using (public.current_role() in ('senior_chef', 'admin'));

-- order_items: same access as orders
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (public.current_role() in ('chef', 'senior_chef', 'admin'));

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (public.current_role() in ('senior_chef', 'admin'));

drop policy if exists "order_items_update" on public.order_items;
create policy "order_items_update" on public.order_items
  for update using (public.current_role() in ('senior_chef', 'admin'));

-- prep_items: menu of items chefs can mark for daily prep
drop policy if exists "prep_items_select" on public.prep_items;
create policy "prep_items_select" on public.prep_items
  for select using (auth.role() = 'authenticated');

drop policy if exists "prep_items_manage" on public.prep_items;
create policy "prep_items_manage" on public.prep_items
  for all using (public.current_role() = 'admin');

-- prep_selections: chefs mark preps; head chef reads
drop policy if exists "prep_selections_select" on public.prep_selections;
create policy "prep_selections_select" on public.prep_selections
  for select using (public.current_role() in ('chef', 'senior_chef', 'admin'));

drop policy if exists "prep_selections_insert" on public.prep_selections;
create policy "prep_selections_insert" on public.prep_selections
  for insert with check (public.current_role() in ('chef', 'admin'));

drop policy if exists "prep_selections_delete" on public.prep_selections;
create policy "prep_selections_delete" on public.prep_selections
  for delete using (public.current_role() in ('chef', 'admin'));

drop policy if exists "prep_selections_update" on public.prep_selections;
create policy "prep_selections_update" on public.prep_selections
  for update using (public.current_role() in ('chef', 'admin'));

-- kitchen_equipment: catalog of kitchen equipment
drop policy if exists "kitchen_equipment_select" on public.kitchen_equipment;
create policy "kitchen_equipment_select" on public.kitchen_equipment
  for select using (auth.role() = 'authenticated');

drop policy if exists "kitchen_equipment_manage" on public.kitchen_equipment;
create policy "kitchen_equipment_manage" on public.kitchen_equipment
  for all using (public.current_role() = 'admin');

-- kitchen_status_tasks: chefs log clean/fix; head chef reads
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
