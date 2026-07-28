'use client';

import { MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitFeedback } from '@/modules/feedback/hooks/useFeedback';

export default function FeedbackPage() {
  const submitFeedback = useSubmitFeedback();
  const [respondentName, setRespondentName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        respondentName: respondentName.trim() || undefined,
        message: message.trim(),
      });
      setSubmitted(true);
      setRespondentName('');
      setMessage('');
      toast.success('Thank you for your feedback');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Feedback Submitted</CardTitle>
            <CardDescription>
              Thank you for sharing your feedback. It has been recorded successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => setSubmitted(false)}>Submit Another</Button>
            <Button variant="outline" asChild>
              <Link href="/app">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Share Your Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Help us improve the JCEP programme by sharing your thoughts and suggestions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
          <CardDescription>
            Your name is optional. All feedback is reviewed by programme administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="respondentName">Your Name (optional)</Label>
              <Input
                id="respondentName"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Leave blank to submit anonymously"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Feedback</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your feedback, suggestions, or comments..."
                rows={6}
                required
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
              <Button variant="outline" type="button" asChild>
                <Link href="/app">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
