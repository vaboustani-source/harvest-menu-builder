import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Couple } from './useCouples';

export type CoupleSelection = {
  id: string;
  couple_id: string;
  menu_item_id: string;
  section_id: string;
  group_label: string | null;
  notes: string | null;
  created_at: string;
};

export function useCoupleSelections(coupleId: string | null) {
  return useQuery({
    queryKey: ['couple-selections', coupleId],
    enabled: !!coupleId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couple_selections')
        .select('*')
        .eq('couple_id', coupleId!);
      if (error) throw error;
      return data as CoupleSelection[];
    },
  });
}

export function useCoupleProfile() {
  return useQuery({
    queryKey: ['couple-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Couple | null;
    },
  });
}
