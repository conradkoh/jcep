# JCEP Review Form - Autosave & Form State Improvements

## Overview

Implement autosave with debounce and field-level save indicators across all review form sections (Buddy Evaluation, JC Reflection, JC Feedback). Clarify the three form states and make the Submit button functionality explicit.

## Current State

### Form States
The system uses three states tracked in `form.status`:
1. **`draft`** - Not started (form created but no sections completed)
2. **`in_progress`** - In progress (at least one section has data)
3. **`submitted`** - Submitted (form finalized, no further edits)

### Existing Autosave Implementation
- ✅ **BuddyEvaluationSection**: Has field-level autosave with independent save indicators
- ❌ **JCReflectionSection**: No autosave, manual save button only
- ❌ **JCFeedbackSection**: No autosave, manual save button only

### Current Button Behavior
- **Save Button**: Saves section data, form stays in `in_progress` state
- **Submit Button**: Should change form state to `submitted` (blocking future edits)
- **Issue**: Submit button not clearly distinguished from Save

## Requirements

### 1. Form State Clarification
- Form starts in `draft` state when created
- First save to any section moves form to `in_progress`
- Only explicit "Submit" action should move form to `submitted`
- Once `submitted`, no edits allowed (form locked)

### 2. Autosave Behavior
- All text fields should autosave with 1.5-second debounce
- Each field tracks its own save state independently
- Visual indicators show "Modified" (amber ●) or "Saved" (green ✓)
- Autosave does NOT change form state to `submitted`

### 3. Button Behavior
- **While editing**: Show "Save" button (manual save option)
- **When all sections complete**: Show "Submit Form" button (changes state to `submitted`)
- Submit button should have confirmation dialog
- After submission, all sections show read-only view

## Implementation Plan

### Phase 1: Extract Reusable Components ✅

**File**: `apps/webapp/src/modules/review/components/v1/SaveIndicator.tsx` (NEW)

Extract the `SaveIndicator` component from `BuddyEvaluationSection.tsx`:

```typescript
interface SaveIndicatorProps {
  status: 'saved' | 'modified' | 'none';
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'none') return null;
  
  if (status === 'modified') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
        <Circle className="h-3 w-3 fill-current" />
        <span>Modified</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
      <Check className="h-3 w-3" />
      <span>Saved</span>
    </div>
  );
}
```

**File**: `apps/webapp/src/modules/review/components/v1/useFieldAutosave.ts` (NEW)

Create a reusable hook for field-level autosave:

```typescript
interface UseFieldAutosaveOptions<T> {
  fields: readonly string[];
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
}

interface UseFieldAutosaveReturn<T> {
  handleFieldChange: (field: string, value: string, currentData: T) => void;
  getSaveStatus: (field: string) => 'saved' | 'modified' | 'none';
  isAnySaving: boolean;
  isSaving: (field: string) => boolean;
}

export function useFieldAutosave<T>(options: UseFieldAutosaveOptions<T>): UseFieldAutosaveReturn<T>
```

### Phase 2: Refactor BuddyEvaluationSection ✅

**File**: `apps/webapp/src/modules/review/components/v1/BuddyEvaluationSection.tsx`

- ✅ Extract `SaveIndicator` to separate file
- ✅ Use `useFieldAutosave` hook
- ✅ Ensure field-level save tracking works correctly
- ✅ Keep existing autosave behavior

### Phase 3: Add Autosave to JCReflectionSection

**File**: `apps/webapp/src/modules/review/components/v1/JCReflectionSection.tsx`

Changes needed:
1. Import `SaveIndicator` and `useFieldAutosave`
2. Set up field tracking for:
   - `activitiesParticipated`
   - `learningsFromJCEP`
   - `whatToDoDifferently`
   - `goalsForNextRotation`
3. Add save indicators to each field label
4. Replace manual onChange handlers with `handleFieldChange`
5. Keep manual "Save" button for explicit saves

### Phase 4: Add Autosave to JCFeedbackSection

**File**: `apps/webapp/src/modules/review/components/v1/JCFeedbackSection.tsx`

Changes needed:
1. Import `SaveIndicator` and `useFieldAutosave`
2. Set up field tracking for:
   - `gratitudeToBuddy`
   - `programFeedback`
