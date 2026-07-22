'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Search, UserPlus } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useAddParticipant, useSearchApplicants } from '../hooks/useRotations';
import type { AgeGroup } from '../types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAgeGroupLabel } from '@/modules/review/utils/ageGroupLabels';

interface ApplicantSearchProps {
  rotationId: Id<'rotations'>;
  isAdmin: boolean;
}

export function ApplicantSearch({ rotationId, isAdmin }: ApplicantSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchTerm]);

  const { results, isLoading } = useSearchApplicants(debouncedTerm, rotationId, isAdmin);
  const addParticipant = useAddParticipant();

  const handleAdd = useCallback(
    async (applicationId: Id<'jcepApplications'>) => {
      setAddingId(applicationId);
      try {
        await addParticipant({ rotationId, applicationId });
        toast.success('Participant added');
        setSearchTerm('');
        setDebouncedTerm('');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add participant');
      } finally {
        setAddingId(null);
      }
    },
    [addParticipant, rotationId]
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search applicants by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {debouncedTerm.length > 0 && debouncedTerm.length < 2 && (
        <p className="text-sm text-muted-foreground">Type at least 2 characters to search.</p>
      )}

      {debouncedTerm.length >= 2 && (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Searching...</p>
          ) : results.length === 0 ? (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                No applicants found matching &quot;{debouncedTerm}&quot;
              </p>
            </Card>
          ) : (
            results.map((applicant) => (
              <Card key={applicant._id} className="p-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{applicant.fullName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {applicant.contactNumber}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getAgeGroupLabel(applicant.ageGroupChoice1 as AgeGroup)}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(applicant._id as Id<'jcepApplications'>)}
                    disabled={addingId === applicant._id}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {addingId === applicant._id ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
