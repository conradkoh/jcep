'use client';

import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useSetApplicantAssignment } from '../hooks/useRotations';
import type { AgeGroup, RosterApplicant, Rotation } from '../types';

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
import { AgeGroupSelect } from '@/modules/jcep/components/AgeGroupSelect';
import { getAgeGroupLabel } from '@/modules/jcep/utils/ageGroupLabels';
import { formatRotationLabel } from '@/modules/review/utils/rotationUtils';

const UNASSIGNED = 'unassigned';

interface RotationRosterTableProps {
  currentRotationId: Id<'rotations'>;
  rotations: Rotation[];
  applicants: RosterApplicant[];
}

function getRotationDisplayLabel(rotation: Rotation): string {
  return rotation.label || formatRotationLabel(rotation.rotationYear, rotation.rotationQuarter);
}

export function RotationRosterTable({
  currentRotationId,
  rotations,
  applicants,
}: RotationRosterTableProps) {
  const [filterTerm, setFilterTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const setAssignment = useSetApplicantAssignment();

  const filteredApplicants = useMemo(() => {
    const term = filterTerm.trim().toLowerCase();
    if (!term) return applicants;
    return applicants.filter((a) => a.fullName.toLowerCase().includes(term));
  }, [applicants, filterTerm]);

  const handleRotationChange = async (applicant: RosterApplicant, value: string) => {
    setUpdatingId(applicant.applicationId);
    try {
      const rotationId = value === UNASSIGNED ? null : (value as Id<'rotations'>);
      const ageGroup =
        rotationId !== null ? (applicant.ageGroup ?? applicant.ageGroupChoice1) : undefined;
      await setAssignment({
        applicationId: applicant.applicationId,
        rotationId,
        ageGroup,
      });
      toast.success(rotationId ? 'Assignment updated' : 'Applicant unassigned');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update assignment');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAgeGroupChange = async (applicant: RosterApplicant, ageGroup: AgeGroup) => {
    if (!applicant.assignedRotationId) return;
    setUpdatingId(applicant.applicationId);
    try {
      await setAssignment({
        applicationId: applicant.applicationId,
        rotationId: applicant.assignedRotationId,
        ageGroup,
      });
      toast.success('Age group updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update age group');
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
                <TableHead>Age Group</TableHead>
                <TableHead>Assigned Rotation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.map((applicant) => {
                const isAssigned = applicant.assignedRotationId !== null;
                const isUpdating = updatingId === applicant.applicationId;
                const selectValue = applicant.assignedRotationId ?? UNASSIGNED;
                const isOnCurrentRotation = applicant.assignedRotationId === currentRotationId;

                return (
                  <TableRow
                    key={applicant.applicationId}
                    className={isOnCurrentRotation ? 'bg-primary/5' : undefined}
                  >
                    <TableCell className="font-medium">{applicant.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {applicant.contactNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getAgeGroupLabel(applicant.ageGroupChoice1)}</Badge>
                    </TableCell>
                    <TableCell>
                      {isAssigned ? (
                        <AgeGroupSelect
                          value={applicant.ageGroup ?? applicant.ageGroupChoice1}
                          onValueChange={(value) => handleAgeGroupChange(applicant, value)}
                          className="w-[160px]"
                          disabled={isUpdating}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">&mdash;</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={selectValue}
                        onValueChange={(value) => handleRotationChange(applicant, value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                          {rotations.map((rotation) => (
                            <SelectItem key={rotation._id} value={rotation._id}>
                              {getRotationDisplayLabel(rotation)}
                            </SelectItem>
                          ))}
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