3. Add save indicators to each field label
4. Replace manual onChange handlers with `handleFieldChange`
5. Keep manual "Save" button for explicit saves

### Phase 5: Clarify Submit Button Behavior

**File**: `apps/webapp/src/modules/review/components/v1/ParticularsSection.tsx`

Current code shows:
```typescript
{isComplete && !isSubmitted && canSubmit && (
  <Button onClick={onSubmit}>Submit Form</Button>
)}
```

Changes needed:
1. Add confirmation dialog before submit
2. Make button more prominent (primary variant)
3. Add clear messaging: "Submit Form (Final - No Further Edits)"
4. Ensure `onSubmit` updates form status to `submitted`

**File**: `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`

Update `handleSubmit` to:
```typescript
const handleSubmit = async () => {
  if (!submitForm) return;
  
  // Show confirmation (using browser confirm for now, or add AlertDialog)
  const confirmed = confirm(
    'Are you sure you want to submit this form? ' +
    'Once submitted, you will not be able to make further edits.'
  );
  
  if (!confirmed) return;
  
  try {
    await submitForm(formId);
  } catch (error) {
    console.error('Failed to submit form:', error);
  }
};
```

### Phase 6: Backend State Validation

**File**: `services/backend/convex/reviewForms.ts`

Verify that:
1. ✅ Update mutations (buddy/JC sections) do NOT change form state to `submitted`
2. ✅ Only `submitReviewForm` mutation changes state to `submitted`
3. ✅ Update mutations fail if form is already `submitted`

Current implementation should already handle this, but verify:
```typescript
// In update mutations, check:
if (form.status === 'submitted') {
  throw new Error('Cannot update a submitted form');
}

// Update should set status to 'in_progress' if currently 'draft':
if (form.status === 'draft') {
  await ctx.db.patch(formId, { status: 'in_progress', ...updates });
}
```

## File Changes Summary

### New Files
- `apps/webapp/src/modules/review/components/v1/SaveIndicator.tsx`
- `apps/webapp/src/modules/review/components/v1/useFieldAutosave.ts`

### Modified Files
- `apps/webapp/src/modules/review/components/v1/BuddyEvaluationSection.tsx` - Refactor to use shared components
- `apps/webapp/src/modules/review/components/v1/JCReflectionSection.tsx` - Add autosave
- `apps/webapp/src/modules/review/components/v1/JCFeedbackSection.tsx` - Add autosave
- `apps/webapp/src/modules/review/components/v1/ParticularsSection.tsx` - Add submit confirmation
- `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx` - Update submit handler
- `services/backend/convex/reviewForms.ts` - Verify state transition logic

### Backend Verification
- Ensure update mutations respect form state
- Ensure only submit mutation changes to `submitted`
- Verify edit permissions check form state

## Testing Checklist

- [ ] Buddy section: Each field saves independently with correct indicators
- [ ] JC Reflection: Each field saves independently with correct indicators
- [ ] JC Feedback: Each field saves independently with correct indicators
- [ ] Form state progresses: draft → in_progress → submitted
- [ ] Autosave does not trigger submission
- [ ] Submit button only appears when all sections complete
- [ ] Submit confirmation dialog prevents accidental submission
- [ ] After submission, all fields are read-only
- [ ] Cannot edit submitted forms
- [ ] Multiple fields can be "Modified" at the same time
- [ ] Saving one field doesn't clear other fields' indicators

## Implementation Notes

### Field-Level Save Tracking
Each section needs its own set of autosave hooks, one per field:
```typescript
const field1Autosave = useAutosave(createFieldSaveFn('field1'), 1500);
const field2Autosave = useAutosave(createFieldSaveFn('field2'), 1500);
// etc.
```

The `createFieldSaveFn` wrapper:
1. Calls the main save function with all current field values
2. Clears the specific field from the "saving" set on success
3. Allows independent tracking per field

### Why Not Use a Generic Hook?
While we could create a more generic `useFieldAutosave` hook, the current approach:
- Is explicit and type-safe
- Avoids complex generic type inference
- Makes debugging easier (each field has its own hook instance)
- Follows React's principle of explicit data flow

The shared `SaveIndicator` component and similar patterns across sections provide sufficient code reuse without over-abstraction.

