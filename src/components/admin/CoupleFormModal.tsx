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
};

export function CoupleFormModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [partner1, setPartner1] = useState('');
  const [partner2, setPartner2] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    if (!partner1.trim() || !partner2.trim() || !email.trim() || !password.trim()) {
      setError('Partner names, email, and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const { data, error: fnError } = await supabase.functions.invoke('create-couple', {
      body: {
        email: email.trim(),
        password,
        partner1_name: partner1.trim(),
        partner2_name: partner2.trim(),
        wedding_date: weddingDate || null,
        guest_count: guestCount ? parseInt(guestCount) : null,
      },
    });

    if (fnError || data?.error) {
      setError(data?.error || fnError?.message || 'Failed to create account.');
    } else {
      setSuccess(`Account created for ${partner1} & ${partner2}. They can log in with ${email.trim()}.`);
      await qc.invalidateQueries({ queryKey: ['couples'] });
      setPartner1('');
      setPartner2('');
      setEmail('');
      setPassword('');
      setWeddingDate('');
      setGuestCount('');
    }
    setSaving(false);
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-green">Add Couple Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Partner 1 Name *</Label>
              <Input value={partner1} onChange={(e) => setPartner1(e.target.value)} placeholder="e.g. Sarah" />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Partner 2 Name *</Label>
              <Input value={partner2} onChange={(e) => setPartner2(e.target.value)} placeholder="e.g. James" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="couple@email.com" />
          </div>

          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Password *</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary password for the couple" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Wedding Date</Label>
              <Input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Guest Count</Label>
              <Input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="e.g. 150" />
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
          {success && <p className="text-xs text-sage font-sans">{success}</p>}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-green hover:bg-green/90 text-white font-sans text-xs tracking-widest uppercase">
              {saving ? 'Creating…' : 'Create Account'}
            </Button>
            <Button variant="outline" onClick={handleClose} className="font-sans text-xs tracking-widest uppercase">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
