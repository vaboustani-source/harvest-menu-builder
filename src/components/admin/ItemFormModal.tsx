import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DbMenuItem } from '@/hooks/useMenuData';

type Props = {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  item?: DbMenuItem | null;
};

const DIET_OPTIONS = ['veg', 'vegan', 'gf', 'df'] as const;

export function ItemFormModal({ open, onClose, sectionId, item }: Props) {
  const qc = useQueryClient();
  const isEdit = !!item;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [groupLabel, setGroupLabel] = useState('');
  const [diet, setDiet] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description ?? '');
      setPrice(item.price ?? '');
      setNote(item.note ?? '');
      setGroupLabel(item.group_label ?? '');
      setDiet(item.diet ?? []);
    } else {
      setName(''); setDescription(''); setPrice(''); setNote(''); setGroupLabel(''); setDiet([]);
    }
    setError('');
  }, [item, open]);

  const toggleDiet = (tag: string) => {
    setDiet((prev) => prev.includes(tag) ? prev.filter((d) => d !== tag) : [...prev, tag]);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');

    const payload = {
      section_id: sectionId,
      name: name.trim(),
      description: description.trim() || null,
      price: price.trim() || null,
      note: note.trim() || null,
      group_label: groupLabel.trim() || null,
      diet: diet.length > 0 ? diet : [],
    };

    const { error: err } = isEdit
      ? await supabase.from('menu_items').update(payload).eq('id', item!.id)
      : await supabase.from('menu_items').insert({ ...payload, sort_order: 999 });

    if (err) { setError(err.message); }
    else { await qc.invalidateQueries({ queryKey: ['menu-data'] }); onClose(); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-green">
            {isEdit ? 'Edit Item' : 'Add Menu Item'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grilled NY Strip with Herb Butter" />
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional short description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Price</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $38pp" />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Note</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. passed, stationed" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Group Label</Label>
            <Input value={groupLabel} onChange={(e) => setGroupLabel(e.target.value)} placeholder="e.g. Salads, Entrées, Starches & Sides" />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Dietary Tags</Label>
            <div className="flex gap-2 flex-wrap">
              {DIET_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleDiet(tag)}
                  className={`px-3 py-1 rounded-full border text-[11px] font-sans uppercase tracking-widest transition-colors ${
                    diet.includes(tag)
                      ? 'bg-sage text-white border-sage'
                      : 'bg-white text-muted border-cream-dark hover:border-sage'
                  }`}
                >
                  {tag === 'veg' ? 'Vegetarian' : tag === 'vegan' ? 'Vegan' : tag === 'gf' ? 'GF' : 'Dairy-Free'}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-sans">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-green hover:bg-green/90 text-white font-sans text-xs tracking-widest uppercase">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
            </Button>
            <Button variant="outline" onClick={onClose} className="font-sans text-xs tracking-widest uppercase">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
