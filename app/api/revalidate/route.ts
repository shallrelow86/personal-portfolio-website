import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('sanity-webhook-signature');

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(body);
    const { _type, slug } = payload;

    switch (_type) {
      case 'profile':
        revalidatePath('/');
        revalidatePath('/about');
        break;
      case 'project':
        revalidatePath('/');
        revalidatePath('/projects');
        if (slug?.current) revalidatePath(`/projects/${slug.current}`);
        break;
      case 'post':
        revalidatePath('/');
        revalidatePath('/blog');
        if (slug?.current) revalidatePath(`/blog/${slug.current}`);
        break;
      case 'siteSettings':
        revalidatePath('/', 'layout');
        break;
      case 'comment':
        if (slug?.current) revalidatePath(`/blog/${slug.current}`);
        break;
      default:
        revalidatePath('/');
    }

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }
}
