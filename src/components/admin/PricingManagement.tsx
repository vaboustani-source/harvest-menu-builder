import { useState } from 'react';
import { usePricingConfig, type PricingConfigRow } from '@/hooks/usePricingConfig';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryConfig {
  key: string;
  label: string;
  description: string;
  showIncludedCount?: boolean;
  showActiveToggle?: boolean;
  allowAdd?: boolean;
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'global', label: 'GLOBAL RULES', description: 'Base pricing and overage rates that apply across the entire menu.' },
  { key: 'welcome', label: 'WELCOME HOUR', description: 'Service upgrades available at the welcome table.' },
  { key: 'cocktail', label: 'COCKTAIL HOUR', description: 'Included selection count and per-item pricing for hors d\'oeuvres.', showIncludedCount: true, showActiveToggle: true, allowAdd: true },
  { key: 'reception', label: 'RECEPTION DINNER', description: 'Category limits and overage rates for reception courses.', showIncludedCount: true },
  { key: 'reception-items', label: 'RECEPTION — PREMIUM ITEMS', description: 'Individual upcharges for premium reception menu items.', showActiveToggle: true, allowAdd: true },
  { key: 'rehearsal', label: 'REHEARSAL DINNER — THEMES', description: 'Base price per rehearsal dinner theme.', showActiveToggle: true },
  { key: 'rehearsal-addons', label: 'REHEARSAL DINNER — ADD-ONS', description: 'Optional add-on pricing per theme.', showActiveToggle: true },
  { key: 'inclusions', label: 'MEAL INCLUSIONS', description: 'Optional upgrade stations and their per-person pricing.', showActiveToggle: true, allowAdd: true },
];

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function PricingManagement() {
  const { data: allItems, isLoading, updatePrice, updateIncludedCount, toggleActive, addItem, deleteItem } = usePricingConfig();

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Loading pricing…</p>
      </div>
    );
  }

  const itemsByCategory = (category: string) =>
    (allItems ?? []).filter(i => i.category === category).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8">
      <div className="border-b border-cream-dark pb-4">
        <h2 className="font-serif italic text-2xl text-green">Pricing Management</h2>
        <p className="font-sans text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
          All prices in the couple-facing builder pull from this table. Changes take effect immediately for new sessions.
        </p>
      </div>

      {CATEGORIES.map(cat => (
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
      ))}
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
    <div className="bg-white border border-cream-dark rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-cream-dark">
        <h3 className="font-sans text-[10px] tracking-[0.25em] uppercase font-semibold text-green">{config.label}</h3>
        <p className="font-sans text-[11px] text-muted-foreground mt-0.5">{config.description}</p>
        {latestUpdate && (
          <p className="font-sans text-[9px] text-muted-foreground mt-1 italic">Last updated: {formatTimestamp(latestUpdate)}</p>
        )}
      </div>

      <div className="divide-y divide-cream-dark">
        {items.map(item => (
          <PricingRow
            key={item.id}
            item={item}
            showIncludedCount={config.showIncludedCount}
            showActiveToggle={config.showActiveToggle}
            onUpdatePrice={onUpdatePrice}
            onUpdateIncludedCount={onUpdateIncludedCount}
            onToggleActive={onToggleActive}
            onDelete={config.allowAdd ? onDeleteItem : undefined}
          />
        ))}
      </div>

      {config.allowAdd && (
        <div className="px-5 py-3 border-t border-cream-dark bg-cream/30">
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
              <Button size="sm" onClick={handleAdd} className="bg-green hover:bg-green/90 text-white font-sans text-xs h-8">Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="font-sans text-xs h-8">Cancel</Button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 font-sans text-[11px] text-green hover:text-green/80 transition-colors"
            >
              <Plus size={12} /> Add item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PricingRow({
  item, showIncludedCount, showActiveToggle, onUpdatePrice, onUpdateIncludedCount, onToggleActive, onDelete,
}: {
  item: PricingConfigRow;
  showIncludedCount?: boolean;
  showActiveToggle?: boolean;
  onUpdatePrice: (id: string, price: number) => Promise<void>;
  onUpdateIncludedCount: (id: string, count: number) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}) {
  const [localPrice, setLocalPrice] = useState(String(item.price));
  const [localCount, setLocalCount] = useState(String(item.included_count ?? ''));

  const handlePriceBlur = async () => {
    const val = parseFloat(localPrice);
    if (!isNaN(val) && val !== item.price) {
      await onUpdatePrice(item.id, val);
      toast.success(`${item.item_label} updated to $${val}pp`);
    }
  };

  const handleCountBlur = async () => {
    const val = parseInt(localCount);
    if (!isNaN(val) && val !== item.included_count) {
      await onUpdateIncludedCount(item.id, val);
      toast.success(`${item.item_label} updated to ${val} included`);
    }
  };

  const handleToggle = async (checked: boolean) => {
    await onToggleActive(item.id, checked);
    toast.success(`${item.item_label} ${checked ? 'shown' : 'hidden'}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${item.item_label}"?`)) return;
    await onDelete?.(item.id);
    toast.success('Item removed.');
  };

  return (
    <div className={`flex items-center gap-3 px-5 py-3 ${!item.is_active ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[13px] text-charcoal truncate">{item.item_label}</p>
      </div>

      {showIncludedCount && item.included_count !== null && (
        <div className="flex items-center gap-1">
          <span className="font-sans text-[10px] text-muted-foreground whitespace-nowrap">Included:</span>
          <Input
            value={localCount}
            onChange={e => setLocalCount(e.target.value)}
            onBlur={handleCountBlur}
            type="number"
            className="w-14 h-7 text-center font-sans text-[12px]"
          />
        </div>
      )}

      <div className="flex items-center gap-1">
        <DollarSign size={11} className="text-muted-foreground" />
        <Input
          value={localPrice}
          onChange={e => setLocalPrice(e.target.value)}
          onBlur={handlePriceBlur}
          type="number"
          className="w-20 h-7 text-right font-sans text-[12px]"
        />
        <span className="font-sans text-[10px] text-muted-foreground">pp</span>
      </div>

      {showActiveToggle && (
        <Switch
          checked={item.is_active}
          onCheckedChange={handleToggle}
          className="scale-75"
        />
      )}

      {onDelete && (
        <button onClick={handleDelete} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
