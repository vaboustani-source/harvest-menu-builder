import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCoupleProfile } from '@/hooks/useCoupleSelections';
import { useCoupleSelections } from '@/hooks/useCoupleSelections';
import { useMenuData, type FullMenuSection } from '@/hooks/useMenuData';
import { useGroupLimits } from '@/hooks/useGroupLimits';
import { useBasicsCards } from '@/hooks/useBasicsCards';
import { MenuItemCard } from '@/components/harvest/MenuItemCard';
import { DietTagBadge } from '@/components/harvest/DietTag';
import { Button } from '@/components/ui/button';
import { LogOut, Check, Plus, Minus, Diamond } from 'lucide-react';
import type { DietTag } from '@/data/menuData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CoupleMenuBuilder() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useCoupleProfile();
  const { data: sections } = useMenuData();
  const { data: groupLimits } = useGroupLimits();
  const { data: basicsGroups } = useBasicsCards();
  const { data: selections } = useCoupleSelections(profile?.id ?? null);
  const [activeTab, setActiveTab] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/');
    });
  }, [navigate]);

  useEffect(() => {
    if (sections && sections.length > 0 && !activeTab) {
      // Skip basics, start with first menu section
      const first = sections.find(s => s.id !== 'basics') ?? sections[0];
      setActiveTab(first.id);
    }
  }, [sections, activeTab]);

  const selectedItemIds = new Set(selections?.map(s => s.menu_item_id) ?? []);

  const toggleItem = async (item: { id: string; section_id: string; group_label: string | null }) => {
    if (!profile) return;
    setSaving(item.id);

    if (selectedItemIds.has(item.id)) {
      await supabase.from('couple_selections').delete()
        .eq('couple_id', profile.id)
        .eq('menu_item_id', item.id);
    } else {
      await supabase.from('couple_selections').insert({
        couple_id: profile.id,
        menu_item_id: item.id,
        section_id: item.section_id,
        group_label: item.group_label,
      });
    }

    await qc.invalidateQueries({ queryKey: ['couple-selections', profile.id] });
    setSaving(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getGroupedItems = (section: FullMenuSection) => {
    const grouped: Record<string, typeof section.items> = {};
    for (const item of section.items) {
      const key = item.group_label ?? '__ungrouped__';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }
    return grouped;
  };

  const getLimit = (sectionId: string, groupLabel: string) => {
    return groupLimits?.find(l => l.section_id === sectionId && l.group_label === groupLabel);
  };

  const getSelectedCountForGroup = (sectionId: string, groupLabel: string) => {
    return selections?.filter(s => s.section_id === sectionId && s.group_label === groupLabel).length ?? 0;
  };

  // Map section IDs to basics card group labels
  const sectionToBasicsMap: Record<string, string[]> = {
    'cocktail': ['Cocktail Hour'],
    'reception': ['Reception Dinner (Family Style)'],
    'bar': ['Bar Service (All Events)'],
    'desserts': [],
    'rehearsal': [],
    'welcome': ['After-Party & Welcome Party'],
    'packages': ['Breakfast, Brunch & Lunch Events'],
  };

  const getBasicsCardsForSection = (sectionId: string) => {
    const groupLabels = sectionToBasicsMap[sectionId];
    if (!groupLabels || groupLabels.length === 0 || !basicsGroups) return [];
    return basicsGroups.filter(g => groupLabels.includes(g.label));
  };

  const currentSection = sections?.find(s => s.id === activeTab);
  // Filter out basics for couple view
  const menuSections = sections?.filter(s => s.id !== 'basics') ?? [];

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Loading your menu…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-sans text-xs text-muted-foreground">No couple profile found. Please contact the venue.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-green text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-nav">
        <div>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase opacity-60">Harvest 336 · Menu Builder</p>
          <h1 className="font-serif italic text-lg leading-none">
            {profile.partner1_name} & {profile.partner2_name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {profile.wedding_date && (
            <span className="font-sans text-[11px] opacity-60 hidden sm:block">
              {new Date(profile.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:text-white/80 hover:bg-white/10 font-sans text-xs uppercase tracking-widest px-3 gap-1.5">
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </header>

      {/* Intro */}
      <div className="bg-cream border-b border-cream-dark px-6 py-6 text-center">
        <p className="font-serif text-[17px] italic text-text-muted-brand max-w-[640px] mx-auto leading-[1.7]">
          Select the items you'd like for your weekend. Items within the included count are part of your package — anything beyond is noted as an extra.
        </p>
      </div>

      {/* Tab bar */}
      <div className="sticky top-[60px] z-40 bg-white border-b border-cream-dark">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {menuSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex-shrink-0 px-5 py-3.5 border-b-2 font-sans text-[11px] font-medium tracking-[0.1em] uppercase whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === section.id
                    ? 'text-grove border-sage font-semibold'
                    : 'text-text-muted-brand border-transparent hover:text-grove'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-[1100px] mx-auto px-6 pt-8 pb-20">
        {currentSection && (
          <div key={currentSection.id}>
            {/* Section header */}
            <div className="mb-8">
              <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-sage mb-2">{currentSection.label}</p>
              <h2 className="font-serif font-light text-grove leading-[1.15] mb-2" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>
                {currentSection.section_title}
              </h2>
              {currentSection.description && (
                <p className="font-serif text-[14px] italic text-text-muted-brand max-w-[580px] leading-[1.7]">
                  {currentSection.description}
                </p>
              )}
              <div className="w-[50px] h-px bg-sage-light mt-4 mb-6" />
            </div>

            {/* Included limits summary */}
            {(() => {
              const sectionLimits = groupLimits?.filter(l => l.section_id === currentSection.id) ?? [];
              if (sectionLimits.length === 0) return null;
              return (
                <div className="mb-8 rounded-[10px] border border-sage-light/60 bg-sage/[0.04] px-5 py-4">
                  <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-sage font-semibold mb-2.5">
                    Included with your package
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    {sectionLimits.map(limit => {
                      const selected = getSelectedCountForGroup(currentSection.id, limit.group_label);
                      const filled = selected >= limit.included_count;
                      const over = selected > limit.included_count;
                      return (
                        <div key={limit.id} className="flex items-center gap-1.5">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                            filled ? 'bg-sage text-white' : 'border border-cream-dark'
                          }`}>
                            {filled && <Check size={10} />}
                          </span>
                          <span className="font-sans text-[11px] text-charcoal">
                            {limit.group_label}:
                          </span>
                          <span className={`font-sans text-[11px] font-medium ${over ? 'text-warm' : 'text-charcoal'}`}>
                            {selected} / {limit.included_count}
                          </span>
                          {over && (
                            <span className="font-sans text-[9px] tracking-wide uppercase text-warm">
                              +{selected - limit.included_count} extra
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="font-sans text-[10px] text-text-muted-brand opacity-60 mt-2">
                    Selections beyond the included count are noted as extras with pricing
                  </p>
                </div>
              );
            })()}

            {/* Basics inclusion cards for this section */}
            {(() => {
              const basicsForSection = getBasicsCardsForSection(currentSection.id);
              if (basicsForSection.length === 0) return null;
              return (
                <div className="mb-8 space-y-3">
                  {basicsForSection.map(group => (
                    <div key={group.label}>
                      {group.cards.map(card => (
                        <div key={card.id} className={`rounded-[10px] border px-5 py-4 mb-3 ${
                          card.card_type === 'included'
                            ? 'border-sage/30 bg-sage/[0.04]'
                            : 'border-warm/30 bg-warm/[0.04]'
                        }`}>
                          <div className="flex items-center gap-2 mb-2.5">
                            <Diamond size={10} className={card.card_type === 'included' ? 'text-sage fill-sage' : 'text-warm'} />
                            <p className="font-serif text-[13px] text-charcoal font-medium">{card.title}</p>
                            <span className={`font-sans text-[9px] tracking-[0.2em] uppercase ${
                              card.card_type === 'included' ? 'text-sage' : 'text-warm'
                            }`}>
                              {card.card_type === 'included' ? 'Included' : 'Add-On'}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {card.bullets.map((bullet, bi) => (
                              <li key={bi} className="flex items-start gap-2 font-sans text-[12px] text-charcoal/80 leading-[1.5]">
                                <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${
                                  card.card_type === 'included' ? 'bg-sage' : 'bg-warm'
                                }`} />
                                <span>
                                  {bullet.text}
                                  {bullet.price && (
                                    <span className="font-medium italic text-warm ml-1">{bullet.price}</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Grouped items */}
            {Object.entries(getGroupedItems(currentSection)).map(([group, items]) => {
              const groupLabel = group === '__ungrouped__' ? '' : group;
              const limit = groupLabel ? getLimit(currentSection.id, groupLabel) : null;
              const selectedCount = groupLabel ? getSelectedCountForGroup(currentSection.id, groupLabel) : 0;
              const includedCount = limit?.included_count ?? 0;

              return (
                <div key={group} className="mb-10">
                  {groupLabel && (
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-sage font-medium">
                        {groupLabel}
                      </span>
                      <div className="flex-1 h-px bg-cream-dark" />
                      {limit && (
                        <span className="font-sans text-[10px] tracking-widest uppercase text-muted-foreground">
                          {selectedCount} / {includedCount} included
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Included items */}
                    {items.map((item, idx) => {
                      const isSelected = selectedItemIds.has(item.id);
                      // Determine if this item is "extra" — selected items beyond the included count
                      const selectionIndex = isSelected
                        ? (selections?.filter(s => s.section_id === currentSection.id && s.group_label === groupLabel).findIndex(s => s.menu_item_id === item.id) ?? 0)
                        : -1;

                      return (
                        <div key={item.id}>
                          {/* Show divider when we cross the included threshold */}
                          {limit && isSelected && selectionIndex === includedCount && includedCount > 0 && (
                            <div className="flex items-center gap-3 my-4 px-2">
                              <div className="flex-1 h-px bg-warm/30" />
                              <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-warm whitespace-nowrap">
                                Extra Selections {limit.extra_price_note ? `· ${limit.extra_price_note}` : ''}
                              </span>
                              <div className="flex-1 h-px bg-warm/30" />
                            </div>
                          )}

                          <button
                            onClick={() => toggleItem({ id: item.id, section_id: currentSection.id, group_label: item.group_label ?? '' })}
                            disabled={saving === item.id}
                            className={`w-full text-left relative rounded-[10px] border px-5 py-4 transition-all duration-200 ${
                              isSelected
                                ? 'bg-sage/5 border-sage shadow-sm'
                                : 'bg-white border-cream-dark hover:border-sage-light hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? 'bg-sage border-sage text-white' : 'border-cream-dark'
                              }`}>
                                {isSelected && <Check size={12} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-[14.5px] text-charcoal leading-[1.5]">{item.name}</p>
                                {item.description && (
                                  <p className="font-serif text-[12.5px] italic text-text-muted-brand leading-[1.55] mt-0.5">{item.description}</p>
                                )}
                                {item.note && (
                                  <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-text-muted-brand opacity-60 mt-1">{item.note}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {item.diet?.map((tag) => (
                                    <DietTagBadge key={tag} tag={tag as DietTag} />
                                  ))}
                                </div>
                              </div>
                              {item.price && (
                                <span className="font-sans text-[11px] font-medium text-warm whitespace-nowrap shrink-0 mt-1">{item.price}</span>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Summary footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark px-6 py-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <p className="font-sans text-[11px] text-muted-foreground">
            <span className="font-medium text-charcoal">{selections?.length ?? 0}</span> items selected
          </p>
          <Button
            onClick={() => toast.success('Your selections have been saved! The catering team will review them.')}
            className="bg-green hover:bg-green/90 text-white font-sans text-xs tracking-widest uppercase gap-1.5"
          >
            <Check size={14} /> Submit Selections
          </Button>
        </div>
      </div>
    </div>
  );
}
