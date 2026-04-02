
-- 1. Add source reference column
ALTER TABLE public.pricing_config ADD COLUMN menu_item_id uuid;

-- 2. Trigger function for menu_items
CREATE OR REPLACE FUNCTION public.sync_pricing_from_menu_items()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  pricing_cat text;
  display_cat text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    pricing_cat := CASE NEW.section_id
      WHEN 'reception' THEN 'reception-items'
      ELSE NEW.section_id
    END;
    display_cat := CASE WHEN NEW.section_id = 'reception' THEN NEW.group_label ELSE NEW.group_label END;

    INSERT INTO public.pricing_config (category, item_key, item_label, price, is_active, sort_order, display_category, menu_item_id)
    VALUES (pricing_cat, 'mi-' || NEW.id, NEW.name, 0, false, NEW.sort_order, display_cat, NEW.id);

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.pricing_config WHERE menu_item_id = OLD.id;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.pricing_config
    SET item_label = NEW.name,
        display_category = CASE WHEN NEW.section_id = 'reception' THEN NEW.group_label ELSE NEW.group_label END,
        category = CASE NEW.section_id WHEN 'reception' THEN 'reception-items' ELSE NEW.section_id END
    WHERE menu_item_id = NEW.id;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_pricing_on_menu_item_insert
AFTER INSERT ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_items();

CREATE TRIGGER sync_pricing_on_menu_item_delete
AFTER DELETE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_items();

CREATE TRIGGER sync_pricing_on_menu_item_update
AFTER UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_items();

-- 3. Trigger function for menu_packages
CREATE OR REPLACE FUNCTION public.sync_pricing_from_menu_packages()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.pricing_config (category, item_key, item_label, price, is_active, sort_order, menu_item_id)
    VALUES (NEW.section_id, 'mp-' || NEW.id, NEW.title, 0, false, NEW.sort_order, NEW.id);
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.pricing_config WHERE menu_item_id = OLD.id;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.pricing_config
    SET item_label = NEW.title,
        category = NEW.section_id
    WHERE menu_item_id = NEW.id;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_pricing_on_menu_package_insert
AFTER INSERT ON public.menu_packages
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_packages();

CREATE TRIGGER sync_pricing_on_menu_package_delete
AFTER DELETE ON public.menu_packages
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_packages();

CREATE TRIGGER sync_pricing_on_menu_package_update
AFTER UPDATE ON public.menu_packages
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_packages();

-- 4. Trigger function for menu_accordions
CREATE OR REPLACE FUNCTION public.sync_pricing_from_menu_accordions()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.pricing_config (category, item_key, item_label, price, is_active, sort_order, menu_item_id)
    VALUES (NEW.section_id, 'ma-' || NEW.id, NEW.title, 0, false, NEW.sort_order, NEW.id);
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.pricing_config WHERE menu_item_id = OLD.id;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.pricing_config
    SET item_label = NEW.title,
        category = NEW.section_id
    WHERE menu_item_id = NEW.id;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_pricing_on_menu_accordion_insert
AFTER INSERT ON public.menu_accordions
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_accordions();

CREATE TRIGGER sync_pricing_on_menu_accordion_delete
AFTER DELETE ON public.menu_accordions
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_accordions();

CREATE TRIGGER sync_pricing_on_menu_accordion_update
AFTER UPDATE ON public.menu_accordions
FOR EACH ROW EXECUTE FUNCTION public.sync_pricing_from_menu_accordions();

-- 5. Reconciliation: Link existing pricing_config to menu_items by name
UPDATE public.pricing_config pc
SET menu_item_id = mi.id
FROM public.menu_items mi
WHERE pc.item_label = mi.name
AND pc.menu_item_id IS NULL;

-- 6. Reconciliation: Link existing pricing_config to menu_packages by title
UPDATE public.pricing_config pc
SET menu_item_id = mp.id
FROM public.menu_packages mp
WHERE pc.item_label = mp.title
AND pc.menu_item_id IS NULL;

-- 7. Reconciliation: Link existing pricing_config to menu_accordions by title
UPDATE public.pricing_config pc
SET menu_item_id = ma.id
FROM public.menu_accordions ma
WHERE pc.item_label = ma.title
AND pc.menu_item_id IS NULL;

-- 8. Insert missing menu_items into pricing_config
INSERT INTO public.pricing_config (category, item_key, item_label, price, is_active, sort_order, display_category, menu_item_id)
SELECT
  CASE mi.section_id WHEN 'reception' THEN 'reception-items' ELSE mi.section_id END,
  'mi-' || mi.id,
  mi.name,
  0,
  false,
  mi.sort_order,
  mi.group_label,
  mi.id
FROM public.menu_items mi
WHERE NOT EXISTS (
  SELECT 1 FROM public.pricing_config pc WHERE pc.menu_item_id = mi.id
);

-- 9. Insert missing menu_packages into pricing_config
INSERT INTO public.pricing_config (category, item_key, item_label, price, is_active, sort_order, menu_item_id)
SELECT
  mp.section_id,
  'mp-' || mp.id,
  mp.title,
  0,
  false,
  mp.sort_order,
  mp.id
FROM public.menu_packages mp
WHERE NOT EXISTS (
  SELECT 1 FROM public.pricing_config pc WHERE pc.menu_item_id = mp.id
);

-- 10. Insert missing menu_accordions into pricing_config
INSERT INTO public.pricing_config (category, item_key, item_label, price, is_active, sort_order, menu_item_id)
SELECT
  ma.section_id,
  'ma-' || ma.id,
  ma.title,
  0,
  false,
  ma.sort_order,
  ma.id
FROM public.menu_accordions ma
WHERE NOT EXISTS (
  SELECT 1 FROM public.pricing_config pc WHERE pc.menu_item_id = ma.id
);
