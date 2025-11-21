# JCEP Review Form - Token Access Fix

## Problem Statement

The token-based access feature (V2) has been partially implemented but is currently broken. When users access the form via secret token links (e.g., `/review/token/{token}`), they encounter errors because the system tries to use session-based authentication which doesn't exist for anonymous token users.

### Current Issues

1. **Infinite Render Loop** ✅ FIXED (Commit: a3366a4)
   - `useTokenAuth` hook was recreating `setToken` and `clearToken` functions on every render
   - Fixed by wrapping functions in `useCallback`

2. **Session Not Found Error** ✅ PARTIALLY FIXED (Commit: a157e3a)
   - `ReviewFormRouter` was using `useReviewForm` (session-based) for all access
   - Fixed by adding `accessToken` prop and using `useReviewFormByToken` when token is provided
   - `ReviewFormView` also updated to accept `accessToken` prop

3. **Missing Token-Based Mutations** ❌ IN PROGRESS
   - Backend mutations exist but use wrong field names
   - Frontend hooks created but not fully integrated
   - Components try to use session-based mutations for token access

## Architecture Overview

### Two Access Modes

The system must support two distinct access modes:

#### 1. Session-Based Access (Authenticated Users)
- User logs in with account
- Session ID passed via `SessionIdArg`
- Full access to all features (edit particulars, submit form)
- Used by: Admins, registered buddies, registered JCs

#### 2. Token-Based Access (Anonymous Users)
- User accesses via secret link
- Access token passed as query parameter
- Limited access (can only edit their sections, cannot edit particulars or submit)
- Used by: Buddies and JCs before account linking

### Data Flow

```
Token Access Page (/review/token/[token])
  ↓
  ├─ useTokenAuth (manages token in localStorage)
  ├─ useReviewFormByToken (fetches form data via token)
  └─ ReviewFormRouter (routes to correct version)
       ↓
       ReviewFormView (displays form with edit capabilities)
         ↓
         ├─ Session Mode: useReviewForm + session mutations
         └─ Token Mode: useReviewFormByToken + token mutations
```

## Schema Alignment Issue

### Current Mismatch

The token-based mutations were created with incorrect field names. The schema defines:

**JC Reflection Section:**
- `activitiesParticipated` (not `accomplishments`)
- `learningsFromJCEP` (not `challenges`)
- `whatToDoDifferently` (not `learnings`)
- `goalsForNextRotation` ✓ (correct)

**JC Feedback Section:**
- `gratitudeToBuddy` (not missing)
- `programFeedback` ✓ (correct)
- (no `supportNeeded` field)
- (no `additionalComments` field)

**Buddy Evaluation Section:**
- `tasksParticipated` ✓ (correct)
- `strengths` ✓ (correct)
- `areasForImprovement` ✓ (correct)
- `wordsOfEncouragement` ✓ (correct)

### Required Changes

1. **Backend Mutations** (`services/backend/convex/reviewForms.ts`)
   - Fix `updateJCReflectionByToken` to use correct field names
   - Fix `updateJCFeedbackByToken` to use correct field names
   - Keep `updateBuddyEvaluationByToken` as is (already correct)

2. **Frontend Hooks** (`apps/webapp/src/modules/review/hooks/useTokenMutations.ts`)
   - Update type definitions to match schema
   - Ensure parameter names align with backend

3. **Component Integration** (`apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`)
   - Properly handle both session and token mutations
   - Disable features not available in token mode (particulars edit, submit)
   - Pass correct parameters to mutation functions

## Implementation Plan

### Phase 1: Fix Backend Mutations ✅ TO DO

1. Update `updateJCReflectionByToken` mutation
   - Change args to match schema field names
   - Update db.patch to use correct fields

2. Update `updateJCFeedbackByToken` mutation
   - Change args to match schema field names
   - Update db.patch to use correct fields

3. Add `isTokenExpired` import ✅ DONE

### Phase 2: Fix Frontend Hooks ✅ TO DO

1. Update `useTokenMutations.ts`
   - Fix `useUpdateJCReflectionByToken` parameter types
   - Fix `useUpdateJCFeedbackByToken` parameter types

2. Ensure type compatibility between:
   - `ReviewFormHookReturn` (session-based)
   - `ReviewFormByTokenReturn` (token-based)

### Phase 3: Fix Component Integration ✅ TO DO

1. Update `ReviewFormView.tsx`
   - Handle type union properly
   - Ensure mutation calls pass correct parameters
   - Add proper null checks for token-only restrictions

2. Test both access modes:
   - Session-based: Full functionality
   - Token-based: Limited to section editing only

### Phase 4: Testing ✅ TO DO

1. Test token access flow:
   - Navigate to `/review/token/{validToken}`
   - Verify form loads without errors
   - Verify buddy can edit buddy evaluation
   - Verify JC can edit JC reflection and feedback
   - Verify particulars section is read-only
   - Verify submit button is not available

2. Test session access flow:
   - Login as admin/buddy/JC
   - Verify full functionality works
   - Verify particulars can be edited
   - Verify form can be submitted

## Files to Modify

### Backend
- `services/backend/convex/reviewForms.ts`
  - Line ~899: Fix `updateJCReflectionByToken` args and patch
  - Line ~946: Fix `updateJCFeedbackByToken` args and patch

### Frontend
- `apps/webapp/src/modules/review/hooks/useTokenMutations.ts`
  - Update all type definitions to match schema
  
- `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`
  - Fix type compatibility issues
  - Ensure correct parameters passed to mutations

## Success Criteria

✅ Token access page loads without errors
✅ Buddy can edit their evaluation via token
✅ JC can edit their sections via token
✅ Particulars are read-only in token mode
✅ Submit is disabled in token mode
✅ Session-based access still works fully
✅ No TypeScript errors
✅ All tests pass

## Notes

- Token-based access is intentionally limited for security
- Particulars editing requires admin/authenticated access
- Form submission requires authenticated access
- Tokens can expire (controlled by `tokenExpiresAt` field)
- Both access modes must coexist without breaking each other

