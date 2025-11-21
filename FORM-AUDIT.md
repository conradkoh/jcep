# Form Sections Autosave Audit

## Summary
Audit of all form sections to identify similar autosave closure capture bugs.

## BuddyEvaluationSection.tsx

### ❌ ISSUE FOUND: Closure Capture Bug (Same as JCReflectionSection)

**Location**: Line 125
```typescript
const data = { tasksParticipated, strengths, areasForImprovement, wordsOfEncouragement };
```

**Problem**: 
- The `data` object captures state values at the time `handleFieldChange` is called
- This object is then passed to autosave callbacks that execute later
- By the time autosave executes, if another field changed, the `data` object has stale values
- The `createFieldSaveFn` function (lines 52-86) receives these stale values

**Impact**:
- If user types in field A, then quickly types in field B, field A's autosave might send field B's old value
- Same multi-field staleness issue as we fixed in JCReflectionSection

**Fix Required**:
1. Use `useRef` with auto-sync pattern (like JCReflectionSection fix)
2. Or use the new `useLatestValue` helper we created
3. Update `createFieldSaveFn` to read from refs instead of closure

**Example Fix** (using our helper):
```typescript
import { useLatestValue } from '../../utils/autosaveHelpers';

// In component:
const tasksParticipatedRef = useLatestValue(tasksParticipated);
const strengthsRef = useLatestValue(strengths);
const areasForImprovementRef = useLatestValue(areasForImprovement);
const wordsOfEncouragementRef = useLatestValue(wordsOfEncouragement);

// In createFieldSaveFn:
await onUpdate({
  tasksParticipated: {
    questionText: BUDDY_EVALUATION_QUESTIONS.tasksParticipated,
    answer: tasksParticipatedRef.current, // Use ref!
  },
  // ... other fields with refs
});
```

## JCFeedbackSection.tsx

### ❌ ISSUE FOUND: Closure Capture Bug (Same as others)

**Location**: Line 93
```typescript
const data = { gratitudeToBuddy, programFeedback };
```

**Problem**: 
- Identical closure capture issue as BuddyEvaluationSection
- The `data` object captures state values at handleFieldChange call time
- Autosave callbacks execute later with potentially stale values
- The `createFieldSaveFn` function (lines 44-64) receives these stale values

**Impact**:
- Same staleness issue if user switches between fields quickly
- Less severe than other sections (only 2 fields vs 4-5)
- Still needs fixing for consistency and correctness

**Fix Required**:
1. Use `useLatestValue` helper for both fields
2. Update `createFieldSaveFn` to read from refs

## Action Items

1. ✅ JCReflectionSection - FIXED (commit d196f61)
2. ❌ BuddyEvaluationSection - **NEEDS FIX** (closure capture bug identified, 4 fields affected)
3. ❌ JCFeedbackSection - **NEEDS FIX** (closure capture bug identified, 2 fields affected)

## Risk Assessment

- **Critical**: These bugs can cause data loss in production
- **Likelihood**: Medium-High (requires rapid field switching, but users do this)
- **Impact**: High (silent data loss, no error shown to user)
- **Detection**: Low (no user feedback, requires careful testing or monitoring)

## Prevention

Going forward:
1. Always use `useLatestValue` helper for state values in autosave callbacks
2. Add `validatePayload` helper calls to catch missing fields
3. Add integration tests to verify autosave behavior
4. Use shared validation args in backend to prevent drift

