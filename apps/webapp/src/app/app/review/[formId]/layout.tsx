import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Layout component for review form pages.
 * Provides a consistent layout with a back button navigation header.
 *
 * @param children - The page content to render within the layout
 */
export default function ReviewFormLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/review">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Review Forms
            </Link>
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
