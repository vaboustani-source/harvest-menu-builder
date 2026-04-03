import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useGuideCards, useMilestones, useGuideSettings, type GuideCard } from '@/hooks/useMenuGuide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Check } from 'lucide-react';

// ── Milestone Manager per couple ──

const MILESTONE_DEFS = [
  { num: 1, label: 'Build Your Draft', statuses: ['not_started', 'in_progress', 'submitted'] },
  { num: 2, label: 'Review Call', statuses: ['pending', 'scheduled', 'complete'] },
  { num: 3, label: 'First Revision', statuses: ['not_started', 'in_progress', 'submitted'] },
  { num: 4, label: 'The Tasting', statuses: ['pending', 'scheduled', 'complete'] },
  { num: 5, label: 'Final Revision', statuses: ['not_started', 'in_progress', 'locked'] },
];

export function CoupleGuideManager({ coupleId, coupleName }: { coupleId: string; coupleName: string }) {
  const qc = useQueryClient();
  const { data: milestones } = useMilestones(coupleId);
  const { data: settings } = useGuideSettings(coupleId);
  const [expanded, setExpanded] = useState(false);

  const getStatus = (stepNum: number) => milestones?.find(m => m.step_number === stepNum)?.status ?? MILESTONE_DEFS.find(m => m.num === stepNum)?.statuses[0] ?? 'not_started';

  const setMilestoneStatus = async (stepNum: number, status: string) => {
    await (supabase as any)
      .from('couple_milestones')
      .upsert({ couple_id: coupleId, step_number: stepNum, status }, { onConflict: 'couple_id,step_number' });
    qc.invalidateQueries({ queryKey: ['couple-milestones', coupleId] });
  };

  const updateSetting = async (key: string, value: any) => {
    const current = settings ?? { revision_fee: 100, call_fee: 200, out_of_season_enabled: false, out_of_season_amount: 0 };
    await (supabase as any)
      .from('couple_guide_settings')
      .upsert({ couple_id: coupleId, ...current, [key]: value }, { onConflict: 'couple_id' });
    qc.invalidateQueries({ queryKey: ['couple-guide-settings', coupleId] });
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="mt-2 font-sans text-[10px] tracking-[0.1em] uppercase text-primary hover:underline cursor-pointer"
      >
        ▸ Menu Guide Settings
      </button>
    );
  }

  return (
    <div className="mt-3 border-t border-border pt-3 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase font-semibold text-primary">Menu Guide Settings</p>
        <button onClick={() => setExpanded(false)} className="font-sans text-[10px] text-muted-foreground hover:underline">Collapse ▴</button>
      </div>

      {/* Milestones */}
      <div>
        <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Milestone Statuses</p>
        <div className="space-y-2">
          {MILESTONE_DEFS.map(m => (
            <div key={m.num} className="flex items-center gap-3">
              <span className="font-sans text-[11px] w-32 shrink-0" style={{ color: '#2C3E2D' }}>{m.label}</span>
              <Select value={getStatus(m.num)} onValueChange={val => setMilestoneStatus(m.num, val)}>
                <SelectTrigger className="h-7 text-[11px] w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {m.statuses.map(s => (
                    <SelectItem key={s} value={s} className="text-[11px]">
                      {s.replace(/_/g, ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Fee settings */}
      <div>
        <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Fee Settings</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Revision Fee ($)</Label>
            <Input
              type="number"
              value={settings?.revision_fee ?? 100}
              onChange={e => updateSetting('revision_fee', Number(e.target.value))}
              className="h-8 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Call Fee ($/hr)</Label>
            <Input
              type="number"
              value={settings?.call_fee ?? 200}
              onChange={e => updateSetting('call_fee', Number(e.target.value))}
              className="h-8 text-sm mt-1"
            />
          </div>
        </div>
      </div>

      {/* Out-of-season toggle */}
      <div className="flex items-center gap-3">
        <Switch
          checked={settings?.out_of_season_enabled ?? false}
          onCheckedChange={val => updateSetting('out_of_season_enabled', val)}
        />
        <span className="font-sans text-[11px]" style={{ color: '#2C3E2D' }}>Out-of-season surcharge</span>
        {settings?.out_of_season_enabled && (
          <Input
            type="number"
            value={settings?.out_of_season_amount ?? 0}
            onChange={e => updateSetting('out_of_season_amount', Number(e.target.value))}
            className="h-7 w-20 text-sm"
            placeholder="$"
          />
        )}
      </div>
    </div>
  );
}

// ── Guide Cards Editor (global, in admin) ──

export function GuideCardsEditor() {
  const qc = useQueryClient();
  const { data: cards } = useGuideCards();
  const [editModal, setEditModal] = useState<{ open: boolean; card: GuideCard | null }>({ open: false, card: null });
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editModal.card) {
      setHeader(editModal.card.header);
      setBody(editModal.card.body);
    }
  }, [editModal.card]);

  const handleSave = async () => {
    if (!editModal.card) return;
    setSaving(true);
    await (supabase as any)
      .from('guide_cards')
      .update({ header, body })
      .eq('id', editModal.card.id);
    qc.invalidateQueries({ queryKey: ['guide-cards'] });
    setSaving(false);
    setEditModal({ open: false, card: null });
  };

  return (
    <div>
      <div className="border-b border-border pb-4 mb-4">
        <h2 className="font-serif italic text-2xl" style={{ color: '#2C3E2D' }}>Menu Guide Cards</h2>
        <p className="font-sans text-xs text-muted-foreground mt-1">
          Edit the "Good to Know" info cards shown on every couple's Menu Guide page. Use {'${{revision_fee}}'} and {'${{call_fee}}'} as dynamic placeholders.
        </p>
      </div>
      <div className="space-y-3">
        {(cards ?? []).map(card => (
          <div key={card.id} className="bg-white border rounded-lg px-4 py-3 flex items-start justify-between group" style={{ borderColor: '#E8E2D9' }}>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-[14px]" style={{ color: '#2C3E2D' }}>{card.header}</p>
              <p className="font-sans text-[11px] text-muted-foreground mt-1 line-clamp-2">{card.body}</p>
            </div>
            <button
              onClick={() => setEditModal({ open: true, card })}
              className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            >
              <Pencil size={13} />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={editModal.open} onOpenChange={v => !v && setEditModal({ open: false, card: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl" style={{ color: '#2C3E2D' }}>Edit Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Header</Label>
              <Input value={header} onChange={e => setHeader(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Body</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} rows={6} className="mt-1 text-sm" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full font-sans text-xs uppercase tracking-widest" style={{ background: '#2C3E2D', color: '#FAF8F4' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
