import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Milestone {
  step_number: number;
  status: string;
}

export interface GuideCard {
  id: string;
  card_key: string;
  header: string;
  body: string;
  sort_order: number;
}

export interface GuideSettings {
  revision_fee: number;
  call_fee: number;
  out_of_season_enabled: boolean;
  out_of_season_amount: number;
}

const DEFAULT_SETTINGS: GuideSettings = {
  revision_fee: 100,
  call_fee: 200,
  out_of_season_enabled: false,
  out_of_season_amount: 0,
};

export function useGuideCards() {
  return useQuery<GuideCard[]>({
    queryKey: ['guide-cards'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('guide_cards')
        .select('*')
        .order('sort_order');
      return data ?? [];
    },
  });
}

export function useMilestones(coupleId: string | undefined) {
  return useQuery<Milestone[]>({
    queryKey: ['couple-milestones', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('couple_milestones')
        .select('step_number, status')
        .eq('couple_id', coupleId)
        .order('step_number');
      return data ?? [];
    },
  });
}

export function useGuideSettings(coupleId: string | undefined) {
  return useQuery<GuideSettings>({
    queryKey: ['couple-guide-settings', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('couple_guide_settings')
        .select('*')
        .eq('couple_id', coupleId)
        .maybeSingle();
      if (!data) return DEFAULT_SETTINGS;
      return {
        revision_fee: Number(data.revision_fee),
        call_fee: Number(data.call_fee),
        out_of_season_enabled: data.out_of_season_enabled,
        out_of_season_amount: Number(data.out_of_season_amount),
      };
    },
  });
}
