'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Users, Copy, ChevronRight, RotateCcw, Calendar, Check, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  useApplicationsByYear,
  useBulkCreateReviewForms,
  useListRotationMappings,
  type BulkCreateFormResult,
} from '../../hooks/useReviewForm';
import type { AgeGroup } from '../../types';
import { AGE_GROUP_OPTIONS, getAgeGroupLabel } from '../../utils/ageGroupLabels';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Step = 'select-rotation' | 'configure-participants' | 'results';

interface RotationMapping {
  _id: string;
  rotationYear: number;
  rotationQuarter: number;
  evaluationDate: number;
  label?: string;
}

interface SelectedParticipant {
  id: string;
  fullName: string;
  contactNumber: string;
  registeredAgeGroup: AgeGroup;
  ageGroup: AgeGroup;
  selected: boolean;
}

interface BulkReviewFormCreateProps {
  currentUserId: Id<'users'>;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getRotationLabel(m: RotationMapping): string {
  return m.label || `${m.rotationYear} Q${m.rotationQuarter}`;
}

export function BulkReviewFormCreate({ currentUserId }: BulkReviewFormCreateProps) {
  const { mappings, isLoading: isLoadingMappings } = useListRotationMappings();

  const [step, setStep] = useState<Step>('select-rotation');
  const [selectedMapping, setSelectedMapping] = useState<RotationMapping | null>(null);

  const currentYear = selectedMapping?.rotationYear ?? new Date().getFullYear();
  const { applications, isLoading: isLoadingApplications } = useApplicationsByYear(currentYear);

  const bulkCreate = useBulkCreateReviewForms();
  const [isGenerating, setIsGenerating] = useState(false);

  const [participants, setParticipants] = useState<SelectedParticipant[]>([]);
  const [results, setResults] = useState<BulkCreateFormResult | null>(null);

  const handleMappingSelect = (mapping: RotationMapping) => {
    setSelectedMapping(mapping);
  };

  // Load participants when entering configure step
  useEffect(() => {
    if (step === 'configure-participants' && applications) {
      setParticipants(
        applications.map((app) => ({
          id: app._id,
          fullName: app.fullName,
          contactNumber: app.contactNumber,
          registeredAgeGroup: app.ageGroupChoice1,
          ageGroup: app.ageGroupChoice1,
          selected: true,
        }))
      );
    }
  }, [step, applications]);

  const goToConfigureStep = () => {
    if (!selectedMapping) {
      toast.error('Please select a rotation');
      return;
    }
    setStep('configure-participants');
  };

  const toggleParticipant = (id: string) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  };

