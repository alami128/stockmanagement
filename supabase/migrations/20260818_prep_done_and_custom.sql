-- Preps: custom entries, display names, and done status
alter table public.prep_selections
  add column if not exists name text,
  add column if not exists section text not null default 'Menu',
  add column if not exists done boolean not null default false,
  add column if not exists done_at timestamptz;

update public.prep_selections ps
set
  name = pi.name,
  section = pi.section
from public.prep_items pi
where ps.prep_item_id = pi.id
  and ps.name is null;

alter table public.prep_selections
  alter column prep_item_id drop not null;

alter table public.prep_selections
  drop constraint if exists prep_selections_prep_item_id_prep_date_key;

create unique index if not exists prep_selections_menu_item_date_idx
  on public.prep_selections (prep_item_id, prep_date)
  where prep_item_id is not null;

-- Chefs can mark preps done
drop policy if exists "prep_selections_update" on public.prep_selections;
create policy "prep_selections_update" on public.prep_selections
  for update using (public.current_role() in ('chef', 'admin'));
