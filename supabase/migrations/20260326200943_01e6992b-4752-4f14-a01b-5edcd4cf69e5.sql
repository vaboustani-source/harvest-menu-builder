
-- Basics tab card data
CREATE TABLE public.basics_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_label text NOT NULL,
  title text NOT NULL,
  card_type text NOT NULL DEFAULT 'included', -- 'included' or 'addon'
  bullets jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{text: string, price?: string}]
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.basics_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view basics cards" ON public.basics_cards FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert basics cards" ON public.basics_cards FOR INSERT TO public WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update basics cards" ON public.basics_cards FOR UPDATE TO public USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete basics cards" ON public.basics_cards FOR DELETE TO public USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_basics_cards_updated_at BEFORE UPDATE ON public.basics_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the existing hardcoded data
INSERT INTO public.basics_cards (group_label, title, card_type, bullets, sort_order) VALUES
-- Cocktail Hour
('Cocktail Hour', 'What''s Always Included', 'included', '[{"text":"1 hour of passed service by Gilbertsville staff"},{"text":"4 hors d''oeuvre selections (cold & hot)"},{"text":"All platters, serving ware & napkins provided"},{"text":"Bar service runs concurrently"}]', 0),
('Cocktail Hour', 'Add-On Options', 'addon', '[{"text":"5th hors d''oeuvre selection","price":"+$8pp"},{"text":"Premium item upcharges","price":"+$1–$7pp per item"},{"text":"Display stations (Harvest Board, Raw Bar, etc.)","price":"priced separately pp"}]', 1),
-- Reception Dinner
('Reception Dinner (Family Style)', 'Base Package — $105pp includes:', 'included', '[{"text":"Artisan bread service"},{"text":"1 farm salad"},{"text":"1 pasta or grain"},{"text":"2 protein entrées"},{"text":"2 vegetables or starches"},{"text":"All family-style platters, service & staffing"}]', 2),
('Reception Dinner (Family Style)', 'Build It Up — Available Add-Ons', 'addon', '[{"text":"2nd salad","price":"+$8pp"},{"text":"2nd pasta or grain","price":"+$12pp"},{"text":"3rd entrée","price":"+$22pp"},{"text":"3rd side","price":"+$8pp"},{"text":"Premium item upcharges vary by selection"}]', 3),
-- Bar Service
('Bar Service (All Events)', 'Reception Bar — Always Includes', 'included', '[{"text":"8 full hours of open bar service"},{"text":"Licensed, trained Gilbertsville bartenders"},{"text":"All glassware, ice & bar equipment"},{"text":"Non-alcoholic options (water, sodas, juices)"},{"text":"All packages include house beer & wine (see Bar Packages tab for full lists)"}]', 4),
('Bar Service (All Events)', 'Rehearsal Dinner Bar — Always Includes', 'included', '[{"text":"3 hours of open bar service"},{"text":"Full house spirits, beer & wine"},{"text":"All glassware, ice & service"},{"text":"Priced at $36pp"}]', 5),
-- After-Party & Welcome Party
('After-Party & Welcome Party', 'Welcome Party — $45pp', 'included', '[{"text":"2 hours of service"},{"text":"Full open bar"},{"text":"Bonfire & s''mores station"},{"text":"Dessert selection"}]', 6),
('After-Party & Welcome Party', 'After-Party — $3,500 flat', 'included', '[{"text":"2 hours · up to 100 guests"},{"text":"Bar extension from reception service"},{"text":"1 late-night food selection"},{"text":"Full staffing & setup"}]', 7),
-- Breakfast, Brunch & Lunch
('Breakfast, Brunch & Lunch Events', 'What''s Always Included', 'included', '[{"text":"Buffet-style service with full staffing"},{"text":"Coffee, tea & juice service"},{"text":"All tableware, linens & setup"},{"text":"Served in the Chandelier Hall or outdoor spaces"}]', 8),
('Breakfast, Brunch & Lunch Events', 'Brunch Add-Ons Available', 'addon', '[{"text":"Mimosa Bar","price":"+$20pp"},{"text":"Bloody Mary Bar","price":"+$20pp"}]', 9);
