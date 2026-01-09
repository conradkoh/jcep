'use client';

import { api } from '@workspace/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useSessionId } from 'convex-helpers/react/sessions';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

type AgeGroup = 'RK' | 'DR' | 'AR' | 'ER';

interface FormData {
  // Step 1 - Acknowledgement
  acknowledgedMottoAndPledge: boolean;

  // Step 2 - Personal Particulars
  fullName: string;
  contactNumber: string;

  // Step 3 - Serving Preferences
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

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submitApplication = useMutation(api.jcepApplications.submitApplication);
  const [sessionId] = useSessionId();

  const [formData, setFormData] = useState<FormData>({
    acknowledgedMottoAndPledge: false,
    fullName: '',
    contactNumber: '',
    ageGroupChoice1: '',
    reasonForChoice1: '',
    ageGroupChoice2: '',
    reasonForChoice2: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.acknowledgedMottoAndPledge) {
        newErrors.acknowledgedMottoAndPledge =
          'You must acknowledge the Royal Rangers Motto, Pledge, and Code';
      }
    }

    if (step === 2) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.contactNumber.trim()) {
        newErrors.contactNumber = 'Contact number is required';
      }
    }

    if (step === 3) {
      if (!formData.ageGroupChoice1) {
        newErrors.ageGroupChoice1 = 'Age group choice 1 is required';
      }
      if (!formData.reasonForChoice1.trim()) {
        newErrors.reasonForChoice1 = 'Reason for choice 1 is required';
      }
      if (formData.ageGroupChoice2 && !formData.reasonForChoice2.trim()) {
        newErrors.reasonForChoice2 = 'Reason is required when age group choice 2 is selected';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplication({
        sessionId: sessionId || undefined, // Pass session ID to associate logged-in user
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        ageGroupChoice1: formData.ageGroupChoice1 as AgeGroup,
        reasonForChoice1: formData.reasonForChoice1,
        ageGroupChoice2: formData.ageGroupChoice2 || undefined,
        reasonForChoice2: formData.reasonForChoice2 || undefined,
        acknowledgedMottoAndPledge: formData.acknowledgedMottoAndPledge,
      });
      setIsSuccess(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center space-y-6">
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto" />
              <h1 className="text-3xl font-bold text-foreground">Application Submitted!</h1>
              <p className="text-muted-foreground">
                Thank you for applying to the Junior Commander Exposure Programme. We have received
                your application and will be in touch soon.
              </p>
              <div className="pt-4">
                <Link href="/">
                  <Button>Return to Home</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">JCEP Application</h1>
          <p className="text-muted-foreground">
            Royal Rangers Outpost 1 - Junior Commander Exposure Programme 2025
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
                <p className="text-muted-foreground mb-6">
                  We are delighted that you are interested to consider Royal Rangers as a ministry
                  you would like to serve in. The journey to becoming a commander is a challenging
                  and rewarding opportunity for growth - Mentally, Physically, Spiritually,
                  Socially.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-accent/40 rounded-md">
                  <h3 className="font-semibold text-foreground mb-2">Royal Rangers Motto</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">&quot;Ready&quot;</span> - Meaning of Motto: Ready
                    for anything! Ready to work, play, serve, worship, live, and obey God&apos;s
                    Word.
                  </p>
                </div>

                <div className="p-4 bg-accent/40 rounded-md">
                  <h3 className="font-semibold text-foreground mb-2">Royal Rangers Pledge</h3>
                  <p className="text-sm text-muted-foreground">
                    With God&apos;s help, I will do my best to: Serve God, my church, and my fellow
                    man. To live by the Ranger Code. To make the golden rule my daily rule.
                  </p>
                </div>

                <div className="p-4 bg-accent/40 rounded-md">
                  <h3 className="font-semibold text-foreground mb-2">Royal Rangers Code</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-bold">ALERT:</span> He is mentally, physically, and
                      spiritually alert.
                    </p>
                    <p>
                      <span className="font-bold">CLEAN:</span> He is clean in body, mind, and
                      speech.
                    </p>
                    <p>
                      <span className="font-bold">HONEST:</span> He does not lie, cheat, or steal.
                    </p>
                    <p>
                      <span className="font-bold">COURAGEOUS:</span> He is brave in spite of danger,
                      criticism, or threats.
                    </p>
                    <p>
                      <span className="font-bold">LOYAL:</span> He is faithful to his church,
                      family, outpost, and friends.
                    </p>
                    <p>
                      <span className="font-bold">COURTEOUS:</span> He is polite, kind, and
                      thoughtful.
                    </p>
                    <p>
                      <span className="font-bold">OBEDIENT:</span> He obeys his parents, leaders,
                      and those in authority.
                    </p>
                    <p>
                      <span className="font-bold">SPIRITUAL:</span> He prays, reads the Bible, and
                      witnesses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acknowledgement"
                    checked={formData.acknowledgedMottoAndPledge}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, acknowledgedMottoAndPledge: !!checked })
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="acknowledgement"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I acknowledge and agree
                    </label>
                    <p className="text-sm text-muted-foreground">
                      By applying for this programme, I agree to commit to coming for weekly
                      programmes, and understand that my mentor(s) may give me feedback with the
                      intention of preparing me to readiness towards becoming a commander.
                    </p>
                  </div>
                </div>
                {errors.acknowledgedMottoAndPledge && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {errors.acknowledgedMottoAndPledge}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Personal Particulars
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your personal particulars will be used to add you to group chats and will be
                  shared with your assigned mentor.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
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
                    placeholder="Enter your contact number"
                    className="mt-1"
                  />
                  {errors.contactNumber && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Serving Preferences</h2>
                <p className="text-muted-foreground mb-6">
                  As part of the programme, you will have at least one rotation where an age group
                  will be pre-assigned. Later on, there will be opportunities to also serve in an
                  age group of your choice. Do take some time to pray before filling in this
                  section.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Note: Your mentors and/or the JCEP team may reach out to you to discuss to see if
                  you are willing to consider another age group if needs arise, or to discuss
                  suitability.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="ageGroupChoice1">
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
                    placeholder="Please explain why you chose this age group..."
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
                  <Label htmlFor="ageGroupChoice2">Age Group Choice 2 (Optional)</Label>
                  <RadioGroup
                    value={formData.ageGroupChoice2}
                    onValueChange={(value) =>
                      setFormData({ ...formData, ageGroupChoice2: value as AgeGroup })
                    }
                    className="mt-2 space-y-3"
                  >
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
                      placeholder="Please explain why you chose this age group..."
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
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Review & Submit</h2>
                <p className="text-muted-foreground mb-6">
                  Please review your application before submitting. You can go back to edit any
                  section if needed.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-accent/40 rounded-md">
                  <h3 className="font-semibold text-foreground mb-3">Personal Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Full Name:</dt>
                      <dd className="font-medium text-foreground">{formData.fullName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Contact Number:</dt>
                      <dd className="font-medium text-foreground">{formData.contactNumber}</dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 bg-accent/40 rounded-md">
                  <h3 className="font-semibold text-foreground mb-3">Serving Preferences</h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground mb-1">Age Group Choice 1:</dt>
                      <dd className="font-medium text-foreground">{formData.ageGroupChoice1}</dd>
                      <dd className="text-muted-foreground mt-1">{formData.reasonForChoice1}</dd>
                    </div>
                    {formData.ageGroupChoice2 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <dt className="text-muted-foreground mb-1">Age Group Choice 2:</dt>
                        <dd className="font-medium text-foreground">{formData.ageGroupChoice2}</dd>
                        <dd className="text-muted-foreground mt-1">{formData.reasonForChoice2}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-semibold">Important:</span> By submitting this
                    application, you acknowledge that you have read and agree to the Royal Rangers
                    Motto, Pledge, and Code, and commit to attending weekly programmes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit Application</>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
