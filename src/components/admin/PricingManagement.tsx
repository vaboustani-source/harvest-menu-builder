import { useState } from 'react';
import { usePricingConfig, type PricingConfigRow } from '@/hooks/usePricingConfig';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { GroupedPricingList } from './GroupedPricingList';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryConfig {
  key: string;
  label: string;
  description: string;
  showIncludedCount?: boolean;
  showActiveToggle?: boolean;
  allowAdd?: boolean;
}

interface SidebarSection {
  id: string;
  label: string;
  categories: CategoryConfig[];
}

const SECTIONS: SidebarSection[] = [
  {
    id: 'global',
    label: 'Global Rules',
    categories: [
      { key: 'global', label: 'GLOBAL RULES', description: 'Base pricing and overage rates that apply across the entire menu.' },
    ],
  },
  {
    id: 'welcome',
    label: 'Welcome Hour',
    categories: [
      { key: 'welcome', label: 'WELCOME HOUR', description: 'Service upgrades available at the welcome table.' },
    ],
  },
  {
    id: 'cocktail',
    label: 'Cocktail Hour',
    categories: [
      { key: 'cocktail', label: 'COCKTAIL HOUR', description: 'Included selection count and per-item pricing for hors d\'oeuvres.', showIncludedCount: true, showActiveToggle: true, allowAdd: true },
    ],
  },
  {
    id: 'reception',
    label: 'Reception',
    categories: [
      { key: 'reception', label: 'RECEPTION DINNER', description: 'Category limits and overage rates for reception courses.', showIncludedCount: true },
      { key: 'reception-items', label: 'RECEPTION — PREMIUM ITEMS', description: 'Individual upcharges for premium reception menu items.', showActiveToggle: true, allowAdd: true },
    ],
  },
  {
    id: 'rehearsal',
    label: 'Rehearsal Dinner',
    categories: [
      { key: 'rehearsal', label: 'REHEARSAL DINNER — THEMES', description: 'Base price per rehearsal dinner theme.', showActiveToggle: true },
      { key: 'rehearsal-addons', label: 'REHEARSAL DINNER — ADD-ONS', description: 'Optional add-on pricing per theme.', showActiveToggle: true },
    ],
  },
  {
    id: 'inclusions',
    label: 'Meal Inclusions',
    categories: [
      { key: 'inclusions', label: 'MEAL INCLUSIONS', description: 'Optional upgrade stations and their per-person pricing.', showActiveToggle: true, allowAdd: true },
    ],
  },
  {
    id: 'desserts',
    label: 'Desserts',
    categories: [],
  },
  {
    id: 'bar',
    label: 'Bar',
    categories: [],
  },
  {
    id: 'packages',
    label: 'Weekend Packages',
    categories: [],
  },
];

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function PricingManagement() {
  const { data: allItems, isLoading, updatePrice, updateIncludedCount, toggleActive, addItem, deleteItem } = usePricingConfig();
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Loading pricing…</p>
      </div>
    );
  }

  const itemsByCategory = (category: string) =>
    (allItems ?? []).filter(i => i.category === category).sort((a, b) => a.sort_order - b.sort_order);

  const currentSection = SECTIONS.find(s => s.id === activeSection) ?? SECTIONS[0];

  return (
    <div>
      <div className="border-b border-cream-dark pb-4 mb-6">
        <h2 className="font-serif italic text-2xl text-green">Pricing Management</h2>
        <p className="font-sans text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
          All prices in the couple-facing builder pull from this table. Changes take effect immediately for new sessions.
        </p>
      </div>

      <div className="flex gap-6 min-h-[600px]">
        {/* Left sidebar */}
        <nav className="w-[210px] shrink-0">
          <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-3 px-2">Sections</p>
          <div className="space-y-0.5">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg font-sans text-[13px] transition-colors ${
                  s.id === activeSection
                    ? 'bg-green text-white'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Right content panel */}
        <ScrollArea className="flex-1 min-w-0">
          <div className="space-y-8 pr-2">
            {currentSection.categories.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border">
                <p className="font-serif italic text-lg text-foreground mb-1">No pricing rules yet</p>
                <p className="font-sans text-xs text-muted-foreground">
                  Pricing for {currentSection.label} has not been configured.
                </p>
              </div>
            ) : (
              currentSection.categories.map(cat => (
                <PricingSection
                  key={cat.key}
                  config={cat}
                  items={itemsByCategory(cat.key)}
                  onUpdatePrice={updatePrice}
                  onUpdateIncludedCount={updateIncludedCount}
                  onToggleActive={toggleActive}
                  onAddItem={addItem}
                  onDeleteItem={deleteItem}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function PricingSection({
  config, items, onUpdatePrice, onUpdateIncludedCount, onToggleActive, onAddItem, onDeleteItem,
}: {
  config: CategoryConfig;
  items: PricingConfigRow[];
  onUpdatePrice: (id: string, price: number) => Promise<void>;
  onUpdateIncludedCount: (id: string, count: number) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onAddItem: (item: { category: string; item_key: string; item_label: string; price: number; sort_order: number }) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const latestUpdate = items.length > 0
    ? items.reduce((latest, i) => i.updated_at > latest ? i.updated_at : latest, items[0].updated_at)
    : null;

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    const key = `custom-${config.key}-${Date.now()}`;
    await onAddItem({
      category: config.key,
      item_key: key,
      item_label: newLabel.trim(),
      price: parseFloat(newPrice) || 0,
      sort_order: items.length,
    });
    setNewLabel('');
    setNewPrice('');
    setAdding(false);
    toast.success('Item added.');
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-primary">{config.label}</h3>
        <p className="font-sans text-[11px] text-muted-foreground mt-0.5">{config.description}</p>
        {latestUpdate && (
          <p className="font-sans text-[9px] text-muted-foreground mt-1 italic">Last updated: {formatTimestamp(latestUpdate)}</p>
        )}
      </div>

      <GroupedPricingList
        items={items}
        showIncludedCount={config.showIncludedCount}
        showActiveToggle={config.showActiveToggle}
        onUpdatePrice={onUpdatePrice}
        onUpdateIncludedCount={onUpdateIncludedCount}
        onToggleActive={onToggleActive}
        onDelete={config.allowAdd ? onDeleteItem : undefined}
      />

      {config.allowAdd && (
        <div className="px-5 py-3 border-t border-border bg-secondary/30">
          {adding ? (
            <div className="flex items-center gap-3">
              <Input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Item name"
                className="flex-1 font-sans text-[13px] h-8"
              />
              <div className="flex items-center gap-1">
                <span className="font-sans text-[12px] text-muted-foreground">$</span>
                <Input
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="0"
                  type="number"
                  className="w-20 font-sans text-[13px] h-8"
                />
                <span className="font-sans text-[11px] text-muted-foreground">pp</span>
              </div>
              <Button size="sm" onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-xs h-8">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="font-sans text-xs h-8">Cancel</Button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 font-sans text-[11px] text-primary hover:text-primary/80 transition-colors"
            >
              <Plus size={12} /> Add item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
