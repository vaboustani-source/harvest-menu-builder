import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Couple = {
  id: string;
  user_id: string;
  partner1_name: string;
  partner2_name: string;
  email: string;
  wedding_date: string | null;
  guest_count: number | null;
  status: string;
  created_at: string;
};

export function useCouples() {
  return useQuery({
    queryKey: ['couples'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .order('wedding_date', { ascending: true });
      if (error) throw error;
      return data as Couple[];
    },
  });
}
