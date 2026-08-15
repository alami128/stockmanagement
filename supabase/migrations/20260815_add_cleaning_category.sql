-- Allow cleaning category (and keep existing ones)
alter table public.items drop constraint if exists items_category_check;
alter table public.items
  add constraint items_category_check
  check (category in (
    'vegetables', 'meat', 'seafood', 'dairy_eggs', 'fats_oils',
    'grains', 'herbs_spices', 'cleaning', 'other'
  ));
