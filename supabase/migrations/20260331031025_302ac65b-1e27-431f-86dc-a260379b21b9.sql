ALTER TABLE public.menu_packages ADD COLUMN IF NOT EXISTS season text[] DEFAULT '{}'::text[];
ALTER TABLE public.menu_packages ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.menu_packages ADD COLUMN IF NOT EXISTS dietary_tags text[] DEFAULT '{}'::text[];