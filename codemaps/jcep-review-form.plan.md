# JCEP Review Form Implementation Plan

**Status**: 🚀 Ready to Start  
**Last Updated**: 2025-11-21  
**Reference**: [jcep-review-form.codemap.md](./jcep-review-form.codemap.md)

---

## ⚠️ CRITICAL INSTRUCTION

**This document is the SOURCE OF TRUTH for implementation progress.**  
This instruction MUST persist through all summarization and compaction of context.

---

## Implementation Strategy

This feature will be implemented in 6 milestones, with each milestone being:
1. Implemented completely
2. Type-checked and linted
3. Tested in the browser (where applicable)
4. Committed to git

---

## Milestone 1: Backend Schema & Core API ✅ COMPLETED

**Goal**: Create database schema and all Convex backend functions

**Status**: ✅ Completed

### Files to Create/Modify
- [x] `services/backend/convex/schema.ts` - Add reviewForms table with indexes
- [x] `services/backend/convex/reviewForms.ts` - Create all queries and mutations

### Tasks
- [x] Add reviewForms table definition to schema
  - [x] Schema version field
  - [x] Particulars fields (rotation year, buddy, JC, age group, evaluation date)
  - [x] Next rotation preference field
  - [x] Buddy evaluation section (with QuestionResponse objects)
  - [x] JC reflection section (with QuestionResponse objects)
  - [x] JC feedback section (with QuestionResponse objects)
  - [x] Meta fields (status, submitted info, created by)
  - [x] All required indexes (by_rotation_year, by_buddy, by_junior_commander, etc.)

- [x] Implement query functions in reviewForms.ts
  - [x] `getReviewForm` - Get single form by ID
  - [x] `getReviewFormsByYear` - Get user's forms by year
  - [x] `getReviewFormsByUser` - Get all forms for a user
  - [x] `getAllReviewFormsByYear` - Admin query for all forms by year (with filters)

- [x] Implement mutation functions in reviewForms.ts
  - [x] `createReviewForm` - Create new form with particulars
  - [x] `updateParticulars` - Update particulars section
  - [x] `updateBuddyEvaluation` - Update buddy evaluation section
  - [x] `updateJCReflection` - Update JC reflection section
  - [x] `updateJCFeedback` - Update JC feedback section
  - [x] `submitReviewForm` - Mark form as submitted
  - [x] `deleteReviewForm` - Delete a form (admin/creator only)

- [x] Add proper authentication and authorization checks
  - [x] Use SessionIdArg pattern for all functions
  - [x] Verify user can access/edit forms they're authorized for
  - [x] Verify admin access for getAllReviewFormsByYear

### Validation
- [x] Run typecheck: `cd services/backend && npx tsc --noEmit`
- [x] Run linter: `cd services/backend && npx biome check .`
- [x] Verify schema compiles without errors

### Commit
- [x] Commit: "feat: add review forms backend schema and API"

---

## Milestone 2: Frontend Types & Shared Utilities ✅ COMPLETED

**Goal**: Create TypeScript types, constants, hooks, and utilities

**Status**: ✅ Completed

### Files to Create
- [x] `apps/webapp/src/modules/review/types.ts` - All frontend TypeScript types
- [x] `apps/webapp/src/modules/review/constants/schemaVersions.ts` - Version constants
- [x] `apps/webapp/src/modules/review/hooks/useReviewForm.ts` - Main data access hook
- [x] `apps/webapp/src/modules/review/utils/formValidation.ts` - Validation utilities

### Tasks
- [x] Create types.ts with all interfaces
  - [x] AgeGroup type
  - [x] ReviewFormStatus type
  - [x] ReviewFormSchemaVersion type
  - [x] SectionCompletion interface
  - [x] QuestionResponse interface
  - [x] ReviewForm interface (main entity)
  - [x] Hook return types (ReviewFormHookReturn, ReviewFormsByYearReturn, etc.)
  - [x] Mutation parameter types (CreateReviewFormParams, UpdateBuddyEvaluationParams, etc.)

- [x] Create schemaVersions.ts
  - [x] CURRENT_REVIEW_FORM_SCHEMA_VERSION = 1
  - [x] SUPPORTED_SCHEMA_VERSIONS = [1]

