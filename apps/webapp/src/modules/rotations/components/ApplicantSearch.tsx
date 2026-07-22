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
import { AgeGroupSelect } from '@/modules/review/components/AgeGroupSelect';
import { getAgeGroupLabel } from '@/modules/review/utils/ageGroupLabels';

interface ApplicantSearchProps {
  rotationId: Id<'rotations'>;
  isAdmin: boolean;
}

export function ApplicantSearch({ rotationId, isAdmin }: ApplicantSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [ageGroupByApplicant, setAgeGroupByApplicant] = useState<Record<string, AgeGroup>>({});
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

  useEffect(() => {
    if (results.length === 0) return;
    setAgeGroupByApplicant((prev) => {
      const next = { ...prev };
      for (const applicant of results) {
        if (!next[applicant._id]) {
          next[applicant._id] = applicant.ageGroupChoice1;
        }
      }
      return next;
    });
  }, [results]);

  const handleAdd = useCallback(
    async (applicationId: Id<'jcepApplications'>) => {
      const ageGroup = ageGroupByApplicant[applicationId];
      if (!ageGroup) {
        toast.error('Please select an age group');
        return;
      }
      setAddingId(applicationId);
      try {
        await addParticipant({ rotationId, applicationId, ageGroup });
        toast.success('Participant added');
        setSearchTerm('');
        setDebouncedTerm('');
        setAgeGroupByApplicant({});
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to add participant');
      } finally {
        setAddingId(null);
      }
    },
    [addParticipant, rotationId, ageGroupByApplicant]
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
            results.map((applicant) => {
              const selectedAgeGroup =
                ageGroupByApplicant[applicant._id] ?? applicant.ageGroupChoice1;
              return (
                <Card key={applicant._id} className="p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{applicant.fullName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {applicant.contactNumber}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          App preference: {getAgeGroupLabel(applicant.ageGroupChoice1 as AgeGroup)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <AgeGroupSelect
                        value={selectedAgeGroup}
                        onValueChange={(value) =>
                          setAgeGroupByApplicant((prev) => ({
                            ...prev,
                            [applicant._id]: value,
                          }))
                        }
                        className="w-[180px]"
                        placeholder="Age group"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAdd(applicant._id as Id<'jcepApplications'>)}
                        disabled={addingId === applicant._id}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {addingId === applicant._id ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
