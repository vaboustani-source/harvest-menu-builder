import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type GroupLimit = {
  id: string;
  section_id: string;
  group_label: string;
  included_count: number;
  extra_price_note: string | null;
};

export function useGroupLimits() {
  return useQuery({
    queryKey: ['group-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('section_group_limits')
        .select('*')
        .order('section_id');
      if (error) throw error;
      return data as GroupLimit[];
    },
  });
}
