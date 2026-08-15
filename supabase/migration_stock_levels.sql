-- Migration: switch items from a boolean "available" flag to quantity
-- tracking with a low-stock threshold. Run this once in the Supabase SQL
-- editor if your project was already deployed with the old schema.
--
-- Safe to run even if some of these columns already exist.

alter table public.items
  add column if not exists quantity numeric not null default 0,
  add column if not exists unit text not null default 'pcs',
  add column if not exists low_stock_threshold numeric not null default 5;

alter table public.items
  add constraint items_quantity_check check (quantity >= 0);

alter table public.items
  add constraint items_unit_check check (unit in ('pcs', 'kg', 'g', 'L', 'ml'));

alter table public.items
  add constraint items_low_stock_threshold_check check (low_stock_threshold >= 0);

-- Carry over old data: anything previously marked "Not Available" starts
-- at 0 on-hand; anything "Available" starts above its reorder point so it
-- doesn't immediately show up as needing an order.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'items' and column_name = 'available'
  ) then
    update public.items set quantity = case when available then 10 else 0 end;
    alter table public.items drop column available;
  end if;
end $$;
