import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuilderSelections, defaultSelections, STEPS } from '@/data/builderMenuData';
import { autoTriggerMilestone } from '@/hooks/useMenuProgress';

export interface CoupleProfile {
  id: string;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
  guest_count: number | null;
  email: string;
}

// Map step index to a human-readable name and the selections key
const STEP_KEYS: Record<number, { name: string; key: keyof BuilderSelections }> = {
  1: { name: 'Rehearsal Dinner', key: 'rehearsalDinner' },
  2: { name: 'Welcome Hour', key: 'welcomeHour' },
  3: { name: 'Cocktail Hour', key: 'cocktailHour' },
  4: { name: 'Reception Dinner', key: 'reception' },
  5: { name: 'Meal Inclusions', key: 'mealInclusions' },
  6: { name: 'Desserts', key: 'desserts' },
  7: { name: 'Bar Package', key: 'barPackage' },
};

function logChanges(
  coupleId: string,
  prev: BuilderSelections,
  next: BuilderSelections,
  isSubmitted: boolean,
) {
  const entries: { step: string; previous_value: any; new_value: any }[] = [];
  for (const [, { name, key }] of Object.entries(STEP_KEYS)) {
    const p = JSON.stringify(prev[key]);
    const n = JSON.stringify(next[key]);
    if (p !== n) {
      entries.push({ step: name, previous_value: prev[key], new_value: next[key] });
    }
  }
  // Also check stepNotes
  const pNotes = JSON.stringify(prev.stepNotes);
  const nNotes = JSON.stringify(next.stepNotes);
  if (pNotes !== nNotes) {
    entries.push({ step: 'Step Notes', previous_value: prev.stepNotes, new_value: next.stepNotes });
  }

  if (entries.length === 0) return;

  const rows = entries.map(e => ({
    couple_id: coupleId,
    step: e.step,
    previous_value: e.previous_value,
    new_value: e.new_value,
    post_submission: isSubmitted,
  }));

  (supabase as any).from('change_history').insert(rows).then(() => {});
}

export function useBuilderState() {
  const [profile, setProfile] = useState<CoupleProfile | null>(null);
  const [selections, setSelections] = useState<BuilderSelections>(defaultSelections);
  const [status, setStatus] = useState<string>('not_started');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionsRef = useRef(selections);
  const previousSelectionsRef = useRef(selections);
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
      const prev = previousSelectionsRef.current;
      const next = selectionsRef.current;

      logChanges(p.id, prev, next, s === 'submitted');
      previousSelectionsRef.current = next;

      (supabase as any)
        .from('builder_selections')
        .upsert({
          couple_id: p.id,
          selections: next,
          status: statusToSave,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'couple_id' })
        .then(() => {
          if (s === 'not_started') setStatus('in_progress');
          setLastSavedAt(new Date());
        });
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
          barPackage: { ...defaultSelections.barPackage, ...saved.barPackage, selectedAddOns: Array.isArray(saved.barPackage?.selectedAddOns) ? saved.barPackage.selectedAddOns : defaultSelections.barPackage.selectedAddOns },
          stepNotes: { ...defaultSelections.stepNotes, ...saved.stepNotes },
        };
        setSelections(merged);
        setStatus(state.status);
      }
    }
    setLoading(false);
  };

  const saveSelections = useCallback(async (newSelections?: BuilderSelections, newStatus?: string) => {
    if (!profile) return;
    // Cancel any pending auto-save to avoid race
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    const toSave = newSelections ?? selectionsRef.current;
    const statusToSave = newStatus || (status === 'not_started' ? 'in_progress' : status);

    logChanges(profile.id, previousSelectionsRef.current, toSave, status === 'submitted');
    previousSelectionsRef.current = toSave;

    await (supabase as any)
      .from('builder_selections')
      .upsert({
        couple_id: profile.id,
        selections: toSave,
        status: statusToSave,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'couple_id' });
    setStatus(statusToSave);
    setLastSavedAt(new Date());
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

    // Auto-trigger the appropriate milestone based on current progress
    // Check which milestones are already complete to determine which submission this is
    const { data: progress } = await (supabase as any)
      .from('menu_progress')
      .select('milestone_name, is_complete')
      .eq('couple_id', profile.id);

    const isComplete = (name: string) => progress?.find((p: any) => p.milestone_name === name)?.is_complete ?? false;

    if (!isComplete('draft_submitted')) {
      await autoTriggerMilestone(profile.id, 'draft_submitted');
    } else if (isComplete('review_call_complete') && !isComplete('first_revision_submitted')) {
      await autoTriggerMilestone(profile.id, 'first_revision_submitted');
    } else if (isComplete('tasting_complete') && !isComplete('final_revision_submitted')) {
      await autoTriggerMilestone(profile.id, 'final_revision_submitted');
    }

    setStatus('submitted');
    setSaving(false);
  }, [profile, selections]);

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return { profile, selections, setSelections, status, loading, saving, lastSavedAt, saveSelections, submitSelections, logout };
}
