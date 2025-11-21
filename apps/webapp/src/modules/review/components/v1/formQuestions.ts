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
  areasForImprovement:
    'What are some areas of improvement for the Junior Commander? Please provide specific examples.',
  wordsOfEncouragement: 'Any words of encouragement for the Junior Commander?',
} as const;

export const JC_REFLECTION_QUESTIONS = {
  activitiesParticipated:
    'What were some memorable or impactful activities that you participated in during this rotation?',
  learningsFromJCEP:
    'What have you learned in your experience during the JCEP? (Consider devotions, ministry impact, personal growth)',
  whatToDoDifferently: 'Is there anything you would have done differently in this rotation?',
  goalsForNextRotation:
    'What are some things you would like to focus on in your next rotation? Any areas that you need encouragement in or prayer for?',
} as const;

export const JC_FEEDBACK_QUESTIONS = {
  gratitudeToBuddy: 'Any words of encouragement or gratitude to your buddy? :)',
  programFeedback: 'Any feedback for the JCEP programme? (What went well, what could be improved)',
} as const;
