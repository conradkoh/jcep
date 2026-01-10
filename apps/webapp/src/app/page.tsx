'use client';
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
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div>App Version: {appVersion ?? 'Loading...'}</div>
      </footer>
    </div>
  );
}
