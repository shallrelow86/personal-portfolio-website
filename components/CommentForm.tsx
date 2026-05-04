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
    return <p className="text-green-600 text-sm py-4">评论已提交，等待审核。谢谢！</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-6 border-t">
      <h3 className="font-semibold text-lg">发表评论</h3>
      <div>
        <input
          type="text"
          placeholder="你的名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="你的邮箱（不会公开）"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 text-sm"
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
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onVerify={(token) => { turnstileRef.current = token; }}
      />
      {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'submitting' ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
