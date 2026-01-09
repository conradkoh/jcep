'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCreateReviewForm } from '../../hooks/useReviewForm';
import type { AgeGroup } from '../../types';
import {
  formatRotationLabel,
  getDefaultRotationQuarter,
  getRotationQuarterOptions,
} from '../../utils/rotationUtils';
import { AgeGroupSelect } from '../AgeGroupSelect';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

type UserRole = 'buddy' | 'jc';

interface ReviewFormCreateProps {
  currentUserId: Id<'users'>;
}

export function ReviewFormCreate({ currentUserId }: ReviewFormCreateProps) {
  const router = useRouter();
  const createForm = useCreateReviewForm();

  const currentYear = new Date().getFullYear();
  const [myRole, setMyRole] = useState<UserRole>('buddy');
  const [buddyName, setBuddyName] = useState('');
  const [jcName, setJcName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced options with sensible defaults
  const [rotationYear, setRotationYear] = useState(currentYear);
  const [rotationQuarter, setRotationQuarter] = useState(getDefaultRotationQuarter());
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('RK');
  const [evaluationDate, setEvaluationDate] = useState<Date>(new Date());

  const canCreate = buddyName.trim() && jcName.trim();

  const handleCreate = async () => {
    if (!buddyName.trim()) {
      toast.error('Please enter Buddy name');
      return;
    }
    if (!jcName.trim()) {
      toast.error('Please enter Junior Commander name');
      return;
    }
    if (!ageGroup) {
      toast.error('Please select an age group');
      return;
    }

    setIsCreating(true);
    try {
      await createForm({
        rotationYear,
        rotationQuarter,
        buddyUserId: myRole === 'buddy' ? currentUserId : currentUserId, // Creator is always linked
        buddyName: buddyName.trim(),
        juniorCommanderUserId: myRole === 'jc' ? currentUserId : null,
        juniorCommanderName: jcName.trim(),
        ageGroup,
        evaluationDate: evaluationDate.getTime(),
      });

      toast.success('Review form created!');
      router.push('/app/review');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create form');
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Create Review Form</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the names of the Buddy and Junior Commander
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <Label className="text-sm font-medium text-foreground">I am the...</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={myRole === 'buddy' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setMyRole('buddy')}
            >
              Buddy
            </Button>
            <Button
              type="button"
              variant={myRole === 'jc' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setMyRole('jc')}
            >
              Junior Commander
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="buddyName" className="text-sm font-medium text-foreground">
            Buddy Name {myRole === 'buddy' && <span className="text-muted-foreground">(You)</span>}
          </Label>
          <Input
            id="buddyName"
            value={buddyName}
            onChange={(e) => setBuddyName(e.target.value)}
            placeholder="Enter Buddy's name"
            className="mt-1"
            autoFocus={myRole === 'jc'}
          />
        </div>

        <div>
          <Label htmlFor="jcName" className="text-sm font-medium text-foreground">
            Junior Commander Name{' '}
            {myRole === 'jc' && <span className="text-muted-foreground">(You)</span>}
          </Label>
          <Input
            id="jcName"
            value={jcName}
            onChange={(e) => setJcName(e.target.value)}
            placeholder="Enter Junior Commander's name"
            className="mt-1"
            autoFocus={myRole === 'buddy'}
          />
        </div>

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground"
            >
              <span>Advanced Options</span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              <p>
                Default: <strong>{formatRotationLabel(rotationYear, rotationQuarter)}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rotationYear" className="text-sm font-medium text-foreground">
                  Year
                </Label>
                <Input
                  id="rotationYear"
                  type="number"
                  value={rotationYear}
                  onChange={(e) => setRotationYear(Number.parseInt(e.target.value))}
                  min={2020}
                  max={2100}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rotationQuarter" className="text-sm font-medium text-foreground">
                  Rotation
                </Label>
                <Select
                  value={String(rotationQuarter)}
                  onValueChange={(value) => setRotationQuarter(Number.parseInt(value))}
                >
                  <SelectTrigger id="rotationQuarter" className="mt-1">
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
            </div>

            <div>
              <Label htmlFor="ageGroup" className="text-sm font-medium text-foreground">
                Age Group
              </Label>
              <AgeGroupSelect
                value={ageGroup}
                onValueChange={setAgeGroup}
                placeholder="Select age group"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Evaluation Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-1 w-full justify-start text-left font-normal"
                  >
                    {evaluationDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
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
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleCreate} disabled={isCreating || !canCreate} className="flex-1">
            {isCreating ? 'Creating...' : 'Create Form'}
          </Button>
          <Button variant="outline" onClick={() => router.back()} disabled={isCreating}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
