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

## Milestone 3: V1 Form Components ⏳ NOT STARTED

**Goal**: Create all version 1 UI components for form sections

**Status**: ⏳ Not Started

### Files to Create
- [ ] `apps/webapp/src/modules/review/components/v1/formQuestions.ts`
- [ ] `apps/webapp/src/modules/review/components/v1/ParticularsSection.tsx`
- [ ] `apps/webapp/src/modules/review/components/v1/BuddyEvaluationSection.tsx`
- [ ] `apps/webapp/src/modules/review/components/v1/JCReflectionSection.tsx`
- [ ] `apps/webapp/src/modules/review/components/v1/JCFeedbackSection.tsx`
- [ ] `apps/webapp/src/modules/review/components/v1/ReviewFormProgress.tsx`
- [ ] `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`
- [ ] `apps/webapp/src/modules/review/components/v1/ReviewFormCreate.tsx`

### Tasks
- [ ] Create formQuestions.ts
  - [ ] BUDDY_EVALUATION_QUESTIONS constants
  - [ ] JC_REFLECTION_QUESTIONS constants
  - [ ] JC_FEEDBACK_QUESTIONS constants

- [ ] Create ParticularsSection.tsx
  - [ ] Display/edit buddy name
  - [ ] Display/edit JC name
  - [ ] Age group selector
  - [ ] Evaluation date picker
  - [ ] Read-only mode when submitted
  - [ ] Dark mode support

- [ ] Create BuddyEvaluationSection.tsx
  - [ ] Tasks participated textarea
  - [ ] Strengths textarea
  - [ ] Areas for improvement textarea
  - [ ] Words of encouragement textarea
  - [ ] Capture question text with answers
  - [ ] Save functionality
  - [ ] Permission checks
  - [ ] Dark mode support

- [ ] Create JCReflectionSection.tsx
  - [ ] Next rotation preference selector
  - [ ] Activities participated textarea
  - [ ] Learnings from JCEP textarea
  - [ ] What to do differently textarea
  - [ ] Goals for next rotation textarea
  - [ ] Capture question text with answers
  - [ ] Save functionality
  - [ ] Permission checks
  - [ ] Dark mode support

- [ ] Create JCFeedbackSection.tsx
  - [ ] Gratitude to buddy textarea
  - [ ] Program feedback textarea
  - [ ] Capture question text with answers
  - [ ] Save functionality
  - [ ] Permission checks
  - [ ] Dark mode support

- [ ] Create ReviewFormProgress.tsx
  - [ ] Visual progress indicator
  - [ ] Section completion status
  - [ ] Overall completion percentage
  - [ ] Dark mode support

- [ ] Create ReviewFormView.tsx
  - [ ] Container for all sections
  - [ ] Tab/accordion navigation between sections
  - [ ] Progress indicator integration
  - [ ] Submit button (when all sections complete)
  - [ ] Permission-based section visibility
  - [ ] Dark mode support

- [ ] Create ReviewFormCreate.tsx
  - [ ] Form wizard for creating new review form
  - [ ] Buddy selection/input
  - [ ] JC selection/input
  - [ ] Age group selection
  - [ ] Rotation year input
  - [ ] Evaluation date picker
  - [ ] Form validation
  - [ ] Dark mode support

### Validation
- [ ] Run typecheck: `cd apps/webapp && npx tsc --noEmit`
- [ ] Run linter: `cd apps/webapp && npx biome check .`
- [ ] Visual inspection in Storybook or isolated route (if available)

### Commit
- [ ] Commit: "feat: add review form v1 components"

---

## Milestone 4: Routing & User Pages ⏳ NOT STARTED

**Goal**: Create page routes and shared components for users to access review forms

**Status**: ⏳ Not Started

### Files to Create
- [ ] `apps/webapp/src/modules/review/components/ReviewFormRouter.tsx`
- [ ] `apps/webapp/src/modules/review/components/ReviewFormList.tsx`
- [ ] `apps/webapp/src/modules/review/components/ReviewFormCard.tsx`
- [ ] `apps/webapp/src/modules/review/components/AgeGroupSelect.tsx`
- [ ] `apps/webapp/src/app/app/review/page.tsx`
- [ ] `apps/webapp/src/app/app/review/create/page.tsx`
- [ ] `apps/webapp/src/app/app/review/[formId]/page.tsx`
- [ ] `apps/webapp/src/app/app/review/[formId]/layout.tsx`

### Tasks
- [ ] Create ReviewFormRouter.tsx
  - [ ] Route to v1 components based on schemaVersion
  - [ ] Handle unsupported versions gracefully
  - [ ] Loading states
  - [ ] Error states

