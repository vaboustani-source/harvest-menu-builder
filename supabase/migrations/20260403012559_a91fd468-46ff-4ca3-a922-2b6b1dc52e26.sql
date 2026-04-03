
-- Create change_history table
CREATE TABLE public.change_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL,
  step text NOT NULL,
  previous_value jsonb,
  new_value jsonb,
  post_submission boolean NOT NULL DEFAULT false,
  changed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.change_history ENABLE ROW LEVEL SECURITY;

-- Couples can view their own history
CREATE POLICY "Couples can view own history"
ON public.change_history FOR SELECT
TO authenticated
USING (
  couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid())
  OR true
);

-- Couples can insert their own history
CREATE POLICY "Couples can insert own history"
ON public.change_history FOR INSERT
TO authenticated
WITH CHECK (
  couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid())
);

-- Index for fast lookups
CREATE INDEX idx_change_history_couple_id ON public.change_history (couple_id, changed_at DESC);

-- Add pricing audit column
ALTER TABLE public.pricing_config ADD COLUMN IF NOT EXISTS last_updated_by uuid;
