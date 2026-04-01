import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricingConfigRow {
  id: string;
  category: string;
  item_key: string;
  item_label: string;
  price: number;
  included_count: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function usePricingConfig() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['pricing-config'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('pricing_config')
        .select('*')
        .order('category')
        .order('sort_order');
      if (error) throw error;
      return data as PricingConfigRow[];
    },
  });

  const updatePrice = async (id: string, price: number) => {
    await (supabase as any)
      .from('pricing_config')
      .update({ price })
      .eq('id', id);
    qc.invalidateQueries({ queryKey: ['pricing-config'] });
  };

  const updateIncludedCount = async (id: string, included_count: number) => {
    await (supabase as any)
      .from('pricing_config')
      .update({ included_count })
      .eq('id', id);
    qc.invalidateQueries({ queryKey: ['pricing-config'] });
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await (supabase as any)
      .from('pricing_config')
      .update({ is_active })
      .eq('id', id);
    qc.invalidateQueries({ queryKey: ['pricing-config'] });
  };

  const addItem = async (item: { category: string; item_key: string; item_label: string; price: number; sort_order: number }) => {
    await (supabase as any)
      .from('pricing_config')
      .insert(item);
    qc.invalidateQueries({ queryKey: ['pricing-config'] });
  };

  const deleteItem = async (id: string) => {
    await (supabase as any)
      .from('pricing_config')
      .delete()
      .eq('id', id);
    qc.invalidateQueries({ queryKey: ['pricing-config'] });
  };

  return { ...query, updatePrice, updateIncludedCount, toggleActive, addItem, deleteItem };
}
