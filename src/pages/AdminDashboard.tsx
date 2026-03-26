import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useMenuData, type DbMenuItem, type DbMenuPackage, type DbMenuAccordion, type FullMenuSection } from '@/hooks/useMenuData';
import { useBasicsCards, type BasicsCard } from '@/hooks/useBasicsCards';
import { ItemFormModal } from '@/components/admin/ItemFormModal';
import { PackageFormModal } from '@/components/admin/PackageFormModal';
import { AccordionFormModal } from '@/components/admin/AccordionFormModal';
import { BasicsCardFormModal } from '@/components/admin/BasicsCardFormModal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, LogOut, ChevronDown, GripVertical, Diamond } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Sortable Row Wrapper ──────────────────────────────────────────────────────

function SortableRow({ id, children }: { id: string; children: (dragHandle: React.ReactNode) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative',
  };

  const handle = (
    <span
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-1.5 rounded text-muted-foreground hover:text-charcoal transition-colors touch-none"
      title="Drag to reorder"
    >
      <GripVertical size={13} />
    </span>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: sections, isLoading, error } = useMenuData();
  const { data: basicsGroups } = useBasicsCards();
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Ownership lock for Basics tab
  const [basicsUnlocked, setBasicsUnlocked] = useState(false);
  const [ownershipPrompt, setOwnershipPrompt] = useState(false);
  const [ownershipPw, setOwnershipPw] = useState('');
  const [ownershipError, setOwnershipError] = useState('');

  const handleSelectSection = (id: string) => {
    if (id === 'basics' && !basicsUnlocked) {
      setOwnershipPw('');
      setOwnershipError('');
      setOwnershipPrompt(true);
      return;
    }
    setActiveSectionId(id);
  };

  const handleOwnershipSubmit = () => {
    if (ownershipPw === 'Boustani6') {
      setBasicsUnlocked(true);
      setOwnershipPrompt(false);
      setActiveSectionId('basics');
    } else {
      setOwnershipError('Incorrect password.');
    }
  };

  // Modals
  const [itemModal, setItemModal] = useState<{ open: boolean; item?: DbMenuItem | null }>({ open: false });
  const [pkgModal, setPkgModal] = useState<{ open: boolean; pkg?: DbMenuPackage | null }>({ open: false });
  const [accModal, setAccModal] = useState<{ open: boolean; accordion?: DbMenuAccordion | null }>({ open: false });
  const [basicsCardModal, setBasicsCardModal] = useState<{ open: boolean; card?: BasicsCard | null }>({ open: false });

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

  const handleDeleteBasicsCard = async (id: string) => {
    if (!confirm('Delete this basics card?')) return;
    await supabase.from('basics_cards').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['basics-cards'] });
  };

  // Reorder handlers — optimistic update then persist
  const handleReorderItems = async (sectionId: string, oldIndex: number, newIndex: number, items: DbMenuItem[]) => {
    const reordered = arrayMove(items, oldIndex, newIndex);
    // Optimistic update via query cache
    qc.setQueryData<FullMenuSection[]>(['menu-data'], (prev) =>
      prev?.map((s) => s.id === sectionId ? { ...s, items: reordered.map((it, i) => ({ ...it, sort_order: i })) } : s)
    );
    await Promise.all(
      reordered.map((item, i) => supabase.from('menu_items').update({ sort_order: i }).eq('id', item.id))
    );
  };

  const handleReorderPackages = async (sectionId: string, oldIndex: number, newIndex: number, pkgs: DbMenuPackage[]) => {
    const reordered = arrayMove(pkgs, oldIndex, newIndex);
    qc.setQueryData<FullMenuSection[]>(['menu-data'], (prev) =>
      prev?.map((s) => s.id === sectionId ? { ...s, packages: reordered.map((p, i) => ({ ...p, sort_order: i })) } : s)
    );
    await Promise.all(
      reordered.map((pkg, i) => supabase.from('menu_packages').update({ sort_order: i }).eq('id', pkg.id))
    );
  };

  const handleReorderAccordions = async (sectionId: string, oldIndex: number, newIndex: number, accs: DbMenuAccordion[]) => {
    const reordered = arrayMove(accs, oldIndex, newIndex);
    qc.setQueryData<FullMenuSection[]>(['menu-data'], (prev) =>
      prev?.map((s) => s.id === sectionId ? { ...s, accordions: reordered.map((a, i) => ({ ...a, sort_order: i })) } : s)
    );
    await Promise.all(
      reordered.map((acc, i) => supabase.from('menu_accordions').update({ sort_order: i }).eq('id', acc.id))
    );
  };

  const activeSection = sections?.find((s) => s.id === activeSectionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Loading menu data…</p>
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
                  onClick={() => { handleSelectSection(s.id); setMobileOpen(false); }}
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
            <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-2">Sections</p>
            <nav className="space-y-0.5">
              {sections?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSection(s.id)}
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
            {activeSection && activeSectionId === 'basics' ? (
              /* ── Basics Card Editor ── */
              <div className="space-y-8">
                <div className="border-b border-cream-dark pb-4">
                  <h2 className="font-serif italic text-2xl text-green">{activeSection.section_title}</h2>
                  <p className="font-sans text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                    Edit the "What's Included" cards shown on the Basics tab. Cards are grouped by category and displayed as paired cards.
                  </p>
                </div>

                {/* Existing packages (Site Fee, Catering, Lodging) */}
                <SectionEditor
                  section={activeSection}
                  onAddItem={() => setItemModal({ open: true, item: null })}
                  onEditItem={(item) => setItemModal({ open: true, item })}
                  onDeleteItem={handleDeleteItem}
                  onReorderItems={handleReorderItems}
                  onAddPackage={() => setPkgModal({ open: true, pkg: null })}
                  onEditPackage={(pkg) => setPkgModal({ open: true, pkg })}
                  onDeletePackage={handleDeletePackage}
                  onReorderPackages={handleReorderPackages}
                  onAddAccordion={() => setAccModal({ open: true, accordion: null })}
                  onEditAccordion={(acc) => setAccModal({ open: true, accordion: acc })}
                  onDeleteAccordion={handleDeleteAccordion}
                  onReorderAccordions={handleReorderAccordions}
                />

                {/* Basics Cards (included/addon groups) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Included / Add-On Cards</h3>
                    <Button onClick={() => setBasicsCardModal({ open: true, card: null })} size="sm" variant="outline" className="font-sans text-xs gap-1.5 h-8">
                      <Plus size={13} /> Add Card
                    </Button>
                  </div>

                  {basicsGroups?.map((group) => (
                    <div key={group.label} className="mb-5">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-sage font-medium">{group.label}</span>
                        <div className="flex-1 h-px bg-cream-dark" />
                      </div>
                      <div className="space-y-2">
                        {group.cards.map((card) => (
                          <div key={card.id} className="bg-white border border-cream-dark rounded-lg px-4 py-3 group">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Diamond size={10} className={card.card_type === 'included' ? 'text-sage fill-sage' : 'text-warm'} />
                                  <p className="font-serif text-[14px] text-charcoal">{card.title}</p>
                                  <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                                    {card.card_type}
                                  </span>
                                </div>
                                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                                  {card.bullets.length} bullet{card.bullets.length !== 1 ? 's' : ''}: {card.bullets.map((b) => b.text).join(' · ').slice(0, 80)}…
                                </p>
                              </div>
                              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setBasicsCardModal({ open: true, card })} className="p-1.5 rounded hover:bg-cream-dark text-muted-foreground hover:text-charcoal transition-colors">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => handleDeleteBasicsCard(card.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {(!basicsGroups || basicsGroups.length === 0) && (
                    <p className="font-sans text-xs text-muted-foreground italic">No basics cards yet.</p>
                  )}
                </div>
              </div>
            ) : activeSection ? (
              <SectionEditor
                section={activeSection}
                onAddItem={() => setItemModal({ open: true, item: null })}
                onEditItem={(item) => setItemModal({ open: true, item })}
                onDeleteItem={handleDeleteItem}
                onReorderItems={handleReorderItems}
                onAddPackage={() => setPkgModal({ open: true, pkg: null })}
                onEditPackage={(pkg) => setPkgModal({ open: true, pkg })}
                onDeletePackage={handleDeletePackage}
                onReorderPackages={handleReorderPackages}
                onAddAccordion={() => setAccModal({ open: true, accordion: null })}
                onEditAccordion={(acc) => setAccModal({ open: true, accordion: acc })}
                onDeleteAccordion={handleDeleteAccordion}
                onReorderAccordions={handleReorderAccordions}
              />
            ) : null}
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
      <BasicsCardFormModal
        open={basicsCardModal.open}
        onClose={() => setBasicsCardModal({ open: false })}
        card={basicsCardModal.card}
        existingGroups={basicsGroups?.map((g) => g.label) ?? []}
      />

      {/* Ownership password dialog for Basics tab */}
      <Dialog open={ownershipPrompt} onOpenChange={(v) => !v && setOwnershipPrompt(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl text-green">Ownership Access</DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm text-muted-foreground">The Basics tab is restricted to ownership. Enter the ownership password to continue.</p>
          <div className="space-y-2 mt-2">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Password</Label>
            <Input
              type="password"
              value={ownershipPw}
              onChange={(e) => { setOwnershipPw(e.target.value); setOwnershipError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleOwnershipSubmit()}
              placeholder="Enter ownership password"
            />
            {ownershipError && <p className="text-xs text-red-600 font-sans">{ownershipError}</p>}
          </div>
          <div className="flex gap-3 mt-3">
            <Button onClick={handleOwnershipSubmit} className="flex-1 bg-green hover:bg-green/90 text-white font-sans text-xs tracking-widest uppercase">
              Unlock
            </Button>
            <Button variant="outline" onClick={() => setOwnershipPrompt(false)} className="font-sans text-xs tracking-widest uppercase">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Section Editor ────────────────────────────────────────────────────────────

type SectionEditorProps = {
  section: FullMenuSection;
  onAddItem: () => void;
  onEditItem: (item: DbMenuItem) => void;
  onDeleteItem: (id: string) => void;
  onReorderItems: (sectionId: string, oldIndex: number, newIndex: number, items: DbMenuItem[]) => void;
  onAddPackage: () => void;
  onEditPackage: (pkg: DbMenuPackage) => void;
  onDeletePackage: (id: string) => void;
  onReorderPackages: (sectionId: string, oldIndex: number, newIndex: number, pkgs: DbMenuPackage[]) => void;
  onAddAccordion: () => void;
  onEditAccordion: (acc: DbMenuAccordion) => void;
  onDeleteAccordion: (id: string) => void;
  onReorderAccordions: (sectionId: string, oldIndex: number, newIndex: number, accs: DbMenuAccordion[]) => void;
};

function SectionEditor({
  section,
  onAddItem, onEditItem, onDeleteItem, onReorderItems,
  onAddPackage, onEditPackage, onDeletePackage, onReorderPackages,
  onAddAccordion, onEditAccordion, onDeleteAccordion, onReorderAccordions,
}: SectionEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.items.findIndex((i) => i.id === active.id);
    const newIndex = section.items.findIndex((i) => i.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderItems(section.id, oldIndex, newIndex, section.items);
    }
  };

  const handlePackageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.packages.findIndex((p) => p.id === active.id);
    const newIndex = section.packages.findIndex((p) => p.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderPackages(section.id, oldIndex, newIndex, section.packages);
    }
  };

  const handleAccordionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.accordions.findIndex((a) => a.id === active.id);
    const newIndex = section.accordions.findIndex((a) => a.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderAccordions(section.id, oldIndex, newIndex, section.accordions);
    }
  };

  // Group items for display (flat list for DnD, grouped only visually)
  const grouped = section.items.reduce<Record<string, DbMenuItem[]>>((acc, item) => {
    const key = item.group_label ?? '__ungrouped__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const hasGroups = Object.keys(grouped).some((k) => k !== '__ungrouped__');

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="border-b border-cream-dark pb-4">
        <h2 className="font-serif italic text-2xl text-green">{section.section_title}</h2>
        {section.description && (
          <p className="font-sans text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">{section.description}</p>
        )}
        <p className="font-sans text-[10px] text-muted-foreground/60 mt-2 flex items-center gap-1">
          <GripVertical size={10} /> Drag the grip handle to reorder entries
        </p>
      </div>

      {/* Packages */}
      {(section.packages.length > 0 || ['basics', 'desserts', 'packages'].includes(section.id)) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Package Cards</h3>
            <Button onClick={onAddPackage} size="sm" variant="outline" className="font-sans text-xs gap-1.5 h-8">
              <Plus size={13} /> Add Package
            </Button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePackageDragEnd}>
            <SortableContext items={section.packages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {section.packages.map((pkg) => (
                  <SortableRow key={pkg.id} id={pkg.id}>
                    {(handle) => (
                      <div className="bg-white border border-cream-dark rounded-lg px-4 py-3 flex items-start gap-2 group">
                        <div className="shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity">{handle}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <p className="font-serif text-[14px] text-charcoal">{pkg.title}</p>
                            <span className="font-sans text-[11px] font-medium text-warm">{pkg.price}</span>
                          </div>
                          <p className="font-sans text-xs text-muted-foreground mt-0.5 leading-relaxed">{pkg.description}</p>
                        </div>
                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEditPackage(pkg)} className="p-1.5 rounded hover:bg-cream-dark text-muted-foreground hover:text-charcoal transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => onDeletePackage(pkg.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </SortableRow>
                ))}
                {section.packages.length === 0 && (
                  <p className="font-sans text-xs text-muted-foreground italic">No packages yet.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Menu Items */}
      {(section.items.length > 0 || !['bar'].includes(section.id)) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Menu Items</h3>
            <Button onClick={onAddItem} size="sm" variant="outline" className="font-sans text-xs gap-1.5 h-8">
              <Plus size={13} /> Add Item
            </Button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
            <SortableContext items={section.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-5">
                  {hasGroups && group !== '__ungrouped__' && (
                    <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-2 mt-3">{group}</p>
                  )}
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <SortableRow key={item.id} id={item.id}>
                        {(handle) => (
                          <div className="bg-white border border-cream-dark rounded-lg px-4 py-3 flex items-center gap-2 group">
                            <div className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">{handle}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-serif text-[13.5px] text-charcoal leading-snug">{item.name}</p>
                                {item.price && <span className="font-sans text-[11px] font-medium text-warm">{item.price}</span>}
                                {item.note && <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">{item.note}</span>}
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
                              <button onClick={() => onEditItem(item)} className="p-1.5 rounded hover:bg-cream-dark text-muted-foreground hover:text-charcoal transition-colors">
                                <Pencil size={13} />
                              </button>
                              <button onClick={() => onDeleteItem(item.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </SortableRow>
                    ))}
                  </div>
                </div>
              ))}
              {section.items.length === 0 && (
                <p className="font-sans text-xs text-muted-foreground italic">No items yet. Add your first item above.</p>
              )}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Accordions */}
      {(section.accordions.length > 0 || section.id === 'bar') && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Accordion Entries</h3>
            <Button onClick={onAddAccordion} size="sm" variant="outline" className="font-sans text-xs gap-1.5 h-8">
              <Plus size={13} /> Add Entry
            </Button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleAccordionDragEnd}>
            <SortableContext items={section.accordions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {section.accordions.map((acc) => (
                  <SortableRow key={acc.id} id={acc.id}>
                    {(handle) => (
                      <div className="bg-white border border-cream-dark rounded-lg px-4 py-3 flex items-start gap-2 group">
                        <div className="shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity">{handle}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {acc.emoji && <span>{acc.emoji}</span>}
                            <p className="font-serif text-[14px] text-charcoal">{acc.title}</p>
                            {acc.price && <span className="font-sans text-[11px] font-medium text-warm">{acc.price}</span>}
                          </div>
                          <p className="font-sans text-xs text-muted-foreground mt-0.5 line-clamp-2">{acc.body}</p>
                        </div>
                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEditAccordion(acc)} className="p-1.5 rounded hover:bg-cream-dark text-muted-foreground hover:text-charcoal transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => onDeleteAccordion(acc.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </SortableRow>
                ))}
                {section.accordions.length === 0 && (
                  <p className="font-sans text-xs text-muted-foreground italic">No accordion entries yet.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
