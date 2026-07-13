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
    <div className="flex items-center justify-center min-h-screen bg-bg px-4">
      <form onSubmit={handleSubmit} className="brutal-card w-full max-w-sm">
        <h1 className="font-display text-2xl text-center mb-1">后台登录</h1>
        <p className="text-text-muted text-xs text-center mb-6">Portfolio Admin</p>

        <input
          type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码" required autoFocus
          className="brutal-input mb-4"
        />

        {error && <p className="text-accent text-sm mb-4">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="brutal-btn brutal-btn-primary w-full justify-center"
        >
          {loading ? '登录中…' : '登录'}
        </button>
      </form>
    </div>
  );
}
