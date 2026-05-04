'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-alt border border-border p-10 w-full max-w-md"
      >
        <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-6 text-center">
          Authentication Required
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoFocus
          className="w-full bg-surface border border-border px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors mb-5"
        />

        {error && (
          <p className="font-mono text-sm text-error mb-5">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full font-mono text-sm border border-border py-3 text-muted hover:text-primary hover:border-primary transition-colors disabled:opacity-40"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
