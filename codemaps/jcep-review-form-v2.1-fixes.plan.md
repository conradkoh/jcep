# JCEP Review Form V2.1 Fixes & Enhancements

**Status**: 🚀 In Progress  
**Started**: 2025-11-21  
**Parent**: jcep-review-form-v2.plan.md

---

## ⚠️ CRITICAL INSTRUCTION

**This document is the SOURCE OF TRUTH for V2.1 fixes and enhancements.**  
This instruction MUST persist through all summarization and compaction of context.

---

## Overview

V2.1 addresses UX issues and enhances the admin workflow:

1. ✅ Fix age group acronym labels (show full names)
2. ✅ Fix admin create flow (remove buddy name pre-fill assumption)
3. ✅ Admin listing page as default for system admins
4. ✅ Redirect to listing after form creation
5. ✅ Add copy buttons for token links in listing
6. ✅ Show participant status and progress
7. ✅ Enhance token access page with participant info

---

## Task 1: Fix Age Group Labels ⏳ IN PROGRESS

**Goal**: Display full age group names instead of acronyms

**Status**: ⏳ In Progress

### Changes Needed

- [x] Create `ageGroupLabels.ts` utility with label mapping
- [ ] Update `AgeGroupSelect` component to show full names
- [ ] Update all form displays to show full names
- [ ] Update admin table to show full names
- [ ] Update buddy dashboard to show full names
- [ ] Update token access page to show full names

### Label Mapping

```typescript
RK = "Ranger Kids"
DR = "Discovery Rangers"
AR = "Adventure Rangers"
ER = "Expedition Rangers"
```

### Files to Update

- `apps/webapp/src/modules/review/utils/ageGroupLabels.ts` (created)
- `apps/webapp/src/modules/review/components/AgeGroupSelect.tsx`
- `apps/webapp/src/modules/review/components/ReviewFormCard.tsx`
- `apps/webapp/src/modules/review/components/admin/AdminReviewTable.tsx`
- `apps/webapp/src/app/app/review/my-jcs/page.tsx`
- `apps/webapp/src/app/review/token/[token]/page.tsx`
- `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`

---

## Task 2: Fix Admin Create Flow ⏳ NOT STARTED

**Goal**: Remove assumption that admin is the buddy

**Status**: ⏳ Not Started

### Current Problem

- Create form pre-fills buddy name with current user's name
- Assumes admin is always the buddy
- Redirects to form detail page immediately

### Solution

- Remove pre-filled buddy name
- Make buddy name a required input field
- Add buddy user selection (optional - for linking to existing users)
- Redirect to admin listing page after creation

### Files to Update

- `apps/webapp/src/modules/review/components/v1/ReviewFormCreate.tsx`
  - Remove `currentUserName` prop usage for buddy name
  - Make buddy name an empty input field
  - Add optional buddy user selector
  - Change redirect from `/app/review/${formId}` to `/app/review`

---

## Task 3: Admin Listing Page ⏳ NOT STARTED

**Goal**: Show admin table on `/app/review` for system admins

**Status**: ⏳ Not Started

### Requirements

- System admins see admin table at `/app/review`
- Regular users see their personal forms (existing behavior)
- Table shows all forms across the system
- Includes copy buttons for token distribution
- Shows participant status and progress

### Implementation

#### Backend (No changes needed)

- `getAllReviewFormsByYear` query already exists
- Supports filtering by year, status, age group

#### Frontend

- Modify `/app/app/review/page.tsx`
- Check if user is system admin
- If admin: show `AdminReviewListingTable` component (new)
- If not admin: show existing personal forms list

### New Component: AdminReviewListingTable

**Location**: `apps/webapp/src/modules/review/components/admin/AdminReviewListingTable.tsx`

**Features**:
- Table with columns:
  - Rotation Year
  - Buddy Name
  - JC Name
  - Age Group (full name)
  - Status
  - Buddy Progress (not started / X/3 sections / completed)
  - JC Progress (not started / X/3 sections / completed)
  - Actions (Copy Buddy Link, Copy JC Link, View)
- Filters: Year, Status, Age Group
- Search by buddy or JC name
- Sorting by columns

---

