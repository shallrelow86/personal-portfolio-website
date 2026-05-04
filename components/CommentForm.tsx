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
    return <p className="text-success text-sm py-4">评论已提交，等待审核。谢谢！</p>;
  }

  const inputClass = 'w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-6 border-t border-border">
      <h3 className="font-semibold text-lg font-mono">
        <span className="text-primary mr-1">&gt;</span>
        发表评论
      </h3>
      <div>
        <input
          type="text"
          placeholder="你的名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          className={inputClass}
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="你的邮箱（不会公开）"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </div>
      <div>
        <textarea
          placeholder="你的评论"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={2000}
          rows={4}
          className={inputClass}
        />
      </div>
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onVerify={(token) => { turnstileRef.current = token; }}
      />
      {status === 'error' && <p className="text-error text-sm">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-primary text-surface font-medium px-5 py-2 rounded-lg text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {status === 'submitting' ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
