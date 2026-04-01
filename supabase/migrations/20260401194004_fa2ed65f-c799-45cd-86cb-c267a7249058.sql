
ALTER TABLE public.pricing_config ADD COLUMN display_category text DEFAULT null;

UPDATE public.pricing_config SET display_category = 'Salads' WHERE item_key IN ('r-spinach-bacon','r-beet-frisee','r-pear-walnut','r-peach-burrata','r-chanterelle-beet','r-arugula-parm','r-wedge','r-beet-goat');
UPDATE public.pricing_config SET display_category = 'Grains & Sides' WHERE item_key IN ('r-wild-rice');
UPDATE public.pricing_config SET display_category = 'Pasta' WHERE item_key IN ('r-broccoli-rabe','r-gnocchi-corn','r-pesto-squash','r-squash-ravioli','r-tortellini-artichoke','r-fig-pasta');
UPDATE public.pricing_config SET display_category = 'Entrées' WHERE item_key IN ('r-cast-iron-chicken','r-blueberry-chicken');
UPDATE public.pricing_config SET display_category = 'Meats' WHERE item_key IN ('r-duck','r-balsamic-flank','r-beef-ribs','r-filet','r-ribeye','r-short-ribs-cab','r-short-ribs-wine','r-lamb-shank','r-rack-lamb','r-whole-pig');
UPDATE public.pricing_config SET display_category = 'Fish' WHERE item_key IN ('r-ahi-tuna','r-red-snapper','r-sea-bass','r-halibut');
UPDATE public.pricing_config SET display_category = 'Vegetables & Starches' WHERE item_key IN ('r-fingerling','r-peas-carrots','r-root-veg','r-farm-carrots','r-brussels','r-portabella','r-asparagus');
