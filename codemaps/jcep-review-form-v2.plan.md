# JCEP Review Form V2 Implementation Plan

**Status**: 🚀 In Progress  
**Started**: 2025-11-21  
**Parent**: jcep-review-form-v2-enhancements.plan.md

---

## ⚠️ CRITICAL INSTRUCTION

**This document is the SOURCE OF TRUTH for V2 implementation progress.**  
This instruction MUST persist through all summarization and compaction of context.

---

## Implementation Summary

V2 adds:
1. ✅ Secret token system for anonymous access
2. ✅ Response visibility control
3. ✅ Buddy aggregated view
4. ✅ Enhanced admin creation workflow

---

## Milestone 7: Secret Token System ⏳ NOT STARTED

**Goal**: Add token-based anonymous access to forms

**Status**: ⏳ Not Started

### Backend Tasks

#### Schema Changes
- [ ] Add `buddyAccessToken: v.string()` to reviewForms table
- [ ] Add `jcAccessToken: v.string()` to reviewForms table
- [ ] Add `tokenExpiresAt: v.union(v.number(), v.null())` (optional expiry)
- [ ] Add index `by_buddy_access_token`
- [ ] Add index `by_jc_access_token`

#### Token Generation
- [ ] Create `generateSecureToken()` utility function (32+ chars)
- [ ] Modify `createReviewForm` to generate tokens automatically
- [ ] Return tokens in create response
- [ ] Ensure tokens are unique (check for collisions)

#### Token Validation
- [ ] Create `getReviewFormByToken` query
  - [ ] Validate token exists
  - [ ] Check expiry (if applicable)
  - [ ] Return form with appropriate access level
  - [ ] Log access for audit trail
- [ ] Add token-based access to `getReviewForm` query
  - [ ] Support `accessToken` parameter
  - [ ] Determine role (buddy vs JC) from token
  - [ ] Apply appropriate permissions

#### Mutations
- [ ] Create `regenerateAccessTokens` mutation
  - [ ] Admin only
  - [ ] Invalidate old tokens
  - [ ] Generate new tokens
  - [ ] Return new tokens

### Frontend Tasks

#### New Route
- [ ] Create `/app/review/token/[token]/page.tsx`
- [ ] Parse token from URL
- [ ] Validate token via API
- [ ] Store token in localStorage
- [ ] Redirect to form view with token context

#### Token Storage
- [ ] Create `useTokenAuth` hook
  - [ ] Store token in localStorage
  - [ ] Retrieve token on mount
  - [ ] Clear token on logout
- [ ] Modify `useReviewForm` to support token access
  - [ ] Pass token to API if available
  - [ ] Determine user role from token response

#### Error Handling
- [ ] Invalid token page
- [ ] Expired token page
- [ ] Token already used page (if single-use)

#### Link Account Flow (Optional)
- [ ] "Link to Account" button on token access
- [ ] Associate token access with user account
- [ ] Migrate token access to session access

### Testing
- [ ] Generate token and access form anonymously
- [ ] Verify token validation
- [ ] Test invalid/expired tokens
- [ ] Test localStorage persistence
- [ ] Test token regeneration

### Validation
- [ ] Run typecheck: `npx tsc --noEmit`
- [ ] Run linter: `npx biome check .`
- [ ] Browser test: Access form via token link
- [ ] Browser test: Token persists on refresh

### Commit
- [ ] Commit: "feat: add secret token system for anonymous access (M7)"

---

## Milestone 8: Response Visibility Control ⏳ NOT STARTED

**Goal**: Hide responses until admin reveals them

**Status**: ⏳ Not Started

### Backend Tasks

#### Schema Changes
- [ ] Add `buddyResponsesVisibleToJC: v.boolean()` (default: false)
- [ ] Add `jcResponsesVisibleToBuddy: v.boolean()` (default: false)
- [ ] Add `visibilityChangedAt: v.union(v.number(), v.null())`
- [ ] Add `visibilityChangedBy: v.union(v.id("users"), v.null())`

#### Query Modifications
- [ ] Modify `getReviewForm` to filter responses based on visibility
  - [ ] If user is JC, hide buddy responses if flag is false
  - [ ] If user is Buddy, hide JC responses if flag is false
  - [ ] Admin always sees all responses
- [ ] Modify `getReviewFormByToken` to respect visibility
  - [ ] Determine role from token
  - [ ] Apply visibility filtering

#### Mutations
- [ ] Create `toggleResponseVisibility` mutation
  - [ ] Admin only
  - [ ] Update visibility flags
  - [ ] Track who changed and when
  - [ ] Validate at least one flag is provided

### Frontend Tasks

#### Conditional Rendering
- [ ] Modify `BuddyEvaluationSection` to show/hide based on visibility
  - [ ] Show "Response hidden by admin" placeholder
  - [ ] Show lock icon indicator
- [ ] Modify `JCReflectionSection` to show/hide based on visibility
- [ ] Modify `JCFeedbackSection` to show/hide based on visibility

#### Admin Controls
- [ ] Create `VisibilityControls` component
  - [ ] Toggle for "Show buddy responses to JC"
  - [ ] Toggle for "Show JC responses to buddy"
  - [ ] Visual indicators (locked/unlocked)
  - [ ] Confirmation dialog before revealing
- [ ] Add to admin review dashboard
- [ ] Add to individual form view (admin only)

#### Visual Indicators
- [ ] Add lock/unlock icons
- [ ] Add "Hidden" badges
- [ ] Add tooltips explaining visibility
- [ ] Update progress indicator to show hidden sections

### Testing
- [ ] Toggle visibility and verify responses hidden
- [ ] Test as buddy when JC responses hidden
- [ ] Test as JC when buddy responses hidden
- [ ] Verify admin can always see all responses
- [ ] Test visibility change tracking

