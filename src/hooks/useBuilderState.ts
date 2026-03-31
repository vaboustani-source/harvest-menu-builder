import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuilderSelections, defaultSelections } from '@/data/builderMenuData';

export interface CoupleProfile {
  id: string;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
  guest_count: number | null;
  email: string;
}

export function useBuilderState() {
  const [profile, setProfile] = useState<CoupleProfile | null>(null);
  const [selections, setSelections] = useState<BuilderSelections>(defaultSelections);
  const [status, setStatus] = useState<string>('not_started');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: couple } = await supabase
      .from('couples')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (couple) {
      setProfile(couple);
      const { data: state } = await (supabase as any)
        .from('builder_selections')
        .select('*')
        .eq('couple_id', couple.id)
        .maybeSingle();

      if (state) {
        setSelections({ ...defaultSelections, ...(state.selections as any) });
        setStatus(state.status);
      }
    }
    setLoading(false);
  };

  const saveSelections = useCallback(async (newSelections: BuilderSelections, newStatus?: string) => {
    if (!profile) return;
    setSaving(true);
    const statusToSave = newStatus || (status === 'not_started' ? 'in_progress' : status);
    await (supabase as any)
      .from('builder_selections')
      .upsert({
        couple_id: profile.id,
        selections: newSelections,
        status: statusToSave,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'couple_id' });
    setStatus(statusToSave);
    setSaving(false);
  }, [profile, status]);

  const submitSelections = useCallback(async () => {
    if (!profile) return;
    setSaving(true);
    await (supabase as any)
      .from('builder_selections')
      .upsert({
        couple_id: profile.id,
        selections,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'couple_id' });
    setStatus('submitted');
    setSaving(false);
  }, [profile, selections]);

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return { profile, selections, setSelections, status, loading, saving, saveSelections, submitSelections, logout };
}
