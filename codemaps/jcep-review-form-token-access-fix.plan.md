# Token Access Fix - Implementation Plan

## Overview

Fix the token-based access feature to allow anonymous users (Buddy and JC) to access and edit review forms via secret links without requiring authentication.

## Current Status

- ✅ Infinite loop fixed (useCallback in useTokenAuth)
- ✅ Basic token routing implemented (ReviewFormRouter accepts accessToken)
- ❌ Backend mutations use wrong field names
- ❌ Frontend hooks have type mismatches
- ❌ Component integration incomplete

## Tasks

### Task 1: Fix Backend JC Reflection Mutation

**File**: `services/backend/convex/reviewForms.ts`

**Changes**:
1. Update `updateJCReflectionByToken` mutation args to match schema:
   ```typescript
   args: {
     accessToken: v.string(),
     formId: v.id('reviewForms'),
     activitiesParticipated: questionResponseValidator,  // was: accomplishments
     learningsFromJCEP: questionResponseValidator,       // was: challenges  
     whatToDoDifferently: questionResponseValidator,     // was: learnings
     goalsForNextRotation: questionResponseValidator,    // correct
   }
   ```

2. Update the db.patch call to use correct field names:
   ```typescript
   await ctx.db.patch(args.formId, {
     jcReflection: {
       activitiesParticipated: args.activitiesParticipated,
       learningsFromJCEP: args.learningsFromJCEP,
       whatToDoDifferently: args.whatToDoDifferently,
       goalsForNextRotation: args.goalsForNextRotation,
       completedAt: Date.now(),
       completedBy: null,
     },
     status: 'in_progress',
   });
   ```

**Verification**: TypeScript compiles without errors

---

### Task 2: Fix Backend JC Feedback Mutation

**File**: `services/backend/convex/reviewForms.ts`

**Changes**:
1. Update `updateJCFeedbackByToken` mutation args to match schema:
   ```typescript
   args: {
     accessToken: v.string(),
     formId: v.id('reviewForms'),
     gratitudeToBuddy: questionResponseValidator,  // was missing
     programFeedback: questionResponseValidator,   // correct
     // Remove: supportNeeded (doesn't exist in schema)
     // Remove: additionalComments (doesn't exist in schema)
   }
   ```

2. Update the db.patch call:
   ```typescript
   await ctx.db.patch(args.formId, {
     jcFeedback: {
       gratitudeToBuddy: args.gratitudeToBuddy,
       programFeedback: args.programFeedback,
       completedAt: Date.now(),
       completedBy: null,
     },
     status: 'in_progress',
   });
   ```

**Verification**: TypeScript compiles without errors

---

### Task 3: Fix Frontend Token Mutation Hooks

**File**: `apps/webapp/src/modules/review/hooks/useTokenMutations.ts`

**Changes**:
1. Update `useUpdateJCReflectionByToken` to match schema:
   ```typescript
   async (args: {
     formId: Id<'reviewForms'>;
     activitiesParticipated: QuestionResponse;
     learningsFromJCEP: QuestionResponse;
     whatToDoDifferently: QuestionResponse;
     goalsForNextRotation: QuestionResponse;
   })
   ```

2. Update `useUpdateJCFeedbackByToken` to match schema:
   ```typescript
   async (args: {
     formId: Id<'reviewForms'>;
     gratitudeToBuddy: QuestionResponse;
     programFeedback: QuestionResponse;
   })
   ```

**Verification**: TypeScript compiles without errors

---

### Task 4: Fix ReviewFormView Component Integration

**File**: `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`

**Problem**: The component passes parameters to mutations, but the parameter names don't match between session-based and token-based mutations.

**Solution**: Create wrapper functions that map the component's parameter names to the correct mutation parameter names.

**Changes**:

1. For JC Reflection section (around line 180):
   ```typescript
   onUpdate={async (updates) => {
     try {
       // Map component field names to mutation field names
       await updateJCReflection({
         formId,
         activitiesParticipated: updates.activitiesParticipated,
         learningsFromJCEP: updates.learningsFromJCEP,
         whatToDoDifferently: updates.whatToDoDifferently,
         goalsForNextRotation: updates.goalsForNextRotation,
       });
       toast.success('Reflection updated successfully!');
     } catch (error) {
       toast.error('Failed to update reflection');
       throw error;
     }
   }}
   ```

