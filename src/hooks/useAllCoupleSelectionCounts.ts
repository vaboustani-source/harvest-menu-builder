import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAllCoupleSelectionCounts() {
  return useQuery({
    queryKey: ['couple-selection-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couple_selections')
        .select('couple_id');
      if (error) throw error;
      const counts = new Map<string, number>();
      (data ?? []).forEach((row) => {
        counts.set(row.couple_id, (counts.get(row.couple_id) ?? 0) + 1);
      });
      return counts;
    },
  });
}
