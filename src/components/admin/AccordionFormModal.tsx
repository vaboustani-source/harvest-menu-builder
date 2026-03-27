import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DbMenuAccordion } from '@/hooks/useMenuData';

type Props = {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  accordion?: DbMenuAccordion | null;
};

export function AccordionFormModal({ open, onClose, sectionId, accordion }: Props) {
  const qc = useQueryClient();
  const isEdit = !!accordion;
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [emoji, setEmoji] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (accordion) {
      setTitle(accordion.title); setSubtitle(accordion.subtitle ?? '');
      setPrice(accordion.price ?? ''); setEmoji(accordion.emoji ?? ''); setBody(accordion.body);
    } else { setTitle(''); setSubtitle(''); setPrice(''); setEmoji(''); setBody(''); }
    setError('');
  }, [accordion, open]);

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) { setError('Title and body are required.'); return; }
    setSaving(true); setError('');
    const payload = {
      section_id: sectionId, title: title.trim(), subtitle: subtitle.trim() || null,
      price: price.trim() || null, emoji: emoji.trim() || null, body: body.trim(),
    };
    const { error: err } = isEdit
      ? await supabase.from('menu_accordions').update(payload).eq('id', accordion!.id)
      : await supabase.from('menu_accordions').insert({ ...payload, sort_order: 999 });
    if (err) { setError(err.message); }
    else { await qc.invalidateQueries({ queryKey: ['menu-data'] }); onClose(); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-green">{isEdit ? 'Edit Accordion' : 'Add Accordion Entry'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Premium Open Bar" />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Price</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $58pp" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Subtitle</Label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Full spirits" />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Emoji</Label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="e.g. 🥃" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Body *</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Full description of what's included…" />
          </div>
          {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary-foreground text-primary font-sans text-xs tracking-widest uppercase hover:bg-primary-foreground/90">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Entry'}
            </Button>
            <Button variant="outline" onClick={onClose} className="font-sans text-xs tracking-widest uppercase">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