- [ ] Create ReviewFormList.tsx
  - [ ] Display list of review forms
  - [ ] Year filter dropdown
  - [ ] Status badges
  - [ ] Empty state
  - [ ] Dark mode support

- [ ] Create ReviewFormCard.tsx
  - [ ] Summary card for a review form
  - [ ] Show key info (buddy, JC, age group, status)
  - [ ] Completion indicator
  - [ ] Click to navigate to detail
  - [ ] Dark mode support

- [ ] Create AgeGroupSelect.tsx
  - [ ] Dropdown for RK/DR/AR/ER selection
  - [ ] Reusable across forms
  - [ ] Dark mode support

- [ ] Create review/page.tsx (List page)
  - [ ] Use RequireLogin wrapper
  - [ ] Parse year search param
  - [ ] Display ReviewFormList
  - [ ] Year filter controls
  - [ ] "Create New" button
  - [ ] Dark mode support

- [ ] Create review/create/page.tsx
  - [ ] Use RequireLogin wrapper
  - [ ] Display ReviewFormCreate component
  - [ ] Handle form submission
  - [ ] Redirect to form detail on success
  - [ ] Dark mode support

- [ ] Create review/[formId]/page.tsx
  - [ ] Use RequireLogin wrapper
  - [ ] Parse formId param (await params)
  - [ ] Use ReviewFormRouter to display correct version
  - [ ] Handle not found
  - [ ] Dark mode support

- [ ] Create review/[formId]/layout.tsx
  - [ ] Breadcrumb navigation
  - [ ] Back to list button
  - [ ] Dark mode support

### Validation
- [ ] Run typecheck: `cd apps/webapp && npx tsc --noEmit`
- [ ] Run linter: `cd apps/webapp && npx biome check .`
- [ ] Browser testing: Navigate to /app/review
- [ ] Browser testing: Create new form
- [ ] Browser testing: View form detail
- [ ] Browser testing: Edit sections
- [ ] Browser testing: Submit form
- [ ] Test dark mode toggle

### Commit
- [ ] Commit: "feat: add review form user pages and routing"

---

## Milestone 5: Admin Dashboard & Filtering ⏳ NOT STARTED

**Goal**: Create admin-only pages for viewing all forms with filtering

**Status**: ⏳ Not Started

### Files to Create
- [ ] `apps/webapp/src/modules/review/components/admin/AdminReviewDashboard.tsx`
- [ ] `apps/webapp/src/modules/review/components/admin/AdminReviewFilters.tsx`
- [ ] `apps/webapp/src/modules/review/components/admin/AdminReviewTable.tsx`
- [ ] `apps/webapp/src/modules/review/components/admin/AdminReviewExport.tsx`
- [ ] `apps/webapp/src/app/app/admin/reviews/page.tsx`

### Tasks
- [ ] Create AdminReviewDashboard.tsx
  - [ ] Main dashboard container
  - [ ] Integrate filters and table
  - [ ] Summary statistics
  - [ ] Export button
  - [ ] Dark mode support

- [ ] Create AdminReviewFilters.tsx
  - [ ] Year filter dropdown
  - [ ] Status filter (draft/in_progress/submitted)
  - [ ] Age group filter (RK/DR/AR/ER)
  - [ ] Search by buddy/JC name
  - [ ] Clear filters button
  - [ ] Dark mode support

- [ ] Create AdminReviewTable.tsx
  - [ ] Table view of all forms
  - [ ] Sortable columns
  - [ ] Status badges
  - [ ] Click to view detail
  - [ ] Pagination (if needed)
  - [ ] Dark mode support

- [ ] Create AdminReviewExport.tsx
  - [ ] Export to CSV functionality
  - [ ] Export filtered results
  - [ ] Include all form data
  - [ ] Download button
  - [ ] Dark mode support

- [ ] Create app/admin/reviews/page.tsx
  - [ ] Use RequireLogin wrapper
  - [ ] Use AdminGuard for system_admin only
  - [ ] Parse search params (year, status, ageGroup)
  - [ ] Display AdminReviewDashboard
  - [ ] Dark mode support

### Validation
- [ ] Run typecheck: `cd apps/webapp && npx tsc --noEmit`
- [ ] Run linter: `cd apps/webapp && npx biome check .`
- [ ] Browser testing: Navigate to /app/admin/reviews (as admin)
- [ ] Browser testing: Apply filters
- [ ] Browser testing: Sort table
- [ ] Browser testing: Export data
- [ ] Browser testing: View form from admin table
- [ ] Test dark mode toggle
- [ ] Verify non-admins cannot access

### Commit
- [ ] Commit: "feat: add review form admin dashboard"

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
**Completed**: 0  
**In Progress**: 0  
**Not Started**: 6

**Next Action**: Start Milestone 1 - Backend Schema & Core API

