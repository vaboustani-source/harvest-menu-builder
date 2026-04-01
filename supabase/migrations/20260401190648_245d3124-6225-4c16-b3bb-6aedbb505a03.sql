
-- Create pricing_config table
CREATE TABLE public.pricing_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  item_key TEXT NOT NULL UNIQUE,
  item_label TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  included_count INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view pricing config"
  ON public.pricing_config FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert pricing"
  ON public.pricing_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pricing"
  ON public.pricing_config FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete pricing"
  ON public.pricing_config FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_pricing_config_updated_at
  BEFORE UPDATE ON public.pricing_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default pricing values

-- GLOBAL
INSERT INTO public.pricing_config (category, item_key, item_label, price, sort_order) VALUES
  ('global', 'base_reception_pp', 'Base Reception Package', 105, 0),
  ('global', 'extra_nonalc_pp', 'Extra Non-Alcoholic Selection', 2, 1),
  ('global', 'extra_spritzer_pp', 'Extra Wine Spritzer', 2, 2);

-- WELCOME HOUR
INSERT INTO public.pricing_config (category, item_key, item_label, price, sort_order) VALUES
  ('welcome', 'passed_service_upgrade', 'Passed Service Upgrade', 8, 0),
  ('welcome', 'champagne_upgrade', 'Champagne Welcome Station', 5, 1);

-- COCKTAIL HOUR
INSERT INTO public.pricing_config (category, item_key, item_label, price, included_count, sort_order) VALUES
  ('cocktail', 'cocktail_included_count', 'Included Selections', 0, 4, 0),
  ('cocktail', 'ch-ricotta-crostini', 'Whipped Ricotta Crostini with Estate Honey & Thyme', 6, NULL, 1),
  ('cocktail', 'ch-prosciutto-melon', 'Prosciutto-Wrapped Melon with Aged Balsamic', 7, NULL, 2),
  ('cocktail', 'ch-caprese-skewers', 'Caprese Skewers with House-Made Pesto', 6, NULL, 3),
  ('cocktail', 'ch-brie-fig', 'Brie & Fig Jam Phyllo Cup', 7, NULL, 4),
  ('cocktail', 'ch-salmon-blinis', 'Smoked Salmon Blinis with Crème Fraîche & Dill', 8, NULL, 5),
  ('cocktail', 'ch-beef-crostini', 'Beef Tenderloin Crostini with Horseradish Cream', 9, NULL, 6),
  ('cocktail', 'ch-shrimp-cocktail', 'Shrimp Cocktail with House Bloody Mary Sauce', 9, NULL, 7),
  ('cocktail', 'ch-crudite', 'Seasonal Crudité with Herb Dip', 10, NULL, 8),
  ('cocktail', 'ch-charcuterie', 'Charcuterie & Cheese Board', 18, NULL, 9);

-- RECEPTION DINNER
INSERT INTO public.pricing_config (category, item_key, item_label, price, included_count, sort_order) VALUES
  ('reception', 'salads_included', 'Included Salads', 0, 1, 0),
  ('reception', 'salads_extra_pp', 'Extra Salad Upcharge', 8, NULL, 1),
  ('reception', 'pastas_included', 'Included Pastas/Grains', 0, 1, 2),
  ('reception', 'pastas_extra_pp', 'Extra Pasta/Grain Upcharge', 12, NULL, 3),
  ('reception', 'proteins_included', 'Included Proteins', 0, 2, 4),
  ('reception', 'proteins_extra_pp', 'Extra Protein Upcharge', 22, NULL, 5),
  ('reception', 'sides_included', 'Included Vegetables/Starches', 0, 2, 6),
  ('reception', 'sides_extra_pp', 'Extra Side Upcharge', 8, NULL, 7);

