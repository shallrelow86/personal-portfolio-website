import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, authorName, authorEmail, body: commentBody, turnstileToken } = body;

    // Validate required fields
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'postId is required.' }, { status: 400 });
    }
    if (!authorName || typeof authorName !== 'string' || authorName.trim().length === 0 || authorName.length > 60) {
      return NextResponse.json({ error: 'authorName is required (max 60 chars).' }, { status: 400 });
    }
    if (!authorEmail || typeof authorEmail !== 'string' || !validateEmail(authorEmail)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0 || commentBody.length > 2000) {
      return NextResponse.json({ error: 'body is required (max 2000 chars).' }, { status: 400 });
    }
    if (!turnstileToken || typeof turnstileToken !== 'string') {
      return NextResponse.json({ error: 'CAPTCHA token is required.' }, { status: 400 });
    }

    // Verify Turnstile token
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json({ error: 'CAPTCHA verification failed.' }, { status: 400 });
    }

    // Create comment in Sanity
    await sanityWriteClient.create({
      _type: 'comment',
      post: { _type: 'reference', _ref: postId },
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      body: commentBody.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Comment submission error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
