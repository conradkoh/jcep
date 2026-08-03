'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useState } from 'react';

import type { RotationYearOverview, UnmatchedReviewForm } from '../types';
import { AddToRotationDialog } from './AddToRotationDialog';
import { AssociateReviewFormDialog } from './AssociateReviewFormDialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';

interface AddState {
  form: UnmatchedReviewForm;
  rotationId: Id<'rotations'>;
}

function findTargetRotationId(
  overview: RotationYearOverview,
  form: UnmatchedReviewForm
): Id<'rotations'> | undefined {
  return overview.rotations.find((c) => c.rotation.rotationQuarter === form.rotationNumber)
    ?.rotation._id;
}

/**
 * Lists review forms for the year that are not linked to any participant,
 * with actions to associate an existing participant or add a junior commander
 * to the matching rotation. Actions are disabled until the rotation for that
 * quarter has been created.
 */
export function UnmatchedReviewFormsPanel({ overview }: { overview: RotationYearOverview }) {
  const [associateForm, setAssociateForm] = useState<UnmatchedReviewForm | null>(null);
  const [addState, setAddState] = useState<AddState | null>(null);

  if (overview.unmatchedForms.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Unmatched Review Forms</CardTitle>
          <CardDescription>
            Review forms created without a linked participant. Associate them with a participant or
            add the junior commander to the matching rotation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overview.unmatchedForms.map((form) => {
              const targetRotationId = findTargetRotationId(overview, form);
              return (
                <div
                  key={form.formId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm break-words">{form.juniorCommanderName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Rotation {form.rotationNumber}</Badge>
                      <Badge variant="outline">{getAgeGroupLabel(form.ageGroup)}</Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!targetRotationId && (
                      <span className="text-xs text-muted-foreground">
                        No rotation created for Rotation {form.rotationNumber} yet.
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!targetRotationId}
                      onClick={() => setAssociateForm(form)}
                    >
                      Associate
                    </Button>
                    <Button
                      size="sm"
                      disabled={!targetRotationId}
                      onClick={() =>
                        targetRotationId && setAddState({ form, rotationId: targetRotationId })
                      }
                    >
                      Add to Rotation
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {associateForm && (
        <AssociateReviewFormDialog
          open
          onOpenChange={(open) => !open && setAssociateForm(null)}
          overview={overview}
          form={associateForm}
        />
      )}
      {addState && (
        <AddToRotationDialog
          open
          onOpenChange={(open) => !open && setAddState(null)}
          form={addState.form}
          rotationId={addState.rotationId}
        />
      )}
    </>
  );
}
