
-- Menu sections table
CREATE TABLE public.menu_sections (
  id TEXT NOT NULL PRIMARY KEY,
  label TEXT NOT NULL,
  emoji TEXT,
  section_title TEXT NOT NULL,
  section_subtitle TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view menu sections" ON public.menu_sections FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sections" ON public.menu_sections FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update sections" ON public.menu_sections FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete sections" ON public.menu_sections FOR DELETE USING (auth.uid() IS NOT NULL);

-- Menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES public.menu_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  diet TEXT[],
  note TEXT,
  group_label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert items" ON public.menu_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update items" ON public.menu_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete items" ON public.menu_items FOR DELETE USING (auth.uid() IS NOT NULL);

-- Package cards table
CREATE TABLE public.menu_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES public.menu_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view packages" ON public.menu_packages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert packages" ON public.menu_packages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update packages" ON public.menu_packages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete packages" ON public.menu_packages FOR DELETE USING (auth.uid() IS NOT NULL);

-- Accordion groups table
CREATE TABLE public.menu_accordions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES public.menu_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  price TEXT,
  emoji TEXT,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_accordions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view accordions" ON public.menu_accordions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert accordions" ON public.menu_accordions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update accordions" ON public.menu_accordions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete accordions" ON public.menu_accordions FOR DELETE USING (auth.uid() IS NOT NULL);

-- Auto-update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_menu_sections_updated_at BEFORE UPDATE ON public.menu_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_packages_updated_at BEFORE UPDATE ON public.menu_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_accordions_updated_at BEFORE UPDATE ON public.menu_accordions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
