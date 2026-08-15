-- Add kitchen item categories for Chef UI grouping
alter table public.items
  add column if not exists category text;

update public.items set category = 'other' where category is null;

alter table public.items
  alter column category set default 'other';

alter table public.items
  alter column category set not null;

alter table public.items drop constraint if exists items_category_check;
alter table public.items
  add constraint items_category_check
  check (category in (
    'vegetables', 'meat', 'seafood', 'dairy_eggs', 'fats_oils',
    'grains', 'herbs_spices', 'other'
  ));

-- Best-effort backfill for existing demo / known names
update public.items set category = 'meat'
  where lower(name) ~ '(chicken|beef|pork|lamb|turkey|duck|bacon|sausage|mince|steak|veal|meat)';

update public.items set category = 'vegetables'
  where lower(name) ~ '(tomato|onion|garlic|lettuce|spinach|carrot|pepper|potato|cucumber|broccoli|celery|cabbage|leek|mushroom|veg)';

update public.items set category = 'seafood'
  where lower(name) ~ '(fish|salmon|tuna|shrimp|prawn|cod|seafood|mussel|clam|crab)';

update public.items set category = 'fats_oils'
  where lower(name) ~ '(oil|olive|butter|ghee|lard|vinegar|mayo|margarine)';

update public.items set category = 'dairy_eggs'
  where lower(name) ~ '(milk|cream|cheese|yogurt|yoghurt|egg)'
    and category = 'other';

update public.items set category = 'grains'
  where lower(name) ~ '(rice|pasta|flour|grain|noodle|couscous|quinoa|bean|lentil|chickpea|bread)';

update public.items set category = 'herbs_spices'
  where lower(name) ~ '(basil|parsley|cilantro|coriander|thyme|rosemary|oregano|cumin|paprika|spice|herb|salt|chili|chilli)';
