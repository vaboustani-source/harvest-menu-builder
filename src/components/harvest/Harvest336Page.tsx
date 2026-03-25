import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { menuSections } from '@/data/menuData';
import type { DietTag } from '@/data/menuData';
import { DIET_FILTER_OPTIONS } from './DietTag';
import { MenuItemCard } from './MenuItemCard';
import { PackageCardBlock } from './PackageCardBlock';
import { AccordionBlock } from './AccordionBlock';


// Cross SVG pattern for hero
const CROSS_PATTERN =
  "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237A9E7E' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

export function Harvest336Page() {
  const [activeTab, setActiveTab] = useState('basics');
  const [activeFilter, setActiveFilter] = useState<'all' | DietTag>('all');
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
    setMobileNavOpen(false);
  };


  const currentSection = menuSections.find((s) => s.id === activeTab);

  const isItemVisible = (diet?: DietTag[]) => {
    if (activeFilter === 'all') return true;
    return diet?.includes(activeFilter) ?? false;
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden text-center"
        style={{ background: '#2C3E2D', padding: '72px 40px 60px' }}
      >
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
      <div className="bg-white border-b border-cream-dark px-10 py-7 text-center">
        <p className="font-serif text-[18px] font-light italic text-text-muted-brand leading-[1.75] mx-auto max-w-[760px]">
          Every menu is built in conversation with you —{' '}
          <strong className="text-grove not-italic font-medium">your tastes</strong>,{' '}
          <strong className="text-grove not-italic font-medium">your guests</strong>,{' '}
          <strong className="text-grove not-italic font-medium">your weekend</strong>. Nothing here
          is templated. Nothing is rushed. What you see below is a living menu: our current seasonal
          offerings, updated as the kitchen evolves.
        </p>
      </div>

      {/* ── STICKY NAV ───────────────────────────────────────────────── */}
      <div
        ref={navRef}
        className={`sticky top-0 z-50 bg-white border-b border-cream-dark transition-shadow duration-200 ${
          scrolled ? 'shadow-nav' : ''
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {menuSections.map((section) => (
              <button
                key={section.id}
                ref={(el) => { tabRefs.current[section.id] = el; }}
                onClick={() => {
                  setActiveTab(section.id);
                  setActiveFilter('all');
                }}
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

      {/* ── DIET FILTER BAR ──────────────────────────────────────────── */}
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
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="max-w-[1100px] mx-auto px-6 pt-11 pb-20">
        {currentSection && (
          <div key={currentSection.id}>
            {/* Section Header */}
            <div className="mb-8">
              <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-sage mb-[10px]">
                {currentSection.label}
              </p>
              <h2
                className="font-serif font-light text-grove leading-[1.15] mb-3"
                style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
              >
                {currentSection.sectionTitle}
              </h2>
              {currentSection.description && (
                <p className="font-serif text-[15px] italic text-text-muted-brand max-w-[640px] leading-[1.75]">
                  {currentSection.description}
                </p>
              )}
              <div className="w-[60px] h-px bg-sage-light mt-5 mb-9" />
            </div>

            {/* Packages (top — for Basics, Packages) */}
            {currentSection.packages && currentSection.id !== 'desserts' && (
              <div className="flex flex-col gap-4 mb-12">
                {currentSection.packages.map((pkg, i) => (
                  <PackageCardBlock key={i} card={pkg} />
                ))}
              </div>
            )}

            {/* Dessert packages (shown above items) */}
            {currentSection.id === 'desserts' && currentSection.packages && (
              <div className="flex flex-col gap-4 mb-10">
                {currentSection.packages.map((pkg, i) => (
                  <PackageCardBlock key={i} card={pkg} />
                ))}
              </div>
            )}

            {/* Flat items list */}
            {currentSection.items && currentSection.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-12">
                {currentSection.items.map((item, i) => {
                  const hidden = !isItemVisible(item.diet);
                  return <MenuItemCard key={i} item={item} hidden={hidden} />;
                })}
              </div>
            )}

            {/* Grouped items (Reception) */}
            {currentSection.itemGroups?.map((group) => {
              const visibleItems = group.items.filter((item) => isItemVisible(item.diet));
              if (visibleItems.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="flex items-center gap-3 mb-[14px] mt-9 first:mt-0">
                    <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-sage">
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-cream-dark" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-2">
                    {visibleItems.map((item, i) => (
                      <MenuItemCard key={i} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Accordion (Bar section) */}
            {currentSection.accordions && (
              <AccordionBlock groups={currentSection.accordions} />
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
