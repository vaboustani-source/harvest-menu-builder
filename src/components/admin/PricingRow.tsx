import { useState } from 'react';
import { type PricingConfigRow } from '@/hooks/usePricingConfig';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PricingRowProps {
  item: PricingConfigRow;
  showIncludedCount?: boolean;
  showActiveToggle?: boolean;
  onUpdatePrice: (id: string, price: number) => Promise<void>;
  onUpdateIncludedCount: (id: string, count: number) => Promise<void>;
  onToggleActive: (id: string, active: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function PricingRow({
  item, showIncludedCount, showActiveToggle, onUpdatePrice, onUpdateIncludedCount, onToggleActive, onDelete,
}: PricingRowProps) {
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
