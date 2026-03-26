import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useMenuData, type DbMenuItem, type DbMenuPackage, type DbMenuAccordion, type FullMenuSection } from '@/hooks/useMenuData';
import { ItemFormModal } from '@/components/admin/ItemFormModal';
import { PackageFormModal } from '@/components/admin/PackageFormModal';
import { AccordionFormModal } from '@/components/admin/AccordionFormModal';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, LogOut, ChevronDown } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: sections, isLoading, error } = useMenuData();
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modals
  const [itemModal, setItemModal] = useState<{ open: boolean; item?: DbMenuItem | null }>({ open: false });
  const [pkgModal, setPkgModal] = useState<{ open: boolean; pkg?: DbMenuPackage | null }>({ open: false });
  const [accModal, setAccModal] = useState<{ open: boolean; accordion?: DbMenuAccordion | null }>({ open: false });

  useEffect(() => {
    if (sections && sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    await supabase.from('menu_items').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['menu-data'] });
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    await supabase.from('menu_packages').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['menu-data'] });
  };

  const handleDeleteAccordion = async (id: string) => {
    if (!confirm('Delete this accordion entry?')) return;
    await supabase.from('menu_accordions').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['menu-data'] });
  };

  const activeSection = sections?.find((s) => s.id === activeSectionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-sans text-xs uppercase tracking-widest text-muted animate-pulse">Loading menu data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-sans text-xs text-red-600">Error loading data. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-green text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-nav">
        <div>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase opacity-60">Gilbertsville Farmhouse</p>
          <h1 className="font-serif italic text-xl leading-none">Harvest 336 <span className="font-sans text-xs tracking-widest not-italic opacity-60 ml-1">Admin</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="font-sans text-[11px] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity">
            View Menu ↗
          </a>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:text-white/80 hover:bg-white/10 font-sans text-xs uppercase tracking-widest px-3 gap-1.5">
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Section selector - mobile dropdown */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-full flex items-center justify-between bg-white border border-cream-dark rounded-lg px-4 py-3 font-sans text-sm text-charcoal"
          >
            <span>{activeSection?.label ?? 'Select section'}</span>
            <ChevronDown size={16} className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileOpen && (
            <div className="mt-1 bg-white border border-cream-dark rounded-lg shadow-card overflow-hidden">
              {sections?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSectionId(s.id); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-3 font-sans text-sm border-b border-cream-dark last:border-0 transition-colors ${
                    s.id === activeSectionId ? 'bg-sage/10 text-green font-medium' : 'text-charcoal hover:bg-cream'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Section sidebar - desktop */}
          <aside className="hidden md:block w-48 shrink-0">
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted mb-3 px-2">Sections</p>
            <nav className="space-y-0.5">
              {sections?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSectionId(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg font-sans text-[13px] transition-colors ${
                    s.id === activeSectionId
                      ? 'bg-green text-white'
                      : 'text-charcoal hover:bg-cream-dark'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {activeSection && <SectionEditor
              section={activeSection}
              onAddItem={() => setItemModal({ open: true, item: null })}
              onEditItem={(item) => setItemModal({ open: true, item })}
              onDeleteItem={handleDeleteItem}
              onAddPackage={() => setPkgModal({ open: true, pkg: null })}
              onEditPackage={(pkg) => setPkgModal({ open: true, pkg })}
              onDeletePackage={handleDeletePackage}
              onAddAccordion={() => setAccModal({ open: true, accordion: null })}
              onEditAccordion={(acc) => setAccModal({ open: true, accordion: acc })}
              onDeleteAccordion={handleDeleteAccordion}
            />}
          </main>
        </div>
      </div>

      {/* Modals */}
      <ItemFormModal
        open={itemModal.open}
        onClose={() => setItemModal({ open: false })}
        sectionId={activeSectionId}
        item={itemModal.item}
      />
      <PackageFormModal
        open={pkgModal.open}
        onClose={() => setPkgModal({ open: false })}
        sectionId={activeSectionId}
        pkg={pkgModal.pkg}
      />
      <AccordionFormModal
        open={accModal.open}
        onClose={() => setAccModal({ open: false })}
        sectionId={activeSectionId}
        accordion={accModal.accordion}
      />
    </div>
  );
}

// ── Section Editor ───────────────────────────────────────────────────────────

type SectionEditorProps = {
  section: FullMenuSection;
  onAddItem: () => void;
  onEditItem: (item: DbMenuItem) => void;
  onDeleteItem: (id: string) => void;
  onAddPackage: () => void;
  onEditPackage: (pkg: DbMenuPackage) => void;
  onDeletePackage: (id: string) => void;
  onAddAccordion: () => void;
  onEditAccordion: (acc: DbMenuAccordion) => void;
  onDeleteAccordion: (id: string) => void;
};

function SectionEditor({
  section, onAddItem, onEditItem, onDeleteItem,
  onAddPackage, onEditPackage, onDeletePackage,
  onAddAccordion, onEditAccordion, onDeleteAccordion,
}: SectionEditorProps) {
  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="border-b border-cream-dark pb-4">
        <h2 className="font-serif italic text-2xl text-green">{section.section_title}</h2>
        {section.description && (
          <p className="font-sans text-xs text-muted mt-1 leading-relaxed max-w-xl">{section.description}</p>
        )}
      </div>

      {/* Packages */}
      {(section.packages.length > 0 || ['basics','desserts','packages'].includes(section.id)) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-[11px] uppercase tracking-widest text-muted">Package Cards</h3>
            <Button onClick={onAddPackage} size="sm" variant="outline" className="font-sans text-xs gap-1.5 h-8">
              <Plus size={13} /> Add Package
            </Button>
          </div>
          <div className="space-y-2">
            {section.packages.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-cream-dark rounded-lg px-4 py-3 flex items-start justify-between gap-4 group">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-serif text-[14px] text-charcoal">{pkg.title}</p>
                    <span className="font-sans text-[11px] font-medium text-warm">{pkg.price}</span>
                  </div>
                  <p className="font-sans text-xs text-muted mt-0.5 leading-relaxed">{pkg.description}</p>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEditPackage(pkg)} className="p-1.5 rounded hover:bg-cream-dark text-muted hover:text-charcoal transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onDeletePackage(pkg.id)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {section.packages.length === 0 && (
              <p className="font-sans text-xs text-muted italic">No packages yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Menu Items */}
      {(section.items.length > 0 || !['bar'].includes(section.id)) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-[11px] uppercase tracking-widest text-muted">Menu Items</h3>
            <Button onClick={onAddItem} size="sm" variant="outline" className="font-sans text-xs gap-1.5 h-8">
              <Plus size={13} /> Add Item
            </Button>
          </div>

          {/* Group by group_label if present */}
          {(() => {
            const grouped = section.items.reduce<Record<string, DbMenuItem[]>>((acc, item) => {
              const key = item.group_label ?? '__ungrouped__';
              if (!acc[key]) acc[key] = [];
              acc[key].push(item);
              return acc;
            }, {});

            const hasGroups = Object.keys(grouped).some((k) => k !== '__ungrouped__');

            return Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-5">
                {hasGroups && group !== '__ungrouped__' && (
                  <p className="font-sans text-[10px] uppercase tracking-widest text-muted mb-2 mt-3">{group}</p>
                )}
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white border border-cream-dark rounded-lg px-4 py-3 flex items-center justify-between gap-4 group">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-serif text-[13.5px] text-charcoal leading-snug">{item.name}</p>
                          {item.price && <span className="font-sans text-[11px] font-medium text-warm">{item.price}</span>}
                          {item.note && <span className="font-sans text-[10px] uppercase tracking-widest text-muted opacity-60">{item.note}</span>}
                        </div>
                        {item.diet && item.diet.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {item.diet.map((tag) => (
                              <span key={tag} className="font-sans text-[9px] uppercase tracking-widest border rounded-sm px-1.5 py-0.5 text-sage border-sage">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditItem(item)} className="p-1.5 rounded hover:bg-cream-dark text-muted hover:text-charcoal transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => onDeleteItem(item.id)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}

          {section.items.length === 0 && (
            <p className="font-sans text-xs text-muted italic">No items yet. Add your first item above.</p>
          )}
        </div>
      )}

      {/* Accordions */}
      {(section.accordions.length > 0 || section.id === 'bar') && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-[11px] uppercase tracking-widest text-muted">Accordion Entries</h3>
            <Button onClick={onAddAccordion} size="sm" variant="outline" className="font-sans text-xs gap-1.5 h-8">
              <Plus size={13} /> Add Entry
            </Button>
          </div>
          <div className="space-y-2">
            {section.accordions.map((acc) => (
              <div key={acc.id} className="bg-white border border-cream-dark rounded-lg px-4 py-3 flex items-start justify-between gap-4 group">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {acc.emoji && <span>{acc.emoji}</span>}
                    <p className="font-serif text-[14px] text-charcoal">{acc.title}</p>
                    {acc.price && <span className="font-sans text-[11px] font-medium text-warm">{acc.price}</span>}
                  </div>
                  <p className="font-sans text-xs text-muted mt-0.5 line-clamp-2">{acc.body}</p>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEditAccordion(acc)} className="p-1.5 rounded hover:bg-cream-dark text-muted hover:text-charcoal transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onDeleteAccordion(acc.id)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {section.accordions.length === 0 && (
              <p className="font-sans text-xs text-muted italic">No accordion entries yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