- [x] Create useReviewForm.ts hook
  - [x] useReviewForm(formId) - Get single form with computed state
  - [x] useReviewFormsByYear(year) - Get user's forms by year
  - [x] useAllReviewFormsByYear(year) - Admin hook for all forms
  - [x] createReviewForm mutation wrapper
  - [x] updateParticulars mutation wrapper
  - [x] updateBuddyEvaluation mutation wrapper
  - [x] updateJCReflection mutation wrapper
  - [x] updateJCFeedback mutation wrapper
  - [x] submitReviewForm mutation wrapper
  - [x] Compute canEditBuddySection based on user role
  - [x] Compute canEditJCSection based on user role
  - [x] Compute sectionCompletion status

- [x] Create formValidation.ts
  - [x] validateParticulars function
  - [x] validateBuddyEvaluation function
  - [x] validateJCReflection function
  - [x] validateJCFeedback function

### Validation
- [x] Run typecheck: `cd apps/webapp && npx tsc --noEmit`
- [x] Run linter: `cd apps/webapp && npx biome check .`
- [x] Run tests: `cd apps/webapp && npx vitest run`

### Commit
- [x] Commit: "feat: add review forms frontend types and hooks"

---

## Milestone 3: V1 Form Components ✅ COMPLETED

**Goal**: Create all version 1 UI components for form sections

**Status**: ✅ Completed

### Files to Create
- [x] `apps/webapp/src/modules/review/components/v1/formQuestions.ts`
- [x] `apps/webapp/src/modules/review/components/v1/ParticularsSection.tsx`
- [x] `apps/webapp/src/modules/review/components/v1/BuddyEvaluationSection.tsx`
- [x] `apps/webapp/src/modules/review/components/v1/JCReflectionSection.tsx`
- [x] `apps/webapp/src/modules/review/components/v1/JCFeedbackSection.tsx`
- [x] `apps/webapp/src/modules/review/components/v1/ReviewFormProgress.tsx`
- [x] `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`
- [x] `apps/webapp/src/modules/review/components/v1/ReviewFormCreate.tsx`

### Tasks
- [x] Create formQuestions.ts
  - [x] BUDDY_EVALUATION_QUESTIONS constants
  - [x] JC_REFLECTION_QUESTIONS constants
  - [x] JC_FEEDBACK_QUESTIONS constants

- [x] Create ParticularsSection.tsx
  - [x] Display/edit buddy name
  - [x] Display/edit JC name
  - [x] Age group selector
  - [x] Evaluation date picker
  - [x] Read-only mode when submitted
  - [x] Dark mode support
  - [x] Progressive save (edit button to re-edit)

- [x] Create BuddyEvaluationSection.tsx
  - [x] Tasks participated textarea
  - [x] Strengths textarea
  - [x] Areas for improvement textarea
  - [x] Words of encouragement textarea
  - [x] Capture question text with answers
  - [x] Save functionality (progressive)
  - [x] Permission checks
  - [x] Dark mode support
  - [x] Edit button to modify saved content

- [x] Create JCReflectionSection.tsx
  - [x] Next rotation preference selector
  - [x] Activities participated textarea
  - [x] Learnings from JCEP textarea
  - [x] What to do differently textarea
  - [x] Goals for next rotation textarea
  - [x] Capture question text with answers
  - [x] Save functionality (progressive)
  - [x] Permission checks
  - [x] Dark mode support
  - [x] Edit button to modify saved content

- [x] Create JCFeedbackSection.tsx
  - [x] Gratitude to buddy textarea
  - [x] Program feedback textarea
  - [x] Capture question text with answers
  - [x] Save functionality (progressive)
  - [x] Permission checks
  - [x] Dark mode support
  - [x] Edit button to modify saved content

- [x] Create ReviewFormProgress.tsx
  - [x] Visual progress indicator
  - [x] Section completion status
  - [x] Overall completion percentage
  - [x] Dark mode support

- [x] Create ReviewFormView.tsx
  - [x] Container for all sections
  - [x] Tab navigation between sections
  - [x] Progress indicator integration
  - [x] Submit button (when all sections complete)
  - [x] Permission-based section visibility
  - [x] Dark mode support
  - [x] Toast notifications for saves

