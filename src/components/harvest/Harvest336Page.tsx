import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import type { DietTag } from '@/data/menuData';
import { DIET_FILTER_OPTIONS } from './DietTag';
import { MenuItemCard } from './MenuItemCard';
import { PackageCardBlock } from './PackageCardBlock';
import { AccordionBlock } from './AccordionBlock';
import { BasicsContent } from './BasicsContent';
import { useMenuData, type FullMenuSection } from '@/hooks/useMenuData';

// Cross SVG pattern for hero
const CROSS_PATTERN =
  "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237A9E7E' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

export function Harvest336Page() {
  const { data: sections, isLoading } = useMenuData();
  const [activeTab, setActiveTab] = useState('basics');
  const [activeFilter, setActiveFilter] = useState<'all' | DietTag>('all');
  const [activeSeason, setActiveSeason] = useState<'all' | 'spring' | 'summer' | 'fall'>('all');
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Sticky nav shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setMobileNavOpen(false);
      }
    };
    if (mobileNavOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileNavOpen]);

  // Scroll active tab into view (desktop)
  useEffect(() => {
    const btn = tabRefs.current[activeTab];
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab]);

  const handleTabSelect = (id: string) => {
    setActiveTab(id);
    setActiveFilter('all');
    setActiveSeason('all');
    setMobileNavOpen(false);
  };

  const currentSection = sections?.find((s) => s.id === activeTab);

  const isItemVisible = (diet?: string[] | null, season?: string[] | null) => {
    const dietMatch = activeFilter === 'all' || (diet?.includes(activeFilter) ?? false);
    const seasonMatch = activeSeason === 'all' || (season?.includes(activeSeason) ?? false);
    return dietMatch && seasonMatch;
  };

  // Group items by group_label for sections like Reception
  const getGroupedItems = (section: FullMenuSection) => {
    const grouped: Record<string, typeof section.items> = {};
    for (const item of section.items) {
      const key = item.group_label ?? '__ungrouped__';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    }
    return grouped;
  };

  const hasGroups = (section: FullMenuSection) =>
    section.items.some((i) => i.group_label != null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-sans text-xs uppercase tracking-widest text-muted animate-pulse">
          Loading menu…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden text-center"
        style={{ background: '#2C3E2D', padding: '72px 40px 60px' }}
      >
        <a
          href="/admin/login"
          className="absolute top-4 right-5 font-sans text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors z-10"
        >
          Admin
        </a>
        <div
          className="absolute inset-0 opacity-100 pointer-events-none"
          style={{ backgroundImage: `url("${CROSS_PATTERN}")` }}
        />
        <p className="relative font-sans text-[10px] tracking-[0.45em] uppercase text-sage-light mb-[18px]">
          Gilbertsville Farmhouse · South New Berlin, NY
        </p>
        <h1
          className="relative font-serif font-light text-cream leading-[1.1] mb-[18px]"
          style={{ fontSize: 'clamp(36px, 6vw, 68px)', letterSpacing: '0.02em' }}
        >
          Harvest 336
          <br />
          <em className="italic text-warm">Culinary Program</em>
        </h1>
        <div
          className="relative mx-auto mb-[18px]"
          style={{ width: 48, height: 1, background: '#C8A96E', opacity: 0.7 }}
        />
        <p
          className="relative font-sans font-light text-cream/55 tracking-[0.08em] mx-auto"
          style={{ fontSize: 13, maxWidth: 520 }}
        >
          A rotating seasonal menu built around what's growing, what's local, and what's
          extraordinary.
        </p>
      </header>

      {/* ── INTRO BAND ───────────────────────────────────────────────── */}
      <div className="bg-cream border-b border-cream-dark px-10 py-7 text-center">
        <p className="font-serif text-[18px] font-light italic text-text-muted-brand leading-[1.75] mx-auto max-w-[760px]">
          Our culinary team handles{' '}
          <strong className="text-grove not-italic font-medium">every meal of your weekend</strong>{' '}
          — from Friday's rehearsal dinner to Sunday's farewell brunch. All menus are customized
          with you, built around your taste, and executed from our on-site kitchen.{' '}
          <span className="not-italic font-medium text-grove">
            No outside caterers. No banquet trays. No compromises.
          </span>
        </p>
      </div>

      {/* ── STICKY NAV ───────────────────────────────────────────────── */}
      <div
        ref={navRef}
        className={`sticky top-0 z-50 bg-white border-b border-cream-dark transition-shadow duration-200 ${
          scrolled ? 'shadow-nav' : ''
        }`}
      >
        {/* ── MOBILE DROPDOWN (< md) ── */}
        <div className="md:hidden" ref={mobileDropdownRef}>
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-text-muted-brand">
                Menu
              </span>
              <span className="w-px h-3 bg-cream-dark" />
              <span className="font-sans text-[11px] font-semibold tracking-[0.1em] uppercase text-grove">
                {currentSection?.label}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-sage transition-transform duration-200 ${mobileNavOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {mobileNavOpen && (
            <div className="absolute left-0 right-0 bg-white border-b border-cream-dark shadow-nav z-50">
              {sections?.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleTabSelect(section.id)}
                  className={`w-full flex items-center justify-between px-5 py-3 font-sans text-[11px] font-medium tracking-[0.1em] uppercase cursor-pointer transition-colors duration-150 border-b border-cream-dark last:border-b-0 ${
                    activeTab === section.id
                      ? 'text-grove bg-cream'
                      : 'text-text-muted-brand hover:bg-cream hover:text-grove'
                  }`}
                >
                  <span>{section.label}</span>
                  {activeTab === section.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── DESKTOP TAB BAR (≥ md) ── */}
        <div className="hidden md:block max-w-[1100px] mx-auto px-6">
          <div className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {sections?.map((section) => (
              <button
                key={section.id}
                ref={(el) => { tabRefs.current[section.id] = el; }}
                onClick={() => handleTabSelect(section.id)}
                className={`flex-shrink-0 px-5 py-4 border-b-2 font-sans text-[11px] font-medium tracking-[0.1em] uppercase whitespace-nowrap transition-all duration-200 cursor-pointer ${
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

      {/* ── FILTER BAR ────────────────────────────────────────────── */}
      <div className="bg-cream border-b border-cream-dark px-6 py-[14px]">
        <div className="max-w-[1100px] mx-auto flex items-center gap-[10px] flex-wrap">
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted-brand mr-1">
            Filter:
          </span>
          {DIET_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id as 'all' | DietTag)}
              className={`flex items-center gap-[5px] px-[13px] py-[5px] rounded-full border font-sans text-[11px] transition-all duration-150 cursor-pointer ${
                activeFilter === opt.id
                  ? 'bg-grove border-grove text-white'
                  : 'bg-white border-[#D5CFC8] text-text-muted-brand hover:border-sage hover:text-grove'
              }`}
            >
              {opt.id !== 'all' && (
                <span className="w-[6px] h-[6px] rounded-full bg-current opacity-70" />
              )}
              {opt.label}
            </button>
          ))}

          <span className="w-px h-4 bg-cream-dark mx-1" />

          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-text-muted-brand mr-1">
            Season:
          </span>
          {(['all', 'spring', 'summer', 'fall'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSeason(s)}
              className={`flex items-center gap-[5px] px-[13px] py-[5px] rounded-full border font-sans text-[11px] transition-all duration-150 cursor-pointer ${
                activeSeason === s
                  ? 'bg-warm border-warm text-white'
                  : 'bg-white border-[#D5CFC8] text-text-muted-brand hover:border-warm hover:text-warm'
              }`}
            >
              {s === 'all' ? 'All Seasons' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="max-w-[1100px] mx-auto px-6 pt-11 pb-20">
        {currentSection && (
          <div key={currentSection.id}>
            {/* Basics tab gets custom layout */}
            {currentSection.id === 'basics' ? (
              <BasicsContent />
            ) : (
              <>
                {/* Section Header */}
                <div className="mb-8">
                  <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-sage mb-[10px]">
                    {currentSection.label}
                  </p>
                  <h2
                    className="font-serif font-light text-grove leading-[1.15] mb-3"
                    style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
                  >
                    {currentSection.section_title}
                  </h2>
                  {currentSection.description && (
                    <p className="font-serif text-[15px] italic text-text-muted-brand max-w-[640px] leading-[1.75]">
                      {currentSection.description}
                    </p>
                  )}
                  <div className="w-[60px] h-px bg-sage-light mt-5 mb-9" />
                </div>

                {/* Packages */}
                {currentSection.packages.length > 0 && (
                  <div className="flex flex-col gap-4 mb-12">
                    {currentSection.packages.map((pkg) => (
                      <PackageCardBlock key={pkg.id} card={{ title: pkg.title, price: pkg.price, description: pkg.description }} />
                    ))}
                  </div>
                )}

                {/* Items — grouped or flat */}
                {currentSection.items.length > 0 && (
                  hasGroups(currentSection) ? (
                    Object.entries(getGroupedItems(currentSection)).map(([group, items]) => {
                      const visibleItems = items.filter((item) => isItemVisible(item.diet));
                      if (visibleItems.length === 0) return null;
                      return (
                        <div key={group} className="mb-8">
                          {group !== '__ungrouped__' && (
                            <div className="flex items-center gap-3 mb-[14px] mt-9 first:mt-0">
                              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-sage">
                                {group}
                              </span>
                              <div className="flex-1 h-px bg-cream-dark" />
                            </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                            {visibleItems.map((item) => (
                              <MenuItemCard
                                key={item.id}
                                item={{
                                  name: item.name,
                                  description: item.description ?? undefined,
                                  price: item.price ?? undefined,
                                  diet: (item.diet as DietTag[] | undefined) ?? undefined,
                                  note: item.note ?? undefined,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-12">
                      {currentSection.items.map((item) => {
                        if (!isItemVisible(item.diet)) return null;
                        return (
                          <MenuItemCard
                            key={item.id}
                            item={{
                              name: item.name,
                              description: item.description ?? undefined,
                              price: item.price ?? undefined,
                              diet: (item.diet as DietTag[] | undefined) ?? undefined,
                              note: item.note ?? undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  )
                )}

                {/* Accordion (Bar section) */}
                {currentSection.accordions.length > 0 && (
                  <AccordionBlock
                    groups={currentSection.accordions.map((a) => ({
                      title: a.title,
                      subtitle: a.subtitle ?? undefined,
                      price: a.price ?? undefined,
                      emoji: a.emoji ?? undefined,
                      body: a.body,
                    }))}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ background: '#2C3E2D' }} className="py-16 px-10 text-center">
        <div
          className="mx-auto mb-6"
          style={{ width: 48, height: 1, background: '#C8A96E', opacity: 0.4 }}
        />
        <blockquote className="font-serif text-[22px] font-light italic text-cream/70 max-w-[540px] mx-auto leading-[1.6] mb-8">
          "Nothing here is templated. Nothing is rushed."
        </blockquote>
        <p className="font-sans text-[11px] tracking-[0.25em] uppercase text-sage-light/60 mb-6">
          Ready to start the conversation?
        </p>
        <a
          href="mailto:hello@gilbertsvillefarmhouse.com"
          className="inline-block font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-warm border border-warm/40 rounded-sm px-8 py-3 hover:bg-warm/10 transition-colors duration-200"
        >
          Contact the Kitchen
        </a>
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-white/25">
            Gilbertsville Farmhouse · South New Berlin, NY · Harvest 336 Culinary Program
          </p>
        </div>
      </footer>
    </div>
  );
}
