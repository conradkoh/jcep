'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useSetRotationParticipantAgeGroup } from '../hooks/useRotations';
import type { AgeGroup, RosterApplicant } from '../types';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';

const UNASSIGNED = '__unassigned__';

interface RotationRosterTableProps {
  currentRotationId: Id<'rotations'>;
  applicants: RosterApplicant[];
}

export function RotationRosterTable({ currentRotationId, applicants }: RotationRosterTableProps) {
  const [filterTerm, setFilterTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const setParticipantAgeGroup = useSetRotationParticipantAgeGroup();

  const filteredApplicants = useMemo(() => {
    const term = filterTerm.trim().toLowerCase();
    if (!term) return applicants;
    return applicants.filter((a) => a.fullName.toLowerCase().includes(term));
  }, [applicants, filterTerm]);

  const handleAgeGroupChange = async (applicant: RosterApplicant, value: string) => {
    setUpdatingId(applicant.applicationId);
    try {
      const ageGroup = value === UNASSIGNED ? null : (value as AgeGroup);
      await setParticipantAgeGroup({
        rotationId: currentRotationId,
        applicationId: applicant.applicationId,
        ageGroup,
      });
      toast.success(ageGroup ? 'Assigned to rotation' : 'Removed from rotation');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update assignment');
    } finally {
      setUpdatingId(null);
    }
  };

  if (applicants.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground text-center">
          No eligible applicants found within 1 year of the evaluation date.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by name..."
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <div className="overflow-hidden [&_[data-slot=table-container]]:overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>App Preference</TableHead>
                <TableHead>Age Group / Assignment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.map((applicant) => {
                const isAssigned = applicant.ageGroupOnRotation !== null;
                const isUpdating = updatingId === applicant.applicationId;
                const selectValue = applicant.ageGroupOnRotation ?? UNASSIGNED;

                return (
                  <TableRow
                    key={applicant.applicationId}
                    className={isAssigned ? 'bg-primary/5' : undefined}
                  >
                    <TableCell className="font-medium">{applicant.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {applicant.contactNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getAgeGroupLabel(applicant.ageGroupChoice1)}</Badge>
                    </TableCell>
                    <TableCell className="w-[220px]">
                      <Select
                        value={selectValue}
                        onValueChange={(value) =>
                          value !== null && handleAgeGroupChange(applicant, value)
                        }
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                          <SelectItem value="RK">{getAgeGroupLabel('RK')}</SelectItem>
                          <SelectItem value="DR">{getAgeGroupLabel('DR')}</SelectItem>
                          <SelectItem value="AR">{getAgeGroupLabel('AR')}</SelectItem>
                          <SelectItem value="ER">{getAgeGroupLabel('ER')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filterTerm && filteredApplicants.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          No applicants match &quot;{filterTerm}&quot;
        </p>
      )}
    </div>
  );
}
