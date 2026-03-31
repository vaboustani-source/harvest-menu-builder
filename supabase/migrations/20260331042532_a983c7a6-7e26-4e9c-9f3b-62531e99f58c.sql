CREATE TABLE builder_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL,
  selections jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'not_started',
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT builder_selections_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  CONSTRAINT builder_selections_couple_id_key UNIQUE(couple_id)
);

ALTER TABLE builder_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view all builder selections"
  ON builder_selections FOR SELECT TO authenticated USING (true);

CREATE POLICY "Couple can insert own builder state"
  ON builder_selections FOR INSERT TO authenticated
  WITH CHECK (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));

CREATE POLICY "Couple can update own builder state"
  ON builder_selections FOR UPDATE TO authenticated
  USING (couple_id IN (SELECT id FROM couples WHERE user_id = auth.uid()));