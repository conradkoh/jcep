'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useCreateRotation } from '../hooks/useRotations';

import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import {
  getDefaultRotationNumber,
  getRotationNumberOptions,
} from '@/modules/review/utils/rotationUtils';

interface RotationCreateFormProps {
  onCreated: (rotationId: Id<'rotations'>) => void;
}

export function RotationCreateForm({ onCreated }: RotationCreateFormProps) {
  const createRotation = useCreateRotation();
  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const [rotationYear, setRotationYear] = useState(currentYear);
  const [rotationQuarter, setRotationQuarter] = useState(getDefaultRotationNumber());
  const [evaluationDate, setEvaluationDate] = useState<Date>(new Date());
  const [label, setLabel] = useState('');

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const result = await createRotation({
        rotationYear,
        rotationQuarter,
        evaluationDate: evaluationDate.getTime(),
        label: label.trim() || undefined,
      });
      toast.success('Rotation created');
      onCreated(result.rotationId as Id<'rotations'>);
      setIsOpen(false);
      setRotationYear(currentYear);
      setRotationQuarter(getDefaultRotationNumber());
      setEvaluationDate(new Date());
      setLabel('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create rotation');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-accent/20 transition-colors">
            <h2 className="text-xl font-semibold text-foreground">Create Rotation</h2>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rotationYear" className="text-sm font-medium text-foreground">
                  Year
                </Label>
                <Input
                  id="rotationYear"
                  type="number"
                  value={rotationYear}
                  onChange={(e) => setRotationYear(Number.parseInt(e.target.value) || currentYear)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rotationQuarter" className="text-sm font-medium text-foreground">
                  Rotation
                </Label>
                <Select
                  value={String(rotationQuarter)}
                  onValueChange={(value) =>
                    value !== null && setRotationQuarter(Number.parseInt(value))
                  }
                >
                  <SelectTrigger id="rotationQuarter" className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {getRotationNumberOptions().map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Evaluation Date</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'mt-1 w-full justify-start text-left font-normal'
                  )}
                >
                  {evaluationDate.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
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
              <Label htmlFor="label" className="text-sm font-medium text-foreground">
                Label (optional)
              </Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. JCEP 2025 - Batch 1"
                className="mt-1"
              />
            </div>
            <Button onClick={handleCreate} disabled={isCreating} className="w-full">
              {isCreating ? 'Creating...' : 'Create Rotation'}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
