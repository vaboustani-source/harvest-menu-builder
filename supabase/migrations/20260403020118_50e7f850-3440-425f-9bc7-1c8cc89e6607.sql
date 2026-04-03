
-- Global editable "Good to Know" cards
CREATE TABLE public.guide_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_key text NOT NULL UNIQUE,
  header text NOT NULL,
  body text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guide_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guide cards" ON public.guide_cards FOR SELECT USING (true);
CREATE POLICY "Authenticated can update guide cards" ON public.guide_cards FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert guide cards" ON public.guide_cards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete guide cards" ON public.guide_cards FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_guide_cards_updated_at BEFORE UPDATE ON public.guide_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default cards
INSERT INTO public.guide_cards (card_key, header, body, sort_order) VALUES
  ('revisions', 'Two Rounds. One Tasting.', 'Your menu includes one revision before the tasting and one after. Additional changes beyond that are ${{revision_fee}} per revision. We''ve found two rounds is all most couples ever need.', 1),
  ('calls', 'Two Calls Included.', 'Two coordination calls with Brandon are part of your menu planning process. Additional calls are ${{call_fee}} per hour. Most of what needs to be said gets said in the first two.', 2),
  ('seasonal', 'We source from the land.', 'Our menus are built around what''s growing — on the estate and from farms within reach. When a selection falls outside its natural season, we do our best to source it well. Out-of-season items carry a small additional charge to reflect the true cost of doing that right. Your coordinator will note any affected selections during your review call.', 3);

-- Per-couple milestone tracking
CREATE TABLE public.couple_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_id, step_number)
);

ALTER TABLE public.couple_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view milestones" ON public.couple_milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert milestones" ON public.couple_milestones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update milestones" ON public.couple_milestones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete milestones" ON public.couple_milestones FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_couple_milestones_updated_at BEFORE UPDATE ON public.couple_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-couple guide settings (fees, surcharges)
CREATE TABLE public.couple_guide_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE UNIQUE,
  revision_fee numeric NOT NULL DEFAULT 100,
  call_fee numeric NOT NULL DEFAULT 200,
  out_of_season_enabled boolean NOT NULL DEFAULT false,
  out_of_season_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.couple_guide_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view guide settings" ON public.couple_guide_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert guide settings" ON public.couple_guide_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update guide settings" ON public.couple_guide_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete guide settings" ON public.couple_guide_settings FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_couple_guide_settings_updated_at BEFORE UPDATE ON public.couple_guide_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
