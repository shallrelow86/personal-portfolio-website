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
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-lg font-semibold text-center mb-6">Admin Login</h1>

        <input
          type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password" required autoFocus
          className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-start transition-colors mb-4"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-accent-start text-surface font-medium py-2.5 rounded-lg text-sm hover:bg-accent-end transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
