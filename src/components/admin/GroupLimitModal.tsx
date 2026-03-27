import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  groupLabel: string;
  currentLimit?: { id: string; included_count: number; extra_price_note: string | null } | null;
};

export function GroupLimitModal({ open, onClose, sectionId, groupLabel, currentLimit }: Props) {
  const qc = useQueryClient();
  const [count, setCount] = useState(String(currentLimit?.included_count ?? 0));
  const [priceNote, setPriceNote] = useState(currentLimit?.extra_price_note ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      section_id: sectionId,
      group_label: groupLabel,
      included_count: parseInt(count) || 0,
      extra_price_note: priceNote.trim() || null,
    };

    if (currentLimit) {
      await supabase.from('section_group_limits').update(payload).eq('id', currentLimit.id);
    } else {
      await supabase.from('section_group_limits').insert(payload);
    }

    await qc.invalidateQueries({ queryKey: ['group-limits'] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-lg text-green">
            Set Included Limit
          </DialogTitle>
        </DialogHeader>
        <p className="font-sans text-xs text-muted-foreground">
          <span className="font-medium text-charcoal">{groupLabel}</span> — How many items are included in the base package?
        </p>
        <div className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Included Count</Label>
            <Input type="number" value={count} onChange={(e) => setCount(e.target.value)} min="0" placeholder="e.g. 3" />
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Extra Item Price Note</Label>
            <Input value={priceNote} onChange={(e) => setPriceNote(e.target.value)} placeholder="e.g. +$8pp per extra" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full border border-primary bg-primary-foreground text-primary font-sans text-xs tracking-widest uppercase hover:bg-primary-foreground/90">
            {saving ? 'Saving…' : 'Save Limit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
