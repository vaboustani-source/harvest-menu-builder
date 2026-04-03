import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useGuideCards, useGuideSettings, type GuideCard } from '@/hooks/useMenuGuide';
import { useMenuProgress, MILESTONE_DEFS, setMilestoneProgress, type ProgressMilestone } from '@/hooks/useMenuProgress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Check } from 'lucide-react';

// ── Badge component ──
function SetByBadge({ milestone }: { milestone: ProgressMilestone }) {
  if (!milestone.is_complete) return null;
  // If override_timestamp is set AND set_by is admin → EDITED
  if (milestone.override_timestamp && milestone.set_by === 'admin') {
    return <span className="font-sans text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full" style={{ background: '#C9A84C20', color: '#C9A84C' }}>EDITED</span>;
  }
  if (milestone.set_by === 'system') {
    return <span className="font-sans text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full" style={{ background: '#7A9E7E20', color: '#7A9E7E' }}>AUTO</span>;
  }
  return <span className="font-sans text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full" style={{ background: '#E8E2D920', color: '#6B6B6B' }}>MANUAL</span>;
}

// ── Milestone Manager per couple ──

export function CoupleGuideManager({ coupleId, coupleName }: { coupleId: string; coupleName: string }) {
  const qc = useQueryClient();
  const { data: milestones } = useMenuProgress(coupleId);
  const { data: settings } = useGuideSettings(coupleId);
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editingTimestamp, setEditingTimestamp] = useState<string | null>(null);
  const [timestampValue, setTimestampValue] = useState('');

  const getMilestone = (name: string): ProgressMilestone | null =>
    milestones?.find(m => m.milestone_name === name) ?? null;

  const handleToggle = async (milestoneName: string, checked: boolean) => {
    const existing = getMilestone(milestoneName);
    await setMilestoneProgress(coupleId, milestoneName, checked, 'admin', {
      notes: existing?.notes ?? undefined,
    });
    qc.invalidateQueries({ queryKey: ['menu-progress', coupleId] });
  };

  const handleSaveNotes = async (milestoneName: string) => {
    const existing = getMilestone(milestoneName);
    await setMilestoneProgress(coupleId, milestoneName, existing?.is_complete ?? false, existing?.set_by as any ?? 'admin', {
      notes: noteText || undefined,
      overrideTimestamp: existing?.override_timestamp ?? undefined,
    });
    qc.invalidateQueries({ queryKey: ['menu-progress', coupleId] });
    setEditingNotes(null);
  };

  const handleSaveTimestamp = async (milestoneName: string) => {
    const existing = getMilestone(milestoneName);
    if (!existing?.is_complete) return;
    const ts = timestampValue ? new Date(timestampValue).toISOString() : undefined;
    await setMilestoneProgress(coupleId, milestoneName, true, 'admin', {
      notes: existing?.notes ?? undefined,
      overrideTimestamp: ts,
    });
    qc.invalidateQueries({ queryKey: ['menu-progress', coupleId] });
    setEditingTimestamp(null);
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

      {/* Progress Checklist */}
      <div>
        <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-muted-foreground mb-2">Progress Checklist</p>
        <div className="space-y-3">
          {MILESTONE_DEFS.map(def => {
            const ms = getMilestone(def.name);
            const isComplete = ms?.is_complete ?? false;
            const displayTime = ms?.override_timestamp ?? ms?.completed_at;

            return (
              <div key={def.name} className="bg-secondary/30 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isComplete}
                    onCheckedChange={(checked) => handleToggle(def.name, !!checked)}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[11px] font-medium" style={{ color: '#2C3E2D' }}>{def.label}</span>
                      {ms && <SetByBadge milestone={ms} />}
                      {def.autoTriggerable && (
                        <span className="font-sans text-[7px] tracking-[0.1em] uppercase text-muted-foreground">auto-triggered</span>
                      )}
                    </div>
                    {isComplete && displayTime && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-sans text-[10px] text-muted-foreground">
                          {new Date(displayTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => {
                            setEditingTimestamp(def.name);
                            setTimestampValue(displayTime ? new Date(displayTime).toISOString().slice(0, 16) : '');
                          }}
                          className="font-sans text-[9px] text-muted-foreground hover:text-foreground hover:underline"
                        >
                          edit ✎
                        </button>
                      </div>
                    )}
                    {isComplete && ms?.set_by === 'admin' && def.autoTriggerable && !ms?.override_timestamp && (
                      <p className="font-sans text-[9px] italic mt-0.5" style={{ color: '#6B6B6B' }}>
                        Manually set by coordinator
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-1.5 ml-7">
                  {editingNotes === def.name ? (
                    <div className="flex items-start gap-2">
                      <Textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        rows={2}
                        className="text-[11px] flex-1"
                        placeholder="Add a note..."
                      />
                      <Button size="sm" onClick={() => handleSaveNotes(def.name)} className="h-7 text-[10px] px-2">Save</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNotes(def.name);
                        setNoteText(ms?.notes ?? '');
                      }}
                      className="font-sans text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {ms?.notes ? `📝 ${ms.notes}` : '+ Add note'}
                    </button>
                  )}
                </div>

                {/* Timestamp override modal inline */}
                {editingTimestamp === def.name && (
                  <div className="mt-2 ml-7 flex items-center gap-2">
                    <Input
                      type="datetime-local"
                      value={timestampValue}
                      onChange={e => setTimestampValue(e.target.value)}
                      className="h-7 text-[11px] w-56"
                    />
                    <Button size="sm" onClick={() => handleSaveTimestamp(def.name)} className="h-7 text-[10px] px-2">Set</Button>
                    <button onClick={() => setEditingTimestamp(null)} className="font-sans text-[9px] text-muted-foreground hover:underline">Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
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
