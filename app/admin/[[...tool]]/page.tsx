'use client';

import dynamic from 'next/dynamic';
import config from '@/sanity.config';

const Studio = dynamic(
  () => import('next-sanity/studio').then((mod) => ({ default: mod.NextStudio })),
  { ssr: false },
);

export default function AdminPage() {
  return <Studio config={config} />;
}
