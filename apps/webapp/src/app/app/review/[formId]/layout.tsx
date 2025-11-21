import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReviewFormLayout({ children }: { children: React.ReactNode }) {
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
