'use client';

import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useToggleResponseVisibility } from '../hooks/useReviewForm';
import type { ReviewForm } from '../types';
import { getCombinedVisibilityState } from '../utils/visibilityHelpers';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReviewFormVisibilityToggleProps {
  form: ReviewForm;
}

export function ReviewFormVisibilityToggle({ form }: ReviewFormVisibilityToggleProps) {
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const toggleVisibility = useToggleResponseVisibility();

  const handleToggleBothVisibility = async () => {
    setTogglingVisibility(true);
    try {
      const bothVisible = form.buddyResponsesVisibleToJC && form.jcResponsesVisibleToBuddy;
      await toggleVisibility({
        formId: form._id,
        buddyResponsesVisibleToJC: !bothVisible,
        jcResponsesVisibleToBuddy: !bothVisible,
      });
      toast.success(!bothVisible ? 'Both responses now visible' : 'Both responses now hidden');
    } catch (error) {
      toast.error('Failed to update visibility');
      console.error(error);
    } finally {
      setTogglingVisibility(false);
    }
  };

  const visibility = getCombinedVisibilityState(form);

  return (
    <div className="flex items-center justify-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleBothVisibility}
              disabled={togglingVisibility}
              className="h-7 px-2"
              aria-label={`Toggle visibility for ${form.juniorCommanderName}`}
            >
              {visibility.isMismatched ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 mr-1.5" />
                  <span className="text-xs">Partial</span>
                </>
              ) : visibility.isVisible ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mr-1.5" />
                  <span className="text-xs">Visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                  <span className="text-xs">Hidden</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {visibility.isMismatched ? (
              <div className="text-xs space-y-1">
                <p className="font-semibold text-orange-600 dark:text-orange-400">
                  Warning: Visibility settings are mismatched
                </p>
                <p>Buddy → JC: {visibility.buddyVisible ? 'Visible' : 'Hidden'}</p>
                <p>JC → Buddy: {visibility.jcVisible ? 'Visible' : 'Hidden'}</p>
                <p className="mt-1">Click to sync both settings</p>
              </div>
            ) : (
              <p className="text-xs">
                {visibility.isVisible
                  ? 'Both responses are visible. Click to hide both.'
                  : 'Both responses are hidden. Click to show both.'}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
