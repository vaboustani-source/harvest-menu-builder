import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { PriceInput, stripPrice, formatPrice } from '@/components/admin/PriceInput';
import type { BasicsCard, BulletItem } from '@/hooks/useBasicsCards';

type Props = {
  open: boolean;
  onClose: () => void;
  card?: BasicsCard | null;
  existingGroups: string[];
};

export function BasicsCardFormModal({ open, onClose, card, existingGroups }: Props) {
  const qc = useQueryClient();
  const [groupLabel, setGroupLabel] = useState('');
  const [customGroup, setCustomGroup] = useState('');
  const [useCustomGroup, setUseCustomGroup] = useState(false);
  const [title, setTitle] = useState('');
  const [cardType, setCardType] = useState<'included' | 'addon'>('included');
  const [bullets, setBullets] = useState<BulletItem[]>([{ text: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setGroupLabel(card.group_label);
      setTitle(card.title);
      setCardType(card.card_type);
      setBullets(card.bullets.length > 0 ? card.bullets : [{ text: '' }]);
      setUseCustomGroup(false);
      setCustomGroup('');
    } else {
      setGroupLabel(existingGroups[0] ?? '');
      setTitle('');
      setCardType('included');
      setBullets([{ text: '' }]);
      setUseCustomGroup(false);
      setCustomGroup('');
    }
  }, [card, open, existingGroups]);

  const handleBulletChange = (index: number, field: 'text' | 'price', value: string) => {
    setBullets((prev) => prev.map((b, i) => i === index ? { ...b, [field]: value || undefined } : b));
  };

  // When loading bullets for edit, strip price formatting
  useEffect(() => {
    if (card && card.bullets.length > 0) {
      setBullets(card.bullets.map(b => ({ ...b, price: b.price ? stripPrice(b.price) : undefined })));
    }
  }, [card, open]);

  const addBullet = () => setBullets((prev) => [...prev, { text: '' }]);
  const removeBullet = (index: number) => setBullets((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    const finalGroup = useCustomGroup ? customGroup.trim() : groupLabel;
    if (!finalGroup || !title.trim()) return;

    setSaving(true);
    const cleanBullets = bullets.filter((b) => b.text.trim()).map(b => ({
      text: b.text,
      price: b.price ? formatPrice(b.price) : undefined,
    }));

    const payload = {
      group_label: finalGroup,
      title: title.trim(),
      card_type: cardType,
      bullets: cleanBullets,
    };

    if (card) {
      await supabase.from('basics_cards').update(payload).eq('id', card.id);
    } else {
      // Get max sort_order
      const { data: existing } = await supabase.from('basics_cards').select('sort_order').order('sort_order', { ascending: false }).limit(1);
      const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;
      await supabase.from('basics_cards').insert({ ...payload, sort_order: nextOrder });
    }

    qc.invalidateQueries({ queryKey: ['basics-cards'] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-cream max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-grove text-lg">
            {card ? 'Edit Basics Card' : 'Add Basics Card'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Group */}
          <div>
            <Label className="text-charcoal text-xs font-sans uppercase tracking-widest">Card Group</Label>
            {!useCustomGroup ? (
              <div className="flex gap-2 mt-1">
                <Select value={groupLabel} onValueChange={setGroupLabel}>
                  <SelectTrigger className="bg-white border-cream-dark text-charcoal">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingGroups.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => setUseCustomGroup(true)}>
                  New Group
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Input
                  value={customGroup}
                  onChange={(e) => setCustomGroup(e.target.value)}
                  placeholder="e.g. Late-Night Snacks"
                  className="bg-white border-cream-dark text-charcoal"
                />
                <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => setUseCustomGroup(false)}>
                  Existing
                </Button>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <Label className="text-charcoal text-xs font-sans uppercase tracking-widest">Card Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 bg-white border-cream-dark text-charcoal" placeholder="e.g. What's Always Included" />
          </div>

          {/* Type */}
          <div>
            <Label className="text-charcoal text-xs font-sans uppercase tracking-widest">Card Type</Label>
            <Select value={cardType} onValueChange={(v) => setCardType(v as 'included' | 'addon')}>
              <SelectTrigger className="mt-1 bg-white border-cream-dark text-charcoal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="included">Included (green diamonds)</SelectItem>
                <SelectItem value="addon">Add-On (gold plus signs)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bullets */}
          <div>
            <Label className="text-charcoal text-xs font-sans uppercase tracking-widest mb-2 block">Bullet Points</Label>
            <div className="space-y-2">
              {bullets.map((bullet, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    value={bullet.text}
                    onChange={(e) => handleBulletChange(i, 'text', e.target.value)}
                    placeholder="Bullet text"
                    className="flex-1 bg-white border-cream-dark text-charcoal text-sm"
                  />
                  <PriceInput
                    value={bullet.price ?? ''}
                    onChange={(val) => handleBulletChange(i, 'price', val)}
                    placeholder="20"
                    className="w-32"
                  />
                  {bullets.length > 1 && (
                    <button onClick={() => removeBullet(i)} className="p-1.5 text-muted-foreground hover:text-red-600 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={addBullet} className="mt-2 text-xs text-sage gap-1">
              <Plus size={12} /> Add Bullet
            </Button>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-green text-white hover:bg-green/90">
            {saving ? 'Saving…' : card ? 'Update Card' : 'Add Card'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
