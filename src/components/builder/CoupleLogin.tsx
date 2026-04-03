import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props { onLogin: () => void; }

export function CoupleLogin({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError('Invalid email or password.'); setLoading(false); return; }
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F4' }}>
      <div className="w-full max-w-[400px] px-6">
        <div className="text-center mb-10">
          <p className="font-sans text-[10px] tracking-[0.35em] uppercase mb-4" style={{ color: '#2C3E2D' }}>
            Gilbertsville Farmhouse
          </p>
          <h1 className="font-serif text-4xl font-light mb-2" style={{ color: '#2C3E2D' }}>
            Harvest 336
          </h1>
          <p className="font-serif text-lg" style={{ color: '#C9A84C' }}>
            Menu Builder
          </p>
          <p className="font-serif italic text-sm mt-4" style={{ color: '#6B6B6B' }}>
            Your weekend menu, built together.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-sans text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: '#6B6B6B' }}>Email</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" required
              className="border-[#E8E2D9] bg-white focus:border-[#2C3E2D] font-sans text-sm" placeholder="your@email.com" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-[0.2em] uppercase block mb-1.5" style={{ color: '#6B6B6B' }}>Password</label>
            <Input value={password} onChange={e => setPassword(e.target.value)} type="password" required
              className="border-[#E8E2D9] bg-white focus:border-[#2C3E2D] font-sans text-sm" placeholder="••••••••" />
          </div>
          {error && <p className="font-sans text-xs text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full font-sans text-xs tracking-[0.2em] uppercase"
            style={{ background: '#2C3E2D', color: '#FAF8F4' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center mt-4 space-y-3">
          <a href="/" className="font-sans text-[13px] block hover:underline" style={{ color: '#2C3E2D' }}>
            View the Harvest 336 Menu →
          </a>
          <a href="/admin" className="font-sans text-[11px] block hover:underline" style={{ color: '#6B6B6B' }}>
            Coordinator access
          </a>
        </div>
      </div>
    </div>
  );
}
