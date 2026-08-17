-- Chef-flagged items for daily ordering (in addition to auto low/out stock alerts)
create table if not exists public.order_needs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  need_date date not null default current_date,
  flagged_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists order_needs_item_date_idx
  on public.order_needs (item_id, need_date);

create index if not exists order_needs_date_idx
  on public.order_needs (need_date desc);

alter table public.order_needs enable row level security;

drop policy if exists "order_needs_select" on public.order_needs;
create policy "order_needs_select" on public.order_needs
  for select using (public.current_role() in ('chef', 'senior_chef', 'admin'));

drop policy if exists "order_needs_insert" on public.order_needs;
create policy "order_needs_insert" on public.order_needs
  for insert with check (public.current_role() in ('chef', 'admin'));

drop policy if exists "order_needs_delete" on public.order_needs;
create policy "order_needs_delete" on public.order_needs
  for delete using (public.current_role() in ('chef', 'admin'));
