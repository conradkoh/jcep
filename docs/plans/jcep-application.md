# JCEP Application Form Implementation Plan

## Overview
Implement a multi-step application form for the Junior Commander Exposure Programme (JCEP) that:
- Does NOT require authentication (public form)
- Includes a stepper UI for better UX
- Stores submissions in Convex backend
- Provides admin view at `/app` to browse submissions by year

## Requirements

### Public-Facing Features
1. **Home Page Button** - Add "Apply Now" button on home page (`/`)
2. **Application Route** - Create `/apply` route with multi-step form
3. **Form Sections** (4 steps):
   - **Step 1**: Introduction (Motto, Pledge, Code, Acknowledgement)
   - **Step 2**: Personal Particulars (Name, Contact)
   - **Step 3**: Serving Preferences (Age group choices and reasons)
   - **Step 4**: Review and Submit

### Admin Features
1. **Admin Dashboard** - Add section to `/app` page
2. **View Submissions** - List applications grouped by submission year
3. **Sorting** - Sort by submission date (descending) within each year

## Technical Architecture

### Database Schema
Add new table `jcepApplications` to `services/backend/convex/schema.ts`:

```typescript
jcepApplications: defineTable({
  // Metadata
  submittedAt: v.number(),
  submissionYear: v.number(), // For grouping (e.g., 2025)
  
  // Section 2: Personal Particulars
  fullName: v.string(),
  contactNumber: v.string(),
  
  // Section 3: Serving Preferences
  ageGroupChoice1: v.union(
    v.literal('RK'),
    v.literal('DR'),
    v.literal('AR'),
    v.literal('ER')
  ),
  reasonForChoice1: v.string(),
  ageGroupChoice2: v.union(
    v.literal('RK'),
    v.literal('DR'),
    v.literal('AR'),
    v.literal('ER'),
    v.null()
  ),
  reasonForChoice2: v.union(v.string(), v.null()),
  
  // Acknowledgements (implicit by submission)
  acknowledgedMottoAndPledge: v.boolean(), // Always true on submit
})
  .index('by_submission_year', ['submissionYear'])
  .index('by_submitted_at', ['submittedAt']);
```

### Backend Convex Functions

Create `services/backend/convex/jcepApplications.ts`:

1. **`submitApplication` (mutation)** - Public mutation (no auth required)
   - Accepts form data
   - Validates all required fields
   - Stores submission with timestamp
   - Returns success/error

2. **`listApplications` (query)** - Authenticated query (admin only)
   - Groups by submission year
   - Sorts by submission date (desc)
   - Returns structured data for admin view

### Frontend Components

#### 1. Home Page Update (`apps/webapp/src/app/page.tsx`)
- Add "Apply Now" button that links to `/apply`
- Style consistent with existing JCEP branding

#### 2. Application Form (`apps/webapp/src/app/apply/page.tsx`)
Create multi-step form with:
- **Form Stepper Component** - Shows progress (Step 1/4, 2/4, etc.)
- **Step 1: Introduction**
  - Display Royal Rangers Motto (read-only)
  - Display Royal Rangers Pledge (read-only)
  - Display Royal Rangers Code (read-only)
  - Acknowledgement checkbox (required)
- **Step 2: Personal Particulars**
  - Full Name (text input, required)
  - Contact Number (text input, required)
- **Step 3: Serving Preferences**
  - Age Group Choice 1 (radio buttons, required)
  - Reason for Choice 1 (textarea, required)
  - Age Group Choice 2 (radio buttons, optional)
  - Reason for Choice 2 (textarea, optional)
- **Step 4: Review**
  - Summary of all entered data
  - Submit button
  - Back to edit options

**Form State Management:**
- Use React state to track current step
- Store form data in component state
- Validate on step transition
- Show validation errors inline

**Validation Rules:**
- Step 1: Acknowledgement must be checked
- Step 2: Both fields required, non-empty
- Step 3: Choice 1 and Reason 1 required; Choice 2 optional but if filled, Reason 2 becomes required
- Step 4: All validations passed before submit

#### 3. Admin Dashboard Update (`apps/webapp/src/app/app/page.tsx`)
Add new section "JCEP Applications":
- Display count of applications per year
- Link to view applications for each year
- Show total count across all years

#### 4. Admin Applications List (`apps/webapp/src/app/app/applications/page.tsx`)
New authenticated page:
- Require system_admin access
- Group applications by year (collapsible sections)
- Show table with columns:
  - Submission Date
  - Full Name
  - Contact Number
  - Age Group Choice 1
  - Age Group Choice 2 (if provided)
