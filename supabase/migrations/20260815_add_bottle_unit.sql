-- Allow bottle as a stock unit (for milk, oil, sauces, etc.)
alter table public.items drop constraint if exists items_unit_check;
alter table public.items
  add constraint items_unit_check
  check (unit in ('pcs', 'bottle', 'kg', 'g', 'L', 'ml'));
