import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProgressMilestone {
  id: string;
  couple_id: string;
  milestone_name: string;
  is_complete: boolean;
  completed_at: string | null;
  set_by: string; // 'system' | 'admin'
  notes: string | null;
  override_timestamp: string | null;
  created_at: string;
  updated_at: string;
}

export const MILESTONE_DEFS = [
  { name: 'draft_submitted', label: 'Draft Submitted', description: 'Work through each meal moment and submit your first selections.', autoTriggerable: true },
  { name: 'review_call_complete', label: 'Review Call Complete', description: 'Your coordinator reviews your draft with you. Questions answered. Adjustments noted.', autoTriggerable: false },
  { name: 'first_revision_submitted', label: 'First Revision Submitted', description: 'One round of changes after your review call.', autoTriggerable: true },
  { name: 'tasting_complete', label: 'Tasting Complete', description: 'You come to the estate. You eat. The menu earns its place.', autoTriggerable: false },
  { name: 'final_revision_submitted', label: 'Final Revision Submitted', description: 'One last round of changes after the tasting. Then it\'s set.', autoTriggerable: true },
] as const;

// Couple-friendly labels for the progress timeline
export const MILESTONE_COUPLE_LABELS: Record<string, string> = {
  draft_submitted: 'Build Your Draft',
  review_call_complete: 'Review Call with Brandon',
  first_revision_submitted: 'First Revision',
  tasting_complete: 'The Tasting',
  final_revision_submitted: 'Final Revision',
};

export function useMenuProgress(coupleId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery<ProgressMilestone[]>({
    queryKey: ['menu-progress', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('menu_progress')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at');
      return data ?? [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!coupleId) return;
    const channel = supabase
      .channel(`menu-progress-${coupleId}`)
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'menu_progress', filter: `couple_id=eq.${coupleId}` },
        () => {
          qc.invalidateQueries({ queryKey: ['menu-progress', coupleId] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [coupleId, qc]);

  return query;
}

export function getMilestoneState(milestones: ProgressMilestone[] | undefined, milestoneName: string) {
  return milestones?.find(m => m.milestone_name === milestoneName) ?? null;
}

/** Upsert a milestone and log to change_history */
export async function setMilestoneProgress(
  coupleId: string,
  milestoneName: string,
  isComplete: boolean,
  setBy: 'system' | 'admin',
  opts?: { notes?: string; overrideTimestamp?: string },
) {
  const completedAt = isComplete ? (opts?.overrideTimestamp ?? new Date().toISOString()) : null;
  const overrideTs = opts?.overrideTimestamp ?? null;

  await (supabase as any)
    .from('menu_progress')
    .upsert(
      {
        couple_id: coupleId,
        milestone_name: milestoneName,
        is_complete: isComplete,
        completed_at: completedAt,
        set_by: setBy,
        notes: opts?.notes ?? null,
        override_timestamp: overrideTs,
      },
      { onConflict: 'couple_id,milestone_name' }
    );

  // Log to change_history
  await (supabase as any)
    .from('change_history')
    .insert({
      couple_id: coupleId,
      step: `Milestone: ${milestoneName}`,
      previous_value: null,
      new_value: { is_complete: isComplete, set_by: setBy, completed_at: completedAt },
      post_submission: false,
    });
}

/** Auto-trigger a milestone on couple submission. If admin already manually set it, update timestamp and set_by. */
export async function autoTriggerMilestone(coupleId: string, milestoneName: string) {
  // Check existing state
  const { data: existing } = await (supabase as any)
    .from('menu_progress')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('milestone_name', milestoneName)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existing && existing.is_complete && existing.set_by === 'admin') {
    // Admin already set it — update to system with actual timestamp
    await (supabase as any)
      .from('menu_progress')
      .update({
        completed_at: now,
        set_by: 'system',
        override_timestamp: null,
      })
      .eq('id', existing.id);
  } else {
    // Normal auto-trigger
    await (supabase as any)
      .from('menu_progress')
      .upsert(
        {
          couple_id: coupleId,
          milestone_name: milestoneName,
          is_complete: true,
          completed_at: now,
          set_by: 'system',
          notes: null,
          override_timestamp: null,
        },
        { onConflict: 'couple_id,milestone_name' }
      );
  }

  // Log
  await (supabase as any)
    .from('change_history')
    .insert({
      couple_id: coupleId,
      step: `Milestone: ${milestoneName}`,
      previous_value: existing ? { is_complete: existing.is_complete, set_by: existing.set_by } : null,
      new_value: { is_complete: true, set_by: 'system', completed_at: now },
      post_submission: false,
    });
}