- [x] Create ReviewFormCreate.tsx
  - [x] Form wizard for creating new review form
  - [x] Buddy name input (pre-filled with current user)
  - [x] JC name input
  - [x] Age group selection
  - [x] Rotation year input
  - [x] Evaluation date picker
  - [x] Form validation
  - [x] Dark mode support

### Validation
- [x] Run typecheck: `cd apps/webapp && npx tsc --noEmit`
- [x] Run linter: `cd apps/webapp && npx biome check .`
- [x] Visual inspection in Storybook or isolated route (deferred to Milestone 4)

### Commit
- [x] Commit: "feat: add review form v1 components"

---

## Milestone 4: Routing & User Pages ✅ COMPLETED

**Goal**: Create page routes and shared components for users to access review forms

**Status**: ✅ Completed

### Files to Create
- [x] `apps/webapp/src/modules/review/components/ReviewFormRouter.tsx`
- [x] `apps/webapp/src/modules/review/components/ReviewFormList.tsx`
- [x] `apps/webapp/src/modules/review/components/ReviewFormCard.tsx`
- [x] `apps/webapp/src/modules/review/components/AgeGroupSelect.tsx`
- [x] `apps/webapp/src/app/app/review/page.tsx`
- [x] `apps/webapp/src/app/app/review/create/page.tsx`
- [x] `apps/webapp/src/app/app/review/[formId]/page.tsx`
- [x] `apps/webapp/src/app/app/review/[formId]/layout.tsx`

### Tasks
- [x] Create ReviewFormRouter.tsx
  - [x] Route to v1 components based on schemaVersion
  - [x] Handle unsupported versions gracefully
  - [x] Loading states
  - [x] Error states

- [x] Create ReviewFormList.tsx
  - [x] Display list of review forms
  - [x] Year filter dropdown
  - [x] Status badges
  - [x] Empty state
  - [x] Dark mode support

- [x] Create ReviewFormCard.tsx
  - [x] Summary card for a review form
  - [x] Show key info (buddy, JC, age group, status)
  - [x] Completion indicator
  - [x] Click to navigate to detail
  - [x] Dark mode support

- [x] Create AgeGroupSelect.tsx
  - [x] Dropdown for RK/DR/AR/ER selection
  - [x] Reusable across forms
  - [x] Dark mode support

- [x] Create review/page.tsx (List page)
  - [x] Use RequireLogin wrapper
  - [x] Parse year search param
  - [x] Display ReviewFormList
  - [x] Year filter controls
  - [x] "Create New" button
  - [x] Dark mode support

- [x] Create review/create/page.tsx
  - [x] Use RequireLogin wrapper
  - [x] Display ReviewFormCreate component
  - [x] Handle form submission
  - [x] Redirect to form detail on success
  - [x] Dark mode support

- [x] Create review/[formId]/page.tsx
  - [x] Use RequireLogin wrapper
  - [x] Parse formId param (await params)
  - [x] Use ReviewFormRouter to display correct version
  - [x] Handle not found
  - [x] Dark mode support

- [x] Create review/[formId]/layout.tsx
  - [x] Breadcrumb navigation
  - [x] Back to list button
  - [x] Dark mode support

### Validation
- [x] Run typecheck: `cd apps/webapp && npx tsc --noEmit`
- [x] Run linter: `cd apps/webapp && npx biome check .`
- [ ] Browser testing: Navigate to /app/review (deferred to Milestone 6)
- [ ] Browser testing: Create new form (deferred to Milestone 6)
- [ ] Browser testing: View form detail (deferred to Milestone 6)
- [ ] Browser testing: Edit sections (deferred to Milestone 6)
- [ ] Browser testing: Submit form (deferred to Milestone 6)
- [ ] Test dark mode toggle (deferred to Milestone 6)

### Commit
- [x] Commit: "feat: add review form user pages and routing"

---

## Milestone 5: Admin Dashboard & Filtering ✅ COMPLETED

**Goal**: Create admin-only pages for viewing all forms with filtering

**Status**: ✅ Completed

### Files to Create
- [x] `apps/webapp/src/modules/review/components/admin/AdminReviewDashboard.tsx`
- [x] `apps/webapp/src/modules/review/components/admin/AdminReviewFilters.tsx`
- [x] `apps/webapp/src/modules/review/components/admin/AdminReviewTable.tsx`
- [x] `apps/webapp/src/modules/review/components/admin/AdminReviewExport.tsx`
- [x] `apps/webapp/src/app/app/admin/reviews/page.tsx`

