'use client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { useAppVersion } from '@/modules/app/useAppInfo';

export default function Home() {
  const appVersion = useAppVersion();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[24px] row-start-2 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Junior Commander Exposure Programme
        </h1>
        <p className="text-muted-foreground">Royal Rangers Singapore Outpost 1</p>
        <div className="mt-8">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Helpful Links
          </p>
          <Link
            href="/apply"
            className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-base font-medium border-b border-transparent hover:border-foreground/20 py-2"
          >
            View Application Form
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div>App Version: {appVersion ?? 'Loading...'}</div>
      </footer>
    </div>
  );
}