## Task 4: Copy Buttons in Listing ⏳ NOT STARTED

**Goal**: Add copy buttons for token links in admin listing

**Status**: ⏳ Not Started

### Requirements

- Each row has two copy buttons:
  - "Copy Buddy Link" - copies buddy token URL
  - "Copy JC Link" - copies JC token URL
- Visual feedback on copy (checkmark, toast)
- Links format: `${origin}/review/token/${token}`

### Implementation

- Create `TokenCopyButton` component
- Props: `token`, `label`, `type` (buddy/jc)
- Use `navigator.clipboard.writeText()`
- Show success toast
- Temporary checkmark icon

---

## Task 5: Participant Status Display ⏳ NOT STARTED

**Goal**: Show participant status and progress in listing

**Status**: ⏳ Not Started

### Status Types

1. **Not Started**: No sections completed
2. **In Progress**: Some sections completed (show X/Y)
3. **Completed**: All sections completed

### Progress Calculation

**For Buddy**:
- Total sections: 1 (Buddy Evaluation)
- Completed: `buddyEvaluation !== null`

**For JC**:
- Total sections: 2 (JC Reflection + JC Feedback)
- Completed: Count of non-null sections

### Visual Design

- Not Started: Gray badge, circle icon
- In Progress: Blue badge, "X/Y Sections"
- Completed: Green badge, checkmark icon

### Implementation

- Create `ParticipantStatusBadge` component
- Props: `form`, `participant` (buddy/jc)
- Calculate completion from form data
- Return appropriate badge

---

## Task 6: Enhance Token Access Page ⏳ NOT STARTED

**Goal**: Show participant names and status on token access page

**Status**: ⏳ Not Started

### Current State

- Shows access level (buddy/jc)
- Shows privacy notice
- Shows form sections

### Enhancements

Add information card showing:

**For Buddy**:
- "You are: [Buddy Name]"
- "Junior Commander: [JC Name]"
- "JC's Progress: [not started / X/2 sections / completed]"

**For JC**:
- "You are: [JC Name]"
- "Your Buddy: [Buddy Name]"
- "Buddy's Progress: [not started / completed]"

### Visual Design

- Card at top of page (below access granted alert)
- Shows names prominently
- Progress indicator with icon
- Responsive layout

### Implementation

- Create `ParticipantInfoCard` component
- Props: `form`, `accessLevel`
- Display names based on access level
- Calculate and show other participant's progress
- Add to token access page

---

## Task 7: Redirect After Creation ⏳ NOT STARTED

**Goal**: Redirect to listing page after form creation

**Status**: ⏳ Not Started

### Changes

- Modify `ReviewFormCreate` component
- Change redirect from `/app/review/${formId}?showTokens=true` to `/app/review`
- Add success toast with form details
- Admin can find form in listing and copy tokens

### Implementation

```typescript
// After successful creation
toast.success(`Review form created for ${jcName}!`);
router.push('/app/review');
```

---

## Testing Checklist

### Age Group Labels
- [ ] All dropdowns show full names
- [ ] All tables show full names
- [ ] All cards show full names
- [ ] Token access page shows full names

### Admin Create Flow
- [ ] Buddy name field is empty by default
- [ ] Cannot create without buddy name
- [ ] Redirects to listing after creation
- [ ] Success toast displays

### Admin Listing
- [ ] System admin sees table at `/app/review`
- [ ] Regular user sees personal forms
- [ ] Table shows all forms
- [ ] Filters work correctly
- [ ] Search works

### Copy Buttons
- [ ] Copy buddy link works
- [ ] Copy JC link works
- [ ] Toast notifications appear
- [ ] Links are correct format

### Status Display
- [ ] Not started shows correctly
- [ ] In progress shows X/Y
- [ ] Completed shows correctly
- [ ] Updates when sections are saved

### Token Access Page
- [ ] Shows participant names
- [ ] Shows other participant's progress
- [ ] Updates when progress changes
- [ ] Responsive on mobile

---

## Summary

**Total Tasks**: 7  
**Completed**: 0  
**In Progress**: 1  
**Not Started**: 6

**Next Action**: Complete Task 1 - Fix Age Group Labels

