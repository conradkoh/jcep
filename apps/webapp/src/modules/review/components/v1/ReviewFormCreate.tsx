'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { CalendarIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { cn } from '@/lib/utils';
import { useCreateReviewForm } from '../../hooks/useReviewForm';
import type { AgeGroup } from '../../types';

interface ReviewFormCreateProps {
  currentUserId: Id<'users'>;
}

export function ReviewFormCreate({ currentUserId }: ReviewFormCreateProps) {
  const router = useRouter();
  const createForm = useCreateReviewForm();

  const currentYear = new Date().getFullYear();
  const [rotationYear, setRotationYear] = useState(currentYear);
  const [buddyName, setBuddyName] = useState('');
  const [jcName, setJcName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('');
  const [evaluationDate, setEvaluationDate] = useState<Date | undefined>(new Date());
  const [isCreating, setIsCreating] = useState(false);

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
    if (!evaluationDate) {
      toast.error('Please select an evaluation date');
      return;
    }

    setIsCreating(true);
    try {
      await createForm({
        rotationYear,
        buddyUserId: currentUserId,
        buddyName: buddyName.trim(),
        juniorCommanderUserId: null, // For now, JC is not a registered user
        juniorCommanderName: jcName.trim(),
        ageGroup,
        evaluationDate: evaluationDate.getTime(),
      });

      toast.success(`Review form created for ${jcName.trim()}!`);
      // Redirect to listing page where admin can copy tokens
      router.push('/app/review');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create form');
      setIsCreating(false);
    }
  };

  const formatDate = (date: Date) => {
    return DateTime.fromJSDate(date).toFormat('dd MMM yyyy');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Review Form</h1>
        <p className="text-sm text-muted-foreground">
          Create a new rotation review form for a Junior Commander
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <Label htmlFor="rotationYear" className="text-sm font-medium text-foreground">
            Rotation Year
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
          <Label htmlFor="buddyName" className="text-sm font-medium text-foreground">
            Buddy Name
          </Label>
          <Input
            id="buddyName"
            value={buddyName}
            onChange={(e) => setBuddyName(e.target.value)}
            placeholder="Enter Buddy's name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="jcName" className="text-sm font-medium text-foreground">
            Junior Commander Name
          </Label>
          <Input
            id="jcName"
            value={jcName}
            onChange={(e) => setJcName(e.target.value)}
            placeholder="Enter Junior Commander's name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="ageGroup" className="text-sm font-medium text-foreground">
            Age Group
          </Label>
          <Select value={ageGroup} onValueChange={(value) => setAgeGroup(value as AgeGroup)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RK">RK (Rainbows/Kindergarten)</SelectItem>
              <SelectItem value="DR">DR (Daisies/Reception)</SelectItem>
              <SelectItem value="AR">AR (Acorns/Reception)</SelectItem>
              <SelectItem value="ER">ER (Eagles/Reception)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground">Evaluation Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'mt-1 w-full justify-start text-left font-normal',
                  !evaluationDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {evaluationDate ? formatDate(evaluationDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={evaluationDate}
                onSelect={setEvaluationDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleCreate} disabled={isCreating} className="flex-1">
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
