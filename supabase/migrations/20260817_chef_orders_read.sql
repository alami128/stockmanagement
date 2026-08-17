-- Let chefs view orders and order lines (read-only in the app UI)
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
  for select using (public.current_role() in ('chef', 'senior_chef', 'admin'));

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (public.current_role() in ('chef', 'senior_chef', 'admin'));
