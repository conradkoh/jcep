/**
 * Admin controls for toggling response visibility
 */

'use client';

import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToggleResponseVisibility } from '@/modules/review/hooks/useReviewForm';
import type { ReviewForm } from '@/modules/review/types';

export interface VisibilityControlsProps {
  form: ReviewForm;
}

export function VisibilityControls({ form }: VisibilityControlsProps) {
  const toggleVisibility = useToggleResponseVisibility();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'buddy' | 'jc' | null;
    newValue: boolean;
  }>({
    open: false,
    type: null,
    newValue: false,
  });

  const handleToggleBuddyVisibility = (checked: boolean) => {
    setConfirmDialog({
      open: true,
      type: 'buddy',
      newValue: checked,
    });
  };

  const handleToggleJCVisibility = (checked: boolean) => {
    setConfirmDialog({
      open: true,
      type: 'jc',
      newValue: checked,
    });
  };

  const confirmToggle = async () => {
    if (!confirmDialog.type) return;

    setIsLoading(true);
    try {
      if (confirmDialog.type === 'buddy') {
        await toggleVisibility({
          formId: form._id,
          buddyResponsesVisibleToJC: confirmDialog.newValue,
        });
        toast.success(
          confirmDialog.newValue
            ? 'Buddy responses are now visible to JC'
            : 'Buddy responses are now hidden from JC'
        );
      } else {
        await toggleVisibility({
          formId: form._id,
          jcResponsesVisibleToBuddy: confirmDialog.newValue,
        });
        toast.success(
          confirmDialog.newValue
            ? 'JC responses are now visible to Buddy'
            : 'JC responses are now hidden from Buddy'
        );
      }
    } catch (error) {
      toast.error('Failed to update visibility settings');
      console.error(error);
    } finally {
      setIsLoading(false);
      setConfirmDialog({ open: false, type: null, newValue: false });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Response Visibility Controls
          </CardTitle>
          <CardDescription>
            Control when participants can see each other's responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buddy responses visibility */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="buddy-visibility" className="text-base font-medium">
                Buddy Evaluation
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow Junior Commander to see Buddy's evaluation
              </p>
            </div>
            <div className="flex items-center gap-2">
              {form.buddyResponsesVisibleToJC ? (
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                id="buddy-visibility"
                checked={form.buddyResponsesVisibleToJC}
                onCheckedChange={handleToggleBuddyVisibility}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* JC responses visibility */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="jc-visibility" className="text-base font-medium">
                JC Reflection & Feedback
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow Buddy to see Junior Commander's reflection and feedback
              </p>
            </div>
            <div className="flex items-center gap-2">
              {form.jcResponsesVisibleToBuddy ? (
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                id="jc-visibility"
                checked={form.jcResponsesVisibleToBuddy}
                onCheckedChange={handleToggleJCVisibility}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Status indicators */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Current Status:</p>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                {form.buddyResponsesVisibleToJC ? (
                  <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <span>
                  Buddy evaluation is{' '}
                  <strong>{form.buddyResponsesVisibleToJC ? 'visible' : 'hidden'}</strong> to JC
                </span>
              </div>
              <div className="flex items-center gap-2">
                {form.jcResponsesVisibleToBuddy ? (
                  <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <span>
                  JC responses are{' '}
                  <strong>{form.jcResponsesVisibleToBuddy ? 'visible' : 'hidden'}</strong> to Buddy
                </span>
              </div>
            </div>
          </div>

          {form.visibilityChangedAt && (
            <p className="text-xs text-muted-foreground">
              Last changed: {new Date(form.visibilityChangedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ open: false, type: null, newValue: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newValue ? 'Reveal Responses?' : 'Hide Responses?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'buddy' && confirmDialog.newValue && (
                <>
                  This will make the <strong>Buddy's evaluation</strong> visible to the{' '}
                  <strong>Junior Commander</strong>. The JC will be able to see all feedback
                  provided by their Buddy.
                </>
              )}
              {confirmDialog.type === 'buddy' && !confirmDialog.newValue && (
                <>
                  This will <strong>hide</strong> the Buddy's evaluation from the Junior Commander.
                </>
              )}
              {confirmDialog.type === 'jc' && confirmDialog.newValue && (
                <>
                  This will make the <strong>Junior Commander's reflection and feedback</strong>{' '}
                  visible to the <strong>Buddy</strong>. The Buddy will be able to see the JC's
                  self-reflection and program feedback.
                </>
              )}
              {confirmDialog.type === 'jc' && !confirmDialog.newValue && (
                <>
                  This will <strong>hide</strong> the Junior Commander's responses from the Buddy.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
