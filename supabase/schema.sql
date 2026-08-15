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
  unit text not null default 'pcs' check (unit in ('pcs', 'kg', 'g', 'L', 'ml')),
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

-- users: everyone can read their own row; admins can read everyone
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users
  for select using (auth.uid() = id or public.current_role() = 'admin');

drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin" on public.users
  for update using (auth.uid() = id or public.current_role() = 'admin');

-- items: any signed-in user can view; chefs and admins can update
-- availability; only admins can add/rename/remove items.
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
  for select using (public.current_role() in ('senior_chef', 'admin'));

drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders
  for insert with check (public.current_role() in ('senior_chef', 'admin'));

drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders
  for update using (public.current_role() in ('senior_chef', 'admin'));

-- order_items: same access as orders
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (public.current_role() in ('senior_chef', 'admin'));

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert" on public.order_items
  for insert with check (public.current_role() in ('senior_chef', 'admin'));

drop policy if exists "order_items_update" on public.order_items;
create policy "order_items_update" on public.order_items
  for update using (public.current_role() in ('senior_chef', 'admin'));
