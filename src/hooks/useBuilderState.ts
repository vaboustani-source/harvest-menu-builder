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
        const saved = (state.selections || {}) as any;
        // Deep merge nested objects so partial saves don't lose default arrays
        const merged: BuilderSelections = {
          ...defaultSelections,
          ...saved,
          rehearsalDinner: { ...defaultSelections.rehearsalDinner, ...saved.rehearsalDinner },
          welcomeHour: { ...defaultSelections.welcomeHour, ...saved.welcomeHour },
          cocktailHour: Array.isArray(saved.cocktailHour) ? saved.cocktailHour : defaultSelections.cocktailHour,
          reception: {
            salads: Array.isArray(saved.reception?.salads) ? saved.reception.salads : defaultSelections.reception.salads,
            pastasGrains: Array.isArray(saved.reception?.pastasGrains) ? saved.reception.pastasGrains : defaultSelections.reception.pastasGrains,
            proteins: Array.isArray(saved.reception?.proteins) ? saved.reception.proteins : defaultSelections.reception.proteins,
            vegetablesStarches: Array.isArray(saved.reception?.vegetablesStarches) ? saved.reception.vegetablesStarches : defaultSelections.reception.vegetablesStarches,
          },
          mealInclusions: { ...defaultSelections.mealInclusions, ...saved.mealInclusions },
          desserts: { ...defaultSelections.desserts, ...saved.desserts },
          barPackage: { ...defaultSelections.barPackage, ...saved.barPackage },
        };
        setSelections(merged);
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
