'use client';

import { Trash2, User } from 'lucide-react';
import { useState } from 'react';

import type { AgeGroup, RotationParticipant } from '../types';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAgeGroupLabel } from '@/modules/review/utils/ageGroupLabels';

interface RotationParticipantsTableProps {
  participants: RotationParticipant[];
  onRemove: (participantId: string) => void;
  removingId: string | null;
}

export function RotationParticipantsTable({
  participants,
  onRemove,
  removingId,
}: RotationParticipantsTableProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (participants.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <User className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No participants assigned to this rotation.</p>
          <p className="text-sm text-muted-foreground">Search and add applicants above.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-hidden [&_[data-slot=table-container]]:overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[25%]">Contact</TableHead>
              <TableHead className="w-[25%]">Age Group</TableHead>
              <TableHead className="w-[20%]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant._id}>
                <TableCell className="font-medium">{participant.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{participant.contactNumber}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getAgeGroupLabel(participant.ageGroup as AgeGroup)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <AlertDialog
                    open={confirmingId === participant._id}
                    onOpenChange={(open) => {
                      if (!open) setConfirmingId(null);
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => setConfirmingId(participant._id)}
                        disabled={removingId === participant._id}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Participant</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove{' '}
                          <span className="font-medium">{participant.fullName}</span> from this
                          rotation? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            onRemove(participant._id);
                            setConfirmingId(null);
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {removingId === participant._id ? 'Removing...' : 'Remove'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
