'use client';

import { Download } from 'lucide-react';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { ReviewForm } from '../../types';

interface AdminReviewExportProps {
  forms: ReviewForm[];
  year: number;
}

export function AdminReviewExport({ forms, year }: AdminReviewExportProps) {
  const handleExport = () => {
    if (forms.length === 0) {
      toast.error('No forms to export');
      return;
    }

    try {
      // Prepare CSV data
      const headers = [
        'Rotation Year',
        'Junior Commander',
        'Buddy',
        'Age Group',
        'Evaluation Date',
        'Status',
        'Next Rotation Preference',
        'Buddy Evaluation Complete',
        'JC Reflection Complete',
        'JC Feedback Complete',
        'Submitted At',
        'Submitted By',
      ];

      const rows = forms.map((form) => [
        form.rotationYear,
        form.juniorCommanderName,
        form.buddyName,
        form.ageGroup,
        DateTime.fromMillis(form.evaluationDate).toFormat('yyyy-MM-dd'),
        form.status,
        form.nextRotationPreference || '',
        form.buddyEvaluation ? 'Yes' : 'No',
        form.jcReflection ? 'Yes' : 'No',
        form.jcFeedback ? 'Yes' : 'No',
        form.submittedAt ? DateTime.fromMillis(form.submittedAt).toFormat('yyyy-MM-dd HH:mm') : '',
        form.submittedBy || '',
      ]);

      // Convert to CSV
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if contains comma
              const cellStr = String(cell);
              if (cellStr.includes(',') || cellStr.includes('"')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(',')
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `jcep-review-forms-${year}-${DateTime.now().toFormat('yyyyMMdd')}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Forms exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export forms');
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" disabled={forms.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Export to CSV ({forms.length} forms)
    </Button>
  );
}
