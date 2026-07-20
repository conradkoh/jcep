'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { CalendarIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useCreateRotation,
  useDeleteRotation,
  useListRotations,
  useUpdateRotation,
  type Rotation,
} from '../../hooks/useReviewForm';
import {
  formatRotationLabel,
  getDefaultRotationQuarter,
  getRotationQuarterOptions,
} from '../../utils/rotationUtils';

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
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface RotationsWidgetProps {
  className?: string;
  embedded?: boolean;
  defaultShowCreateForm?: boolean;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDisplayLabel(m: Rotation): string {
  return m.label || formatRotationLabel(m.rotationYear, m.rotationQuarter);
}

export function RotationsWidget({
  className,
  embedded = false,
  defaultShowCreateForm = false,
}: RotationsWidgetProps) {
  const { rotations, isLoading } = useListRotations();
  const createRotation = useCreateRotation();
  const updateRotation = useUpdateRotation();
  const deleteRotation = useDeleteRotation();

  const currentYear = new Date().getFullYear();
  const [showCreateForm, setShowCreateForm] = useState(defaultShowCreateForm);
  const [editingId, setEditingId] = useState<Id<'rotationMappings'> | null>(null);
  const [deletingId, setDeletingId] = useState<Id<'rotationMappings'> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [rotationYear, setRotationYear] = useState(currentYear);
  const [rotationQuarter, setRotationQuarter] = useState(getDefaultRotationQuarter());
  const [evaluationDate, setEvaluationDate] = useState<Date>(new Date());
  const [label, setLabel] = useState('');

  const [editEvaluationDate, setEditEvaluationDate] = useState<Date>(new Date());
  const [editLabel, setEditLabel] = useState('');

  const resetCreateForm = () => {
    setRotationYear(currentYear);
    setRotationQuarter(getDefaultRotationQuarter());
    setEvaluationDate(new Date());
    setLabel('');
    setShowCreateForm(false);
  };

  const startEdit = (m: Rotation) => {
    setEditingId(m._id);
    setEditEvaluationDate(new Date(m.evaluationDate));
    setEditLabel(m.label ?? '');
  };

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      await createRotation({
        rotationYear,
        rotationQuarter,
        evaluationDate: evaluationDate.getTime(),
        label: label.trim() || undefined,
      });
      toast.success('Rotation created');
      resetCreateForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create rotation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await updateRotation({
        rotationId: editingId,
        evaluationDate: editEvaluationDate.getTime(),
        label: editLabel.trim() || undefined,
      });
      toast.success('Rotation updated');
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update rotation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSaving(true);
    try {
      await deleteRotation(deletingId);
      toast.success('Rotation deleted');
      setDeletingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete rotation');
    } finally {
      setIsSaving(false);
    }
  };

  const content = (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading rotations...</p>
      ) : (
        <>
          {rotations && rotations.length === 0 && !showCreateForm && (
            <div className="rounded-md border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No rotations yet. Create one to get started.
              </p>
              <Button className="mt-3" size="sm" onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Rotation
              </Button>
            </div>
          )}

          {rotations && rotations.length > 0 && (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-3 font-medium">Rotation</th>
                    <th className="p-3 font-medium">Evaluation Date</th>
                    <th className="p-3 font-medium">Label</th>
                    <th className="w-24 p-3" />
                  </tr>
                </thead>
                <tbody>
                  {rotations.map((m) =>
                    editingId === m._id ? (
                      <tr key={`${m._id}-edit`} className="border-b bg-muted/20">
                        <td colSpan={4} className="p-3">
                          <div className="flex flex-wrap items-end gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground">Rotation</Label>
                              <p className="pt-0.5 text-sm font-medium">{getDisplayLabel(m)}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Evaluation Date
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="mt-0.5 h-9 justify-start text-left text-sm font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    {formatDateShort(editEvaluationDate)}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={editEvaluationDate}
                                    onSelect={(date) => date && setEditEvaluationDate(date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Label</Label>
                              <Input
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="mt-0.5 h-9"
                                placeholder="Optional label"
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" onClick={handleUpdate} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                                disabled={isSaving}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={m._id} className="border-b">
                        <td className="p-3 font-medium">{getDisplayLabel(m)}</td>
                        <td className="p-3 text-muted-foreground">
                          {formatDate(m.evaluationDate)}
                        </td>
                        <td className="p-3 text-muted-foreground">{m.label || '\u2014'}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEdit(m)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeletingId(m._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {showCreateForm && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="mb-4 text-sm font-medium">New Rotation</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm text-foreground">Year</Label>
                  <Input
                    type="number"
                    value={rotationYear}
                    onChange={(e) =>
                      setRotationYear(Number.parseInt(e.target.value) || currentYear)
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Quarter</Label>
                  <Select
                    value={String(rotationQuarter)}
                    onValueChange={(value) => setRotationQuarter(Number.parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {getRotationQuarterOptions().map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-foreground">Evaluation Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="mt-1 w-full justify-start text-left text-sm font-normal"
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {formatDateShort(evaluationDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={evaluationDate}
                        onSelect={(date) => date && setEvaluationDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-sm text-foreground">Label (optional)</Label>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="mt-1"
                    placeholder="e.g. Mid-year review"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={resetCreateForm} disabled={isSaving}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Create'}
                </Button>
              </div>
            </div>
          )}

          {rotations && rotations.length > 0 && !showCreateForm && (
            <Button variant="outline" size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rotation
            </Button>
          )}
        </>
      )}

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rotation?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Bulk review form creation will no longer offer this rotation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (embedded) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Rotations</CardTitle>
        <CardDescription>
          Configure rotations available for bulk review form creation. Each rotation has an
          evaluation date.
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
