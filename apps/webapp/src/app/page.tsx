'use client';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAppVersion } from '@/modules/app/useAppInfo';

export default function Home() {
  const appVersion = useAppVersion();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[24px] row-start-2 items-center text-center sm:items-start sm:text-left max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Junior Commander Exposure Programme
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          JCEP is part of the Royal Rangers programme, helping Junior Commanders grow through
          mentoring, ministry exposure, and structured reflections.
        </p>
        <p className="text-sm text-muted-foreground">
          Use this app to manage JCEP review forms between Buddies and Junior Commanders across
          rotations.
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row mt-4">
          <Link href="/apply">
            <Button size="lg" className="w-full sm:w-auto">
              Apply Now
            </Button>
          </Link>
          <Link href="/app">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div>App Version: {appVersion ?? 'Loading...'}</div>
      </footer>
    </div>
  );
}
