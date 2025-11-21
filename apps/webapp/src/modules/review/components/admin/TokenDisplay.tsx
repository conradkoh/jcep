/**
 * Component to display and manage access tokens for review forms
 * V2: Enhanced admin creation with token distribution
 */

'use client';

import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegenerateAccessTokens } from '@/modules/review/hooks/useReviewForm';
import type { ReviewForm } from '@/modules/review/types';

export interface TokenDisplayProps {
  form: ReviewForm;
}

export function TokenDisplay({ form }: TokenDisplayProps) {
  const regenerateTokens = useRegenerateAccessTokens();
  const [copiedBuddy, setCopiedBuddy] = useState(false);
  const [copiedJC, setCopiedJC] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const buddyLink = `${window.location.origin}/review/token/${form.buddyAccessToken}`;
  const jcLink = `${window.location.origin}/review/token/${form.jcAccessToken}`;

  const copyToClipboard = async (text: string, type: 'buddy' | 'jc') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'buddy') {
        setCopiedBuddy(true);
        setTimeout(() => setCopiedBuddy(false), 2000);
      } else {
        setCopiedJC(true);
        setTimeout(() => setCopiedJC(false), 2000);
      }
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
      console.error(error);
    }
  };

  const handleRegenerateTokens = async () => {
    setIsRegenerating(true);
    try {
      await regenerateTokens(form._id);
      toast.success('Access tokens regenerated successfully!');
      // Reload the page to show new tokens
      window.location.reload();
    } catch (error) {
      toast.error('Failed to regenerate tokens');
      console.error(error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Access Links
            </CardTitle>
            <CardDescription>
              Share these secret links to allow anonymous access to the form
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isRegenerating}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate Access Tokens?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will invalidate the old links and generate new ones. Anyone with the old
                  links will no longer be able to access the form. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerateTokens}>
                  Regenerate Tokens
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Buddy Link */}
        <div className="space-y-2">
          <Label htmlFor="buddy-link" className="text-base font-medium">
            Buddy Access Link
          </Label>
          <p className="text-sm text-muted-foreground">
            Send this link to <strong>{form.buddyName}</strong> to complete the buddy evaluation
          </p>
          <div className="flex gap-2">
            <Input id="buddy-link" value={buddyLink} readOnly className="font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(buddyLink, 'buddy')}
              title="Copy to clipboard"
              aria-label="Copy buddy access link"
            >
              {copiedBuddy ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(buddyLink, '_blank')}
              title="Open in new tab"
              aria-label="Open buddy link in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* JC Link */}
        <div className="space-y-2">
          <Label htmlFor="jc-link" className="text-base font-medium">
            Junior Commander Access Link
          </Label>
          <p className="text-sm text-muted-foreground">
            Send this link to <strong>{form.juniorCommanderName}</strong> to complete the reflection
            and feedback
          </p>
          <div className="flex gap-2">
            <Input id="jc-link" value={jcLink} readOnly className="font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(jcLink, 'jc')}
              title="Copy to clipboard"
              aria-label="Copy Junior Commander access link"
            >
              {copiedJC ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(jcLink, '_blank')}
              title="Open in new tab"
              aria-label="Open Junior Commander link in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 p-4">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
            Security Notice
          </p>
          <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1">
            <li>These links provide anonymous access to the form</li>
            <li>Anyone with these links can access and edit the form</li>
            <li>Keep these links private and only share with the intended recipients</li>
            <li>Links do not expire unless you regenerate them</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
