'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export interface CopyReviewFormLinkButtonProps {
  token: string;
  label: string;
}

export function CopyReviewFormLinkButton({ token, label }: CopyReviewFormLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const link = `${window.location.origin}/review/token/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success(`${label} link copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [token, label]);

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}
