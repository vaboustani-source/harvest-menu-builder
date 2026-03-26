import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type BulletItem = { text: string; price?: string };

export type BasicsCard = {
  id: string;
  group_label: string;
  title: string;
  card_type: 'included' | 'addon';
  bullets: BulletItem[];
  sort_order: number;
};

export type BasicsCardGroup = {
  label: string;
  cards: BasicsCard[];
};

export function useBasicsCards() {
  return useQuery({
    queryKey: ['basics-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('basics_cards')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      const cards = (data as any[]).map((row) => ({
        ...row,
        card_type: row.card_type as 'included' | 'addon',
        bullets: (typeof row.bullets === 'string' ? JSON.parse(row.bullets) : row.bullets) as BulletItem[],
      })) as BasicsCard[];

      // Group by group_label preserving order
      const groupMap = new Map<string, BasicsCard[]>();
      for (const card of cards) {
        if (!groupMap.has(card.group_label)) groupMap.set(card.group_label, []);
        groupMap.get(card.group_label)!.push(card);
      }

      return Array.from(groupMap.entries()).map(([label, cards]) => ({
        label,
        cards,
      })) as BasicsCardGroup[];
    },
  });
}