  const updateParticipantAgeGroup = (id: string, ageGroup: AgeGroup) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ageGroup } : p)));
  };

  const toggleAll = (select: boolean) => {
    setParticipants((prev) => prev.map((p) => ({ ...p, selected: select })));
  };

  const selectedCount = participants.filter((p) => p.selected).length;

  const handleGenerate = async () => {
    if (selectedCount === 0) {
      toast.error('Please select at least one participant');
      return;
    }
    if (!selectedMapping) return;

    setIsGenerating(true);
    try {
      const forms = participants
        .filter((p) => p.selected)
        .map((p) => ({
          buddyUserId: currentUserId,
          buddyName: 'Admin',
          juniorCommanderUserId: null,
          juniorCommanderName: p.fullName,
          ageGroup: p.ageGroup,
        }));

      const result = await bulkCreate({
        rotationYear: selectedMapping.rotationYear,
        rotationQuarter: selectedMapping.rotationQuarter,
        evaluationDate: selectedMapping.evaluationDate,
        forms,
      });

      setResults(result);
      setStep('results');
      toast.success(`Created ${result.filter((r) => r.success).length} review forms`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate forms');
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep('select-rotation');
    setSelectedMapping(null);
    setParticipants([]);
    setResults(null);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const successResults = useMemo(() => results?.filter((r) => r.success) ?? [], [results]);
  const failureResults = useMemo(() => results?.filter((r) => !r.success) ?? [], [results]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Create Review Forms</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create multiple review forms at once from registered participants
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            step === 'select-rotation'
              ? 'bg-primary text-primary-foreground'
              : step === 'configure-participants' || step === 'results'
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {step === 'configure-participants' || step === 'results' ? (
            <Check className="h-4 w-4" />
          ) : (
            <span>1</span>
          )}
          <span>Select Rotation</span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            step === 'configure-participants'
              ? 'bg-primary text-primary-foreground'
              : step === 'results'
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {step === 'results' ? <Check className="h-4 w-4" /> : <span>2</span>}
          <span>Configure Participants</span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            step === 'results'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <span>3</span>
          <span>Review Links</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 'select-rotation' && 'Select Rotation'}
            {step === 'configure-participants' && 'Configure Participants'}
            {step === 'results' && 'Generated Review Links'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Select Rotation */}
          {step === 'select-rotation' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose a rotation to create review forms for. The evaluation date is pre-configured
                from the rotation mapping.
              </p>

              {isLoadingMappings ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading rotations...
                </div>
              ) : mappings && mappings.length > 0 ? (
                <div className="grid gap-3">
                  {mappings.map((m) => {
                    const isSelected = selectedMapping?._id === m._id;
                    return (
                      <button
                        key={m._id}
                        onClick={() => handleMappingSelect(m)}
                        className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-accent/50 ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {getRotationLabel(m)}
                            </span>
                            {isSelected && (
                              <Badge variant="default" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Evaluation Date: {formatDate(m.evaluationDate)}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                  No rotation mappings found. Please create one first in the admin settings.
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={goToConfigureStep} disabled={!selectedMapping}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Configure Participants */}
          {step === 'configure-participants' && (
            <div className="space-y-4">
              {/* Context banner */}
              {selectedMapping && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Creating review forms for <strong>{getRotationLabel(selectedMapping)}</strong>
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Evaluation Date: {formatDate(selectedMapping.evaluationDate)}
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                The following participants are registered for <strong>{currentYear}</strong>. Select
                the participants you want to create review forms for, and configure their age group
                for this rotation.
              </p>

              {isLoadingApplications ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading registered participants...
                </div>
              ) : participants.length === 0 ? (
                <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                  No applications found for {currentYear}. Participants must register before review
                  forms can be created.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleAll(true)}>
                        Select All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleAll(false)}>
                        Deselect All
                      </Button>
                    </div>
                    <Badge variant="secondary">
                      {selectedCount} of {participants.length} selected
                    </Badge>
                  </div>

                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50 text-left text-sm">
                          <th className="w-12 p-3">
                            <Checkbox
                              checked={
                                participants.length > 0 && participants.every((p) => p.selected)
                              }
                              onCheckedChange={(checked) => toggleAll(checked === true)}
                            />
                          </th>
                          <th className="p-3 font-medium text-foreground">Name</th>
                          <th className="p-3 font-medium text-foreground">Contact</th>
                          <th className="p-3 font-medium text-foreground">Registered</th>
                          <th className="p-3 font-medium text-foreground">
                            Age Group for This Rotation
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p) => (
                          <tr
                            key={p.id}
                            className={`border-b transition-colors ${
                              p.selected ? 'bg-card' : 'bg-muted/30 text-muted-foreground'
                            }`}
                          >
                            <td className="p-3">
                              <Checkbox
                                checked={p.selected}
                                onCheckedChange={() => toggleParticipant(p.id)}
                              />
                            </td>
                            <td className="p-3 text-sm font-medium text-foreground">
                              {p.fullName}
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{p.contactNumber}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {getAgeGroupLabel(p.registeredAgeGroup)}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Select
                                value={p.ageGroup}
                                onValueChange={(v) =>
                                  updateParticipantAgeGroup(p.id, v as AgeGroup)
                                }
                                disabled={!p.selected}
                              >
                                <SelectTrigger className="h-8 w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {AGE_GROUP_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep('select-rotation')}>
                      Back
                    </Button>
                    <Button onClick={handleGenerate} disabled={selectedCount === 0 || isGenerating}>
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate {selectedCount} Form
                          {selectedCount === 1 ? '' : 's'}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {step === 'results' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {successResults.length} succeeded
                  </span>
                </div>
                {failureResults.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-destructive">{failureResults.length} failed</span>
                  </div>
                )}
              </div>

              {/* Success results */}
              {successResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">Review Form Links</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const links = successResults
                            .map(
                              (r) =>
                                `${r.juniorCommanderName} - Buddy: ${baseUrl}/app/review/access?token=${r.buddyAccessToken}`
                            )
                            .join('\n');
                          copyToClipboard(links);
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy All Buddy Links
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const links = successResults
                            .map(
                              (r) =>
                                `${r.juniorCommanderName} - JC: ${baseUrl}/app/review/access?token=${r.jcAccessToken}`
                            )
                            .join('\n');
                          copyToClipboard(links);
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy All JC Links
                      </Button>
                    </div>
                  </div>

                  {successResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-green-500/20 bg-green-500/5 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="font-semibold text-foreground">
                          {result.juniorCommanderName}
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">Buddy Link</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                              {baseUrl}/app/review/access?token=
                              {result.buddyAccessToken}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() =>
                                copyToClipboard(
                                  `${baseUrl}/app/review/access?token=${result.buddyAccessToken}`
                                )
                              }
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">
                            Junior Commander Link
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                              {baseUrl}/app/review/access?token=
                              {result.jcAccessToken}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() =>
                                copyToClipboard(
                                  `${baseUrl}/app/review/access?token=${result.jcAccessToken}`
                                )
                              }
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Failure results */}
              {failureResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-destructive">Failed Creations</h3>
                  {failureResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                    >
                      <p className="font-medium text-destructive">{result.juniorCommanderName}</p>
                      <p className="text-sm text-destructive/80">{result.error}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
