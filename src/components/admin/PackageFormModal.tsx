import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DbMenuPackage } from '@/hooks/useMenuData';

type Props = {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  pkg?: DbMenuPackage | null;
};

export function PackageFormModal({ open, onClose, sectionId, pkg }: Props) {
  const qc = useQueryClient();
  const isEdit = !!pkg;
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pkg) { setTitle(pkg.title); setPrice(pkg.price); setDescription(pkg.description); }
    else { setTitle(''); setPrice(''); setDescription(''); }
    setError('');
  }, [pkg, open]);

  const handleSave = async () => {
    if (!title.trim() || !price.trim() || !description.trim()) {
      setError('All fields are required.'); return;
    }
    setSaving(true);
    setError('');
    const payload = { section_id: sectionId, title: title.trim(), price: price.trim(), description: description.trim() };
    const { error: err } = isEdit
      ? await supabase.from('menu_packages').update(payload).eq('id', pkg!.id)
      : await supabase.from('menu_packages').insert({ ...payload, sort_order: 999 });
    if (err) { setError(err.message); }
    else { await qc.invalidateQueries({ queryKey: ['menu-data'] }); onClose(); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-green">{isEdit ? 'Edit Package' : 'Add Package Card'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Essential Weekend" />
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted">Price *</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $95pp" />
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted">Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What's included…" />
          </div>
          {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-green hover:bg-green/90 text-white font-sans text-xs tracking-widest uppercase">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Package'}
            </Button>
            <Button variant="outline" onClick={onClose} className="font-sans text-xs tracking-widest uppercase">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
