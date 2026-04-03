
-- Create menu_progress table
CREATE TABLE public.menu_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  set_by TEXT NOT NULL DEFAULT 'system',
  notes TEXT,
  override_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (couple_id, milestone_name)
);

-- Enable RLS
ALTER TABLE public.menu_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view menu progress" ON public.menu_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert menu progress" ON public.menu_progress FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update menu progress" ON public.menu_progress FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete menu progress" ON public.menu_progress FOR DELETE TO authenticated USING (true);

-- Auto-update updated_at
CREATE TRIGGER update_menu_progress_updated_at
  BEFORE UPDATE ON public.menu_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_progress;
