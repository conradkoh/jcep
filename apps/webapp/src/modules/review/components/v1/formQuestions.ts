/**
 * Question text constants for Review Form Version 1
 *
 * These constants define the question text for each field in the form.
 * When questions are updated, new responses will capture the new text,
 * while old responses retain their original question text.
 */

export const BUDDY_EVALUATION_QUESTIONS = {
  tasksParticipated: 'What were some tasks that the Junior Commander participated in?',
  strengths:
    "What are some of the Junior Commander's strengths, and which areas did they perform well in?",
  areasForImprovement: 'What are some areas of improvement for the Junior Commander?',
  wordsOfEncouragement: 'Any words of encouragement for the Junior Commander?',
} as const;

export const JC_REFLECTION_QUESTIONS = {
  activitiesParticipated: 'What were some activities that you participated in?',
  learningsFromJCEP: 'What have you learned in your experience during the JCEP?',
  whatToDoDifferently: 'Is there anything you would have done differently in this rotation?',
  goalsForNextRotation:
    'What are some things you would do differently in your next rotation? Any areas that you need encouragement in / prayer for?',
} as const;

export const JC_FEEDBACK_QUESTIONS = {
  gratitudeToBuddy: 'Any words of encouragement / gratitude to your buddy? :)',
  programFeedback: 'Any feedback for the JCEP programme?',
} as const;