### Validation
- [ ] Run typecheck: `npx tsc --noEmit`
- [ ] Run linter: `npx biome check .`
- [ ] Browser test: Hide/show responses
- [ ] Browser test: Visual indicators work

### Commit
- [ ] Commit: "feat: add response visibility control (M8)"

---

## Milestone 9: Buddy Aggregated View ⏳ NOT STARTED

**Goal**: Buddy can see all their assigned JCs

**Status**: ⏳ Not Started

### Backend Tasks

#### Schema Changes
- [ ] Add index `by_buddy_and_year` on `[buddyUserId, rotationYear]`

#### New Query
- [ ] Create `getReviewFormsByBuddy` query
  - [ ] Take `buddyUserId` (optional, defaults to current user)
  - [ ] Take `year` (optional)
  - [ ] Return all forms where user is buddy
  - [ ] Sort by creation time or status
  - [ ] Include completion statistics

### Frontend Tasks

#### New Page
- [ ] Create `/app/review/my-jcs/page.tsx`
  - [ ] Use RequireLogin wrapper
  - [ ] Display buddy dashboard
  - [ ] Show all assigned forms

#### Buddy Dashboard Component
- [ ] Create `BuddyDashboard` component
  - [ ] Grid of JC cards
  - [ ] Year filter dropdown
  - [ ] Status filter (draft/in_progress/submitted)
  - [ ] Search by JC name
  - [ ] Summary statistics

#### JC Card Component
- [ ] Create `BuddyJCCard` component
  - [ ] JC name and age group
  - [ ] Completion status
  - [ ] Quick actions (View, Edit)
  - [ ] Status badge
  - [ ] Last updated timestamp

#### Navigation
- [ ] Add "My Junior Commanders" link to navigation
- [ ] Add breadcrumb support
- [ ] Add quick access from main review list

### Testing
- [ ] Verify buddy sees all their assigned forms
- [ ] Test filtering by year
- [ ] Test filtering by status
- [ ] Test search functionality
- [ ] Verify non-buddies cannot access
- [ ] Test with multiple years of data

### Validation
- [ ] Run typecheck: `npx tsc --noEmit`
- [ ] Run linter: `npx biome check .`
- [ ] Browser test: Buddy dashboard loads
- [ ] Browser test: Filters work correctly

### Commit
- [ ] Commit: "feat: add buddy aggregated view (M9)"

---

## Milestone 10: Enhanced Admin Creation ⏳ NOT STARTED

**Goal**: Improve admin form creation with token distribution

**Status**: ⏳ Not Started

### Backend Tasks

#### API Updates
- [ ] Ensure `createReviewForm` returns tokens in response
- [ ] Add validation for token generation
- [ ] Add logging for token generation

### Frontend Tasks

#### Enhanced Create Form
- [ ] Modify `ReviewFormCreate` to show tokens after creation
- [ ] Add "Token Links" section
  - [ ] Display buddy link with copy button
  - [ ] Display JC link with copy button
  - [ ] Show QR codes (optional)
  - [ ] Show expiry date (if applicable)

#### Copy to Clipboard
- [ ] Add `useCopyToClipboard` hook
- [ ] Add copy button with success feedback
- [ ] Add "Copied!" toast notification

#### Token Management
- [ ] Add "Regenerate Tokens" button (admin only)
- [ ] Add confirmation dialog
- [ ] Show old vs new tokens
- [ ] Update form view to show tokens

#### Email Integration (Future)
- [ ] Add "Send Email" buttons (placeholder)
- [ ] Email template preview
- [ ] Track email sent status

### Testing
- [ ] Create form and verify tokens generated
- [ ] Test copy-to-clipboard functionality
- [ ] Verify links work correctly
- [ ] Test token regeneration
- [ ] Test with multiple forms

### Validation
- [ ] Run typecheck: `npx tsc --noEmit`
- [ ] Run linter: `npx biome check .`
- [ ] Browser test: Create form shows tokens
- [ ] Browser test: Copy buttons work

### Commit
- [ ] Commit: "feat: enhance admin creation with token distribution (M10)"

---

## Milestone 11: Integration & Polish ⏳ NOT STARTED

**Goal**: End-to-end testing and refinement

**Status**: ⏳ Not Started

### Tasks

#### End-to-End Testing
- [ ] Full workflow: Admin creates → Buddy completes → JC completes → Admin reveals → Submit
- [ ] Test token-based access throughout
- [ ] Test visibility controls throughout
- [ ] Test buddy dashboard with real data
- [ ] Test all error cases

#### Migration
- [ ] Generate tokens for existing forms
- [ ] Set visibility flags for existing forms (default: true for backward compatibility)
- [ ] Test migration script
- [ ] Document migration process

#### Documentation
- [ ] Update user guide
- [ ] Update admin guide
- [ ] Add token security best practices
- [ ] Add troubleshooting guide

#### Performance
- [ ] Test with large number of forms
- [ ] Optimize queries if needed
- [ ] Add pagination if needed
- [ ] Monitor token validation performance

#### Security Audit
- [ ] Review token generation security
- [ ] Review access control logic
- [ ] Test for token leakage
- [ ] Test rate limiting

### Validation
- [ ] All tests pass
- [ ] No linter errors
- [ ] No type errors
- [ ] All user flows work end-to-end
- [ ] Performance acceptable

### Commit
- [ ] Commit: "feat: V2 integration and polish (M11)"

---

## Summary

**Total Milestones**: 5 (7-11)  
**Completed**: 0  
**In Progress**: 0  
**Not Started**: 5

**Next Action**: Start Milestone 7 - Secret Token System

