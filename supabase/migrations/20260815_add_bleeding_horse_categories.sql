-- Allow Bleeding Horse stock-list categories
alter table public.items drop constraint if exists items_category_check;
alter table public.items
  add constraint items_category_check
  check (category in (
    'vegetables', 'meat', 'seafood', 'dairy_eggs', 'bread_bakery',
    'sauces', 'dry_goods', 'desserts', 'beverages',
    'fats_oils', 'grains', 'herbs_spices', 'cleaning', 'other'
  ));
