import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Invalid email or password.');
    } else {
      navigate('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-muted mb-2">Gilbertsville Farmhouse</p>
          <h1 className="font-serif text-3xl text-green italic">Harvest 336</h1>
          <p className="font-sans text-xs tracking-widest uppercase text-muted mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-cream-dark p-8 shadow-card space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-sans text-[11px] uppercase tracking-widest text-muted">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-cream-dark focus-visible:ring-sage"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="font-sans text-[11px] uppercase tracking-widest text-muted">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-cream-dark focus-visible:ring-sage"
            />
          </div>
          {error && (
            <p className="font-sans text-xs text-red-600">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green hover:bg-green/90 text-white font-sans text-xs tracking-widest uppercase"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center mt-6 font-sans text-[11px] text-muted">
          <a href="/" className="hover:text-green transition-colors">← Back to menu</a>
        </p>
      </div>
    </div>
  );
}
