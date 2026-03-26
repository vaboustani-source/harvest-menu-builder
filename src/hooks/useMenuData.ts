import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DbMenuItem = {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: string | null;
  diet: string[] | null;
  season: string[] | null;
  note: string | null;
  group_label: string | null;
  sort_order: number;
};

export type DbMenuPackage = {
  id: string;
  section_id: string;
  title: string;
  price: string;
  description: string;
  sort_order: number;
};

export type DbMenuAccordion = {
  id: string;
  section_id: string;
  title: string;
  subtitle: string | null;
  price: string | null;
  emoji: string | null;
  body: string;
  sort_order: number;
};

export type DbMenuSection = {
  id: string;
  label: string;
  emoji: string | null;
  section_title: string;
  section_subtitle: string | null;
  description: string | null;
  sort_order: number;
};

export type FullMenuSection = DbMenuSection & {
  items: DbMenuItem[];
  packages: DbMenuPackage[];
  accordions: DbMenuAccordion[];
};

export function useMenuData() {
  return useQuery({
    queryKey: ['menu-data'],
    queryFn: async () => {
      const [sections, items, packages, accordions] = await Promise.all([
        supabase.from('menu_sections').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order'),
        supabase.from('menu_packages').select('*').order('sort_order'),
        supabase.from('menu_accordions').select('*').order('sort_order'),
      ]);

      if (sections.error) throw sections.error;
      if (items.error) throw items.error;
      if (packages.error) throw packages.error;
      if (accordions.error) throw accordions.error;

      return (sections.data as DbMenuSection[]).map((sec) => ({
        ...sec,
        items: (items.data as DbMenuItem[]).filter((i) => i.section_id === sec.id),
        packages: (packages.data as DbMenuPackage[]).filter((p) => p.section_id === sec.id),
        accordions: (accordions.data as DbMenuAccordion[]).filter((a) => a.section_id === sec.id),
      })) as FullMenuSection[];
    },
  });
}