- Sort by submission date (descending) within each year
- Export to CSV option (future enhancement)

## UI/UX Considerations

### Dark Mode Support
All components must support light and dark mode:
- Use semantic colors (`text-foreground`, `bg-card`, etc.)
- Test in both modes before completion

### Responsive Design
- Mobile-first approach
- Form should work well on mobile (majority of users)
- Stepper should adapt to smaller screens (vertical on mobile, horizontal on desktop)

### Accessibility
- Proper form labels
- ARIA attributes for stepper
- Keyboard navigation support
- Error messages clearly associated with fields

### User Feedback
- Loading states during submission
- Success message after submission
- Error handling with user-friendly messages
- Confirmation before leaving page with unsaved data

## Implementation Steps

### Phase 1: Backend Setup
1. ✅ Add `jcepApplications` table to schema
2. ✅ Create `convex/jcepApplications.ts` with mutations/queries
3. ✅ Test backend functions with Convex dashboard

### Phase 2: Frontend - Application Form
1. ✅ Create `/apply` route and page component
2. ✅ Build form stepper component (reusable)
3. ✅ Implement Step 1 (Introduction)
4. ✅ Implement Step 2 (Personal Particulars)
5. ✅ Implement Step 3 (Serving Preferences)
6. ✅ Implement Step 4 (Review & Submit)
7. ✅ Add form validation logic
8. ✅ Connect to Convex backend
9. ✅ Add success/error states
10. ✅ Test full flow (mobile + desktop)

### Phase 3: Frontend - Home Page
1. ✅ Add "Apply Now" button to home page
2. ✅ Style consistently with existing design
3. ✅ Test navigation flow

### Phase 4: Frontend - Admin Views
1. ✅ Add applications section to `/app` dashboard
2. ✅ Create `/app/applications` page
3. ✅ Implement grouping by year
4. ✅ Implement sorting by date
5. ✅ Add admin guard (system_admin only)
6. ✅ Style with existing UI components
7. ✅ Test with multiple submissions

### Phase 5: Testing & Polish
1. ✅ Test complete user journey (apply → submit → admin view)
2. ✅ Test validation edge cases
3. ✅ Test dark mode appearance
4. ✅ Test mobile responsiveness
5. ✅ Test error scenarios (network errors, etc.)
6. ✅ Add loading states
7. ✅ Polish UI/UX based on testing

## Future Enhancements (Not in Scope)
- Email notifications on submission
- PDF export of individual applications
- Bulk CSV export
- Application status tracking (pending/approved/rejected)
- Edit submitted applications
- Application analytics dashboard

## Success Criteria
- [x] Public users can access and submit application without logging in
- [x] Form data validates correctly at each step
- [x] Submissions are stored in Convex database
- [x] Admin can view all submissions grouped by year
- [x] UI works in both light and dark mode
- [x] Form is responsive on mobile and desktop
- [x] No console errors or warnings

## Implementation Status: ✅ COMPLETE

All features have been successfully implemented and tested:

### Backend
- ✅ `jcepApplications` table added to schema with proper indexes
- ✅ `submitApplication` mutation (public, no auth required)
- ✅ `listApplications` query (admin-only)
- ✅ `getApplicationsCountByYear` query (admin-only)

### Frontend - Public
- ✅ `/apply` route with 4-step form stepper
- ✅ Step 1: Introduction with RR Motto, Pledge, Code, and Acknowledgement
- ✅ Step 2: Personal Particulars (name, contact)
- ✅ Step 3: Serving Preferences (age group choices and reasons)
- ✅ Step 4: Review & Submit
- ✅ Form validation at each step
- ✅ Success page after submission
- ✅ "Apply Now" button on home page

### Frontend - Admin
- ✅ Applications section on `/app` dashboard with counts
- ✅ `/app/applications` page with full list
- ✅ Grouped by year in collapsible sections
- ✅ Sorted by submission date (descending)
- ✅ Admin-only access control

### Quality
- ✅ TypeScript compilation passes
- ✅ ESLint checks pass
- ✅ Dark mode support throughout
- ✅ Responsive design
- ✅ Semantic color tokens used

## Notes
- This form is intentionally public (no auth required) to lower barrier to entry
- Admin access requires authentication and system_admin role
- Form submission creates a timestamped record for audit purposes
- Consider GDPR/data privacy if storing personal information long-term
