'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { SectionCompletion } from '../../types';

interface ReviewFormProgressProps {
  sectionCompletion: SectionCompletion;
}

export function ReviewFormProgress({ sectionCompletion }: ReviewFormProgressProps) {
  const sections = [
    { key: 'particulars', label: 'Particulars', completed: sectionCompletion.particulars },
    {
      key: 'buddyEvaluation',
      label: 'Buddy Evaluation',
      completed: sectionCompletion.buddyEvaluation,
    },
    { key: 'jcReflection', label: 'JC Reflection', completed: sectionCompletion.jcReflection },
    { key: 'jcFeedback', label: 'JC Feedback', completed: sectionCompletion.jcFeedback },
  ];

  const completedCount = sections.filter((s) => s.completed).length;
  const totalCount = sections.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Form Completion</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount} of {totalCount} sections
        </span>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.key} className="flex items-center gap-2">
            {section.completed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={
                section.completed ? 'text-sm text-foreground' : 'text-sm text-muted-foreground'
              }
            >
              {section.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