-- RECEPTION — individual item premium upcharges (only items with price > 0)
INSERT INTO public.pricing_config (category, item_key, item_label, price, sort_order) VALUES
  ('reception-items', 'r-spinach-bacon', 'Baby Spinach Salad with Smoked Bacon', 2, 0),
  ('reception-items', 'r-beet-frisee', 'Roasted Beet Salad with Frisée', 2, 1),
  ('reception-items', 'r-pear-walnut', 'Mixed Field Greens with Pears & Walnuts', 2, 2),
  ('reception-items', 'r-peach-burrata', 'Grilled Peach & Burrata Salad', 3, 3),
  ('reception-items', 'r-chanterelle-beet', 'Organic Greens with Chanterelle & Beets', 3, 4),
  ('reception-items', 'r-arugula-parm', 'Arugula with Shaved Parmesan', 13, 5),
  ('reception-items', 'r-wedge', 'Wedge Salad', 14, 6),
  ('reception-items', 'r-beet-goat', 'Roasted Beet Salad with Goat Cheese', 14, 7),
  ('reception-items', 'r-wild-rice', 'Wild Rice with Nuts & Dried Fruits', 2, 8),
  ('reception-items', 'r-broccoli-rabe', 'Pasta with Broccoli Rabe', 2, 9),
  ('reception-items', 'r-gnocchi-corn', 'Gnocchi with Summer Corn', 2, 10),
  ('reception-items', 'r-pesto-squash', 'Pesto Pasta with Butternut Squash', 2, 11),
  ('reception-items', 'r-squash-ravioli', 'Butternut Squash Ravioli', 2, 12),
  ('reception-items', 'r-tortellini-artichoke', 'Three Cheese Tortellini with Artichokes', 3, 13),
  ('reception-items', 'r-fig-pasta', 'Pasta with Mission Figs', 3, 14),
  ('reception-items', 'r-cast-iron-chicken', 'Cast Iron Chicken Thighs', 2, 15),
  ('reception-items', 'r-blueberry-chicken', 'Blueberry & Fig Balsamic Chicken', 2, 16),
  ('reception-items', 'r-duck', 'Crispy Duck Breast', 13, 17),
  ('reception-items', 'r-balsamic-flank', 'Balsamic & Soy Flank Steak', 1, 18),
  ('reception-items', 'r-beef-ribs', 'Beef Ribs with Brown Sugar Rub', 3, 19),
  ('reception-items', 'r-filet', 'Filet Mignon', 7, 20),
  ('reception-items', 'r-ribeye', 'Grilled Rib Eye Steak', 7, 21),
  ('reception-items', 'r-short-ribs-cab', 'Braised Short Ribs (Cabernet)', 9, 22),
  ('reception-items', 'r-short-ribs-wine', 'Garlic Braised Short Ribs (Red Wine)', 9, 23),
  ('reception-items', 'r-lamb-shank', 'Red Wine Braised Lamb Shank', 11, 24),
  ('reception-items', 'r-rack-lamb', 'Herb Crusted Rack of Lamb', 12, 25),
  ('reception-items', 'r-whole-pig', 'Whole Roasted Pig', 22, 26),
  ('reception-items', 'r-ahi-tuna', 'Seared Ahi Tuna', 3, 27),
  ('reception-items', 'r-red-snapper', 'Pan Fried Red Snapper', 7, 28),
  ('reception-items', 'r-sea-bass', 'Grilled Sea Bass', 8, 29),
  ('reception-items', 'r-halibut', 'Braised Halibut', 14, 30),
  ('reception-items', 'r-fingerling', 'Smashed Fingerling Potatoes', 1, 31),
  ('reception-items', 'r-peas-carrots', 'Organic Baby Sweet Peas & Carrots', 1, 32),
  ('reception-items', 'r-root-veg', 'Roasted Root Vegetables', 1, 33),
  ('reception-items', 'r-farm-carrots', 'Grilled Farm Carrots', 2, 34),
  ('reception-items', 'r-brussels', 'Caramelized Brussels Sprouts', 2, 35),
  ('reception-items', 'r-portabella', 'Stuffed Portabella Mushroom', 3, 36),
  ('reception-items', 'r-asparagus', 'Asparagus Bundles', 4, 37);

-- REHEARSAL DINNER themes
INSERT INTO public.pricing_config (category, item_key, item_label, price, sort_order) VALUES
  ('rehearsal', 'traditional-italian', 'Traditional Italian', 65, 0),
  ('rehearsal', 'southern-comfort', 'Southern Comfort', 65, 1),
  ('rehearsal', 'asian-fusion', 'Asian Fusion', 67, 2),
  ('rehearsal', 'thai-inspired', 'Thai Inspired', 67, 3),
  ('rehearsal', 'chefs-favorite', 'Chef''s Favorite', 80, 4),
  ('rehearsal', 'taco-bar', 'Taco Bar', 80, 5),
  ('rehearsal', 'regional-sliders', 'Regional Sliders', 80, 6),
  ('rehearsal', 'modern-cuban', 'Modern Cuban', 85, 7),
  ('rehearsal', 'argentine-asado', 'Argentine "Asado" BBQ', 95, 8);

-- REHEARSAL add-ons
INSERT INTO public.pricing_config (category, item_key, item_label, price, sort_order) VALUES
  ('rehearsal-addons', 'addon-traditional-italian', 'Fusilli with creamy three pepper sauce', 10, 0),
  ('rehearsal-addons', 'addon-southern-comfort', 'Slow Cooked Ribs with strawberry cinnamon glaze', 15, 1),
  ('rehearsal-addons', 'addon-asian-fusion', 'Vegetarian Steamed Dumplings with Hoisin', 8, 2),
  ('rehearsal-addons', 'addon-thai-inspired', 'Roasted Seasonal Vegetables', 8, 3),
  ('rehearsal-addons', 'addon-modern-cuban', 'Slow-Roasted Whole Pig', 15, 4);

-- MEAL INCLUSIONS
INSERT INTO public.pricing_config (category, item_key, item_label, price, sort_order) VALUES
  ('inclusions', 'mimosa_bar', 'Mimosa Bar', 20, 0),
  ('inclusions', 'bloody_mary_bar', 'Bloody Mary Bar', 20, 1);
