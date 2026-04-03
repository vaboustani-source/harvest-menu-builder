import { useState, useEffect, useCallback, useRef } from 'react';
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
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionsRef = useRef(selections);
  const profileRef = useRef(profile);
  const statusRef = useRef(status);

  // Keep refs in sync
  useEffect(() => { selectionsRef.current = selections; }, [selections]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Auto-save 2s after any selection change
  useEffect(() => {
    if (loading || !profileRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const p = profileRef.current;
      const s = statusRef.current;
      if (!p) return;
      const statusToSave = s === 'not_started' ? 'in_progress' : s;
      (supabase as any)
        .from('builder_selections')
        .upsert({
          couple_id: p.id,
          selections: selectionsRef.current,
          status: statusToSave,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'couple_id' })
        .then(() => { if (s === 'not_started') setStatus('in_progress'); });
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [selections, loading]);

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