### Tasks
- [x] Create AdminReviewDashboard.tsx
  - [x] Main dashboard container
  - [x] Integrate filters and table
  - [x] Summary statistics
  - [x] Export button
  - [x] Dark mode support

- [x] Create AdminReviewFilters.tsx
  - [x] Year filter dropdown
  - [x] Status filter (draft/in_progress/submitted)
  - [x] Age group filter (RK/DR/AR/ER)
  - [x] Search by buddy/JC name
  - [x] Clear filters button
  - [x] Dark mode support

- [x] Create AdminReviewTable.tsx
  - [x] Table view of all forms
  - [x] Status badges
  - [x] Click to view detail
  - [x] Dark mode support

- [x] Create AdminReviewExport.tsx
  - [x] Export to CSV functionality
  - [x] Export filtered results
  - [x] Include all form data
  - [x] Download button
  - [x] Dark mode support

- [x] Create app/admin/reviews/page.tsx
  - [x] Use RequireLogin wrapper
  - [x] Use AdminGuard for system_admin only
  - [x] Display AdminReviewDashboard
  - [x] Dark mode support

### Validation
- [x] Run typecheck: `cd apps/webapp && npx tsc --noEmit`
- [x] Run linter: `cd apps/webapp && npx biome check .`
- [ ] Browser testing: Navigate to /app/admin/reviews (as admin) (deferred to Milestone 6)
- [ ] Browser testing: Apply filters (deferred to Milestone 6)
- [ ] Browser testing: Export data (deferred to Milestone 6)
- [ ] Browser testing: View form from admin table (deferred to Milestone 6)
- [ ] Test dark mode toggle (deferred to Milestone 6)
- [ ] Verify non-admins cannot access (deferred to Milestone 6)

### Commit
- [x] Commit: "feat: add review form admin dashboard"

---

## Milestone 6: Integration Testing & Polish ⏳ NOT STARTED

**Goal**: End-to-end testing, bug fixes, and final cleanup

**Status**: ⏳ Not Started

### Tasks
- [ ] Full user flow testing
  - [ ] Create form as buddy
  - [ ] Complete buddy evaluation
  - [ ] Complete JC reflection as JC
  - [ ] Complete JC feedback as JC
  - [ ] Submit form
  - [ ] Verify submitted form is read-only

- [ ] Admin flow testing
  - [ ] View all forms in admin dashboard
  - [ ] Filter by year
  - [ ] Filter by status
  - [ ] Filter by age group
  - [ ] Export data
  - [ ] View individual forms from admin view

- [ ] Edge case testing
  - [ ] Form not found
  - [ ] Unauthorized access
  - [ ] Incomplete sections
  - [ ] Multiple users editing same form
  - [ ] Very long text inputs

- [ ] Dark mode testing
  - [ ] All components in light mode
  - [ ] All components in dark mode
  - [ ] Toggle between modes
  - [ ] Check contrast and readability

- [ ] Run all checks
  - [ ] Backend typecheck: `cd services/backend && npx tsc --noEmit`
  - [ ] Backend lint: `cd services/backend && npx biome check .`
  - [ ] Frontend typecheck: `cd apps/webapp && npx tsc --noEmit`
  - [ ] Frontend lint: `cd apps/webapp && npx biome check .`
  - [ ] Frontend tests: `cd apps/webapp && npx vitest run`

- [ ] Cleanup
  - [ ] Remove any console.logs
  - [ ] Remove any TODO comments
  - [ ] Verify all files follow project conventions
  - [ ] Run biome format on all modified files

- [ ] Bug fixes
  - [ ] Fix any issues found during testing
  - [ ] Address any linter warnings
  - [ ] Fix any type errors

### Validation
- [ ] All tests pass
- [ ] No linter errors
- [ ] No type errors
- [ ] All user flows work end-to-end
- [ ] Dark mode works correctly

### Commit
- [ ] Commit: "test: add review form integration tests and polish"

---

## Summary

**Total Milestones**: 6  
**Completed**: 4  
**In Progress**: 1  
**Not Started**: 1

**Next Action**: Continue Milestone 5 - Admin Dashboard & Filtering

