'use client';

import { api } from '@workspace/backend/convex/_generated/api';
import type { Id } from '@workspace/backend/convex/_generated/dataModel';
import { useSessionMutation, useSessionQuery } from 'convex-helpers/react/sessions';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAuthState } from '@/modules/auth/AuthProvider';
import { RequireLogin } from '@/modules/auth/RequireLogin';

type AgeGroup = 'RK' | 'DR' | 'AR' | 'ER';

interface FormData {
  fullName: string;
  contactNumber: string;
  ageGroupChoice1: AgeGroup | '';
  reasonForChoice1: string;
  ageGroupChoice2: AgeGroup | '';
  reasonForChoice2: string;
}

const AGE_GROUPS: { value: AgeGroup; label: string; description: string }[] = [
  { value: 'RK', label: 'RK', description: 'Rangers Kids' },
  { value: 'DR', label: 'DR', description: 'Discovery Rangers' },
  { value: 'AR', label: 'AR', description: 'Adventure Rangers' },
  { value: 'ER', label: 'ER', description: 'Expedition Rangers' },
];

function ApplicationEditContent({ applicationId }: { applicationId: Id<'jcepApplications'> }) {
  const router = useRouter();
  const authState = useAuthState();
  const isAdmin =
    authState?.state === 'authenticated' && authState.user.accessLevel === 'system_admin';

  const application = useSessionQuery(
    api.jcepApplications.getApplication,
    isAdmin ? { applicationId } : 'skip'
  );

  const updateMutation = useSessionMutation(api.jcepApplications.updateApplication);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    contactNumber: '',
    ageGroupChoice1: '',
    reasonForChoice1: '',
    ageGroupChoice2: '',
    reasonForChoice2: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data when application loads
  useEffect(() => {
    if (application && !isInitialized) {
      setFormData({
        fullName: application.fullName,
        contactNumber: application.contactNumber,
        ageGroupChoice1: application.ageGroupChoice1,
        reasonForChoice1: application.reasonForChoice1,
        ageGroupChoice2: application.ageGroupChoice2 || '',
        reasonForChoice2: application.reasonForChoice2 || '',
      });
      setIsInitialized(true);
    }
  }, [application, isInitialized]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.ageGroupChoice1) {
      newErrors.ageGroupChoice1 = 'Age group choice 1 is required';
    }
    if (!formData.reasonForChoice1.trim()) {
      newErrors.reasonForChoice1 = 'Reason for choice 1 is required';
    }
    if (formData.ageGroupChoice2 && !formData.reasonForChoice2.trim()) {
      newErrors.reasonForChoice2 = 'Reason is required when age group choice 2 is selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMutation({
        applicationId,
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        ageGroupChoice1: formData.ageGroupChoice1 as AgeGroup,
        reasonForChoice1: formData.reasonForChoice1,
        ageGroupChoice2: formData.ageGroupChoice2 || undefined,
        reasonForChoice2: formData.reasonForChoice2 || undefined,
      });
      toast.success('Application updated successfully');
      router.push(`/app/applications/${applicationId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Non-admin users see access denied
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Shield className="h-12 w-12 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
              <p className="text-muted-foreground">
                Only system administrators can edit JCEP applications.
              </p>
              <Button asChild variant="outline">
                <Link href="/app">Back to Dashboard</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (application === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Loading application...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (application === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Application not found.</p>
              <Button asChild variant="outline">
                <Link href="/app/applications">Back to Applications</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/app/applications/${applicationId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Application</h1>
              <p className="text-muted-foreground mt-1">Update the application details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactNumber">
                    Contact Number <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="Enter contact number"
                    className="mt-1"
                  />
                  {errors.contactNumber && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Serving Preferences */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Serving Preferences</h2>

              <div className="space-y-6">
                <div>
                  <Label>
                    Age Group Choice 1 <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.ageGroupChoice1}
                    onValueChange={(value) =>
                      setFormData({ ...formData, ageGroupChoice1: value as AgeGroup })
                    }
                    className="mt-2 space-y-3"
                  >
                    {AGE_GROUPS.map((group) => (
                      <div key={group.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={group.value} id={`choice1-${group.value}`} />
                        <Label
                          htmlFor={`choice1-${group.value}`}
                          className="font-normal cursor-pointer"
                        >
                          {group.label} - {group.description}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.ageGroupChoice1 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {errors.ageGroupChoice1}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="reasonForChoice1">
                    Reason for Choice 1 <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="reasonForChoice1"
                    value={formData.reasonForChoice1}
                    onChange={(e) => setFormData({ ...formData, reasonForChoice1: e.target.value })}
                    placeholder="Please explain why this age group was chosen..."
                    className="mt-1"
                    rows={4}
                  />
                  {errors.reasonForChoice1 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.reasonForChoice1}
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <Label>Age Group Choice 2 (Optional)</Label>
                  <RadioGroup
                    value={formData.ageGroupChoice2}
                    onValueChange={(value) =>
                      setFormData({ ...formData, ageGroupChoice2: value as AgeGroup })
                    }
                    className="mt-2 space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="choice2-none" />
                      <Label htmlFor="choice2-none" className="font-normal cursor-pointer">
                        No second choice
                      </Label>
                    </div>
                    {AGE_GROUPS.map((group) => (
                      <div key={group.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={group.value} id={`choice2-${group.value}`} />
                        <Label
                          htmlFor={`choice2-${group.value}`}
                          className="font-normal cursor-pointer"
                        >
                          {group.label} - {group.description}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {formData.ageGroupChoice2 && (
                  <div>
                    <Label htmlFor="reasonForChoice2">
                      Reason for Choice 2 <span className="text-red-600 dark:text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="reasonForChoice2"
                      value={formData.reasonForChoice2}
                      onChange={(e) =>
                        setFormData({ ...formData, reasonForChoice2: e.target.value })
                      }
                      placeholder="Please explain why this age group was chosen..."
                      className="mt-1"
                      rows={4}
                    />
                    {errors.reasonForChoice2 && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.reasonForChoice2}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href={`/app/applications/${applicationId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ApplicationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <RequireLogin>
      <ApplicationEditContent applicationId={id as Id<'jcepApplications'>} />
    </RequireLogin>
  );
}