2. For JC Feedback section (around line 196):
   ```typescript
   onUpdate={async (updates) => {
     try {
       await updateJCFeedback({
         formId,
         gratitudeToBuddy: updates.gratitudeToBuddy,
         programFeedback: updates.programFeedback,
       });
       toast.success('Feedback updated successfully!');
     } catch (error) {
       toast.error('Failed to update feedback');
       throw error;
     }
   }}
   ```

**Verification**: TypeScript compiles without errors

---

### Task 5: Handle Type Compatibility

**File**: `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`

**Problem**: `ReviewFormHookReturn` and `ReviewFormByTokenReturn` have different properties, causing type errors.

**Solution**: Extract common properties explicitly and handle differences.

**Changes**:
```typescript
const data = accessToken ? tokenData : sessionData;

const form = data.form;
const isLoading = data.isLoading;
const sectionCompletion = data.sectionCompletion;

// Handle differences in return types
const canEditBuddySection = 'canEditBuddySection' in data 
  ? data.canEditBuddySection 
  : data.canEditBuddyEvaluation;
  
const canEditJCSection = 'canEditJCSection' in data
  ? data.canEditJCSection
  : (data.canEditJCReflection || data.canEditJCFeedback);
  
const isAdmin = 'isAdmin' in data ? data.isAdmin : false;
```

**Verification**: TypeScript compiles without errors

---

### Task 6: Run Tests and Lints

**Commands**:
```bash
# Backend typecheck
cd services/backend && npx tsc --noEmit

# Frontend typecheck  
cd apps/webapp && npx tsc --noEmit

# Lint all modified files
npx biome check --write services/backend/convex/reviewForms.ts
npx biome check --write apps/webapp/src/modules/review/hooks/useTokenMutations.ts
npx biome check --write apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx
```

**Verification**: All checks pass

---

### Task 7: Manual Browser Testing

**Test Case 1: Token Access (Buddy)**
1. Navigate to `http://localhost:3471/review/token/{buddyToken}`
2. Verify page loads without errors
3. Verify ParticipantInfoCard shows buddy name and JC name
4. Verify Buddy Evaluation tab is editable
5. Edit and save buddy evaluation
6. Verify JC sections are visible but read-only (or hidden based on visibility flags)

**Test Case 2: Token Access (JC)**
1. Navigate to `http://localhost:3471/review/token/{jcToken}`
2. Verify page loads without errors
3. Verify ParticipantInfoCard shows JC name and buddy name
4. Verify JC Reflection and JC Feedback tabs are editable
5. Edit and save JC reflection
6. Edit and save JC feedback
7. Verify Buddy Evaluation is visible but read-only (or hidden based on visibility flags)

**Test Case 3: Session Access (Admin)**
1. Login as system admin
2. Navigate to form via `/app/review/{formId}`
3. Verify all sections are editable
4. Verify submit button is available
5. Verify visibility controls are available

**Verification**: All test cases pass

---

### Task 8: Commit Changes

**Commit Message**:
```
fix: complete token-based access implementation

Problem:
- Token access mutations used wrong schema field names
- Type incompatibility between session and token hooks
- Component couldn't handle both access modes

Solution:
- Fix backend mutations to match schema exactly
  - JC Reflection: activitiesParticipated, learningsFromJCEP, whatToDoDifferently
  - JC Feedback: gratitudeToBuddy, programFeedback
- Update frontend hooks with correct types
- Handle type union in ReviewFormView component
- Map component parameters to mutation parameters

Impact:
- Token access now works for anonymous users
- Buddy can edit evaluation via secret link
- JC can edit reflection and feedback via secret link
- Session-based access unchanged
- Both modes coexist without conflicts

Testing:
- Manual browser testing completed
- TypeScript checks pass
- Lints pass
```

---

## Rollback Plan

If issues are discovered:
1. Revert commits in reverse order
2. Token access will be broken but session access will work
3. Users can still access forms via authenticated login

## Dependencies

None - all changes are self-contained within the review form module.

## Estimated Time

- Task 1-3: 15 minutes (backend fixes)
- Task 4-5: 30 minutes (frontend fixes)
- Task 6: 5 minutes (tests/lints)
- Task 7: 15 minutes (manual testing)
- Task 8: 5 minutes (commit)

**Total: ~70 minutes**

