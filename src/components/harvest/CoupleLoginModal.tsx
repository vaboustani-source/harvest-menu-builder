import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CoupleLoginModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    // Check if user is a couple (not admin)
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle();

    if (!couple) {
      // Might be admin, sign out and show error
      setError('This login is for couple accounts only. Use /admin/login for admin access.');
      setLoading(false);
      return;
    }

    onClose();
    navigate('/my-menu');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl text-green text-center">
            Build Your Menu
          </DialogTitle>
        </DialogHeader>
        <p className="font-sans text-xs text-muted-foreground text-center leading-relaxed">
          Log in with the credentials provided by your venue coordinator to start building your custom menu.
        </p>
        <div className="space-y-3 mt-3">
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="your@email.com"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
          <Button onClick={handleLogin} disabled={loading} className="w-full bg-green hover:bg-green/90 text-white font-sans text-xs tracking-widest uppercase">
            {loading ? 'Signing in…' : 'Sign In & Build Menu'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
