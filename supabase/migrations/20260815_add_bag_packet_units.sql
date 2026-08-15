-- Allow bags and packets stock units
alter table public.items drop constraint if exists items_unit_check;
alter table public.items
  add constraint items_unit_check
  check (unit in ('pcs', 'bottle', 'bags', 'packets', 'kg', 'g', 'L', 'ml'));
