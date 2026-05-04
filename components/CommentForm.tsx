'use client';

import { useState, useRef } from 'react';
import Turnstile from 'react-turnstile';

interface CommentFormProps {
  postId: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const turnstileRef = useRef<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileRef.current) {
      setErrorMsg('请完成验证码。');
      return;
    }
    setStatus('submitting');

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        body: body.trim(),
        turnstileToken: turnstileRef.current,
      }),
    });

    if (res.ok) {
      setStatus('success');
      setName('');
      setEmail('');
      setBody('');
    } else {
      const data = await res.json();
      setErrorMsg(data.error || '提交失败，请重试。');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <p className="font-mono text-sm text-success py-6 border-t border-border mt-8">
        评论已提交，等待审核。谢谢！
      </p>
    );
  }

  const inputClass =
    'w-full bg-surface border border-border px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-8 border-t border-border mt-8">
      <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
        Leave a comment
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          className={inputClass}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <textarea
        placeholder="Your comment..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        maxLength={2000}
        rows={4}
        className={inputClass}
      />
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onVerify={(token) => { turnstileRef.current = token; }}
      />
      {status === 'error' && (
        <p className="font-mono text-sm text-error">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="font-mono text-sm border border-border px-6 py-3 text-muted hover:text-primary hover:border-primary transition-colors disabled:opacity-40"
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
