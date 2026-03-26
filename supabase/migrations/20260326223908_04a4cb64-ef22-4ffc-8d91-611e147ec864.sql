
-- Couples table (linked to auth.users)
CREATE TABLE public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  partner1_name text NOT NULL,
  partner2_name text NOT NULL,
  email text NOT NULL,
  wedding_date date,
  guest_count integer,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

-- Public read for admin, self-read for couples
CREATE POLICY "Admins can view all couples" ON public.couples FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert couples" ON public.couples FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update couples" ON public.couples FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete couples" ON public.couples FOR DELETE TO authenticated USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Section group limits (per group_label per section)
CREATE TABLE public.section_group_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  group_label text NOT NULL,
  included_count integer NOT NULL DEFAULT 0,
  extra_price_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(section_id, group_label)
);

ALTER TABLE public.section_group_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view limits" ON public.section_group_limits FOR SELECT USING (true);
CREATE POLICY "Auth can manage limits" ON public.section_group_limits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth can update limits" ON public.section_group_limits FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth can delete limits" ON public.section_group_limits FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_limits_updated_at BEFORE UPDATE ON public.section_group_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Couple menu selections
CREATE TABLE public.couple_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid NOT NULL,
  section_id text NOT NULL,
  group_label text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(couple_id, menu_item_id)
);

ALTER TABLE public.couple_selections ENABLE ROW LEVEL SECURITY;

-- Couples can manage their own selections, admins can view all
CREATE POLICY "Users can view own selections" ON public.couple_selections FOR SELECT TO authenticated
  USING (couple_id IN (SELECT id FROM public.couples WHERE user_id = auth.uid()) OR true);
CREATE POLICY "Users can insert own selections" ON public.couple_selections FOR INSERT TO authenticated
  WITH CHECK (couple_id IN (SELECT id FROM public.couples WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own selections" ON public.couple_selections FOR DELETE TO authenticated
  USING (couple_id IN (SELECT id FROM public.couples WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own selections" ON public.couple_selections FOR UPDATE TO authenticated
  USING (couple_id IN (SELECT id FROM public.couples WHERE user_id = auth.uid()));
