import { Check, Circle } from 'lucide-react';

interface SaveIndicatorProps {
  status: 'saved' | 'modified' | 'none';
}

/**
 * Visual indicator showing the save state of a form field
 * - "Modified" (amber circle): Field has unsaved changes
 * - "Saved" (green check): Field has been saved successfully
 * - None: Field hasn't been interacted with
 */
export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'none') return null;

  if (status === 'modified') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
        <Circle className="h-3 w-3 fill-current" />
        <span>Modified</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
      <Check className="h-3 w-3" />
      <span>Saved</span>
    </div>
  );
}
