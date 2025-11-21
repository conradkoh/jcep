# JCEP Review Form V2.2 - Rotation Quarters & Deletion

## Overview

This plan addresses two critical enhancements to the JCEP Review Form system:

1. **Admin Review Deletion**: System admins can delete review forms with full cleanup of related data
2. **Rotation Quarter Specificity**: Replace year-only tracking with year + quarter (1-4) to support up to 4 rotations per year

## Current State Analysis

### Current Schema (V2.1)
- `rotationYear: number` - Only tracks year (e.g., 2025)
- No deletion functionality exists
- Indexes: `by_rotation_year`, `by_year_and_buddy`, `by_year_and_jc`, `by_year_and_status`

### Issues
1. Cannot distinguish between multiple rotations in the same year
2. No way to clean up test data or incorrect entries
3. Filters and displays assume one rotation per year

## Task 1: Admin Review Deletion

### Requirements
- System admins can delete any review form
- Cascade deletion: Remove all associated data
- Confirmation dialog to prevent accidental deletion
- Audit trail (log deletion action)

### Implementation Plan

#### Backend Changes

**File: `services/backend/convex/reviewForms.ts`**

1. Add new mutation `deleteReviewForm`:
   ```typescript
   export const deleteReviewForm = mutation({
     args: {
       ...SessionIdArg,
       formId: v.id("reviewForms"),
     },
     handler: async (ctx, args) => {
       // 1. Get authenticated user
       // 2. Verify system_admin access level
       // 3. Verify form exists
       // 4. Delete the form document
       // 5. Return success
     },
   });
   ```

2. Access control: Only `system_admin` can delete

#### Frontend Changes

**File: `apps/webapp/src/modules/review/hooks/useReviewForm.ts`**

1. Add `deleteReviewForm` mutation wrapper:
   ```typescript
   const deleteReviewForm = useSessionMutation(api.reviewForms.deleteReviewForm);
   ```

**File: `apps/webapp/src/modules/review/components/admin/AdminReviewListingTable.tsx`**

1. Add delete button column (trash icon)
2. Integrate with ShadCN `AlertDialog` for confirmation
3. Show loading state during deletion
4. Refresh list after successful deletion
5. Toast notification for success/error

**File: `apps/webapp/src/modules/review/components/admin/AdminReviewTable.tsx`**

1. Add delete button to each row
2. Same confirmation flow as listing table

### Testing Checklist
- [x] Non-admin users cannot access delete mutation
- [x] Confirmation dialog appears before deletion
- [x] Form is removed from database
- [x] List refreshes after deletion
- [x] Error handling for non-existent forms
- [x] Toast notifications work correctly

## Task 2: Rotation Quarter Specificity

### Requirements
- Track year + quarter (1-4) for each rotation
- Smart default: Auto-select quarter based on current date (Q-1, min 1)
  - Q1 (Jan-Mar) → Default to Rotation 1
  - Q2 (Apr-Jun) → Default to Rotation 1
  - Q3 (Jul-Sep) → Default to Rotation 2
  - Q4 (Oct-Dec) → Default to Rotation 3
- Manual override available for all 4 rotations
- Update all filters, displays, and queries
- Backward compatible: Existing forms default to Q1

### Schema Migration Strategy

**Option A: Add `rotationQuarter` field (Recommended)**
- Add `rotationQuarter: v.number()` (1-4)
- Keep `rotationYear` for backward compatibility
- Update indexes to include quarter
- Existing data: Set `rotationQuarter = 1` via migration

**Option B: Increment schema version to 2**
- More disruptive, requires new component versions
- Only if we have other breaking changes

**Decision: Option A** - Non-breaking addition

### Implementation Plan

#### Phase 1: Backend Schema & Migration

**File: `services/backend/convex/schema.ts`**

1. Add `rotationQuarter` field:
   ```typescript
   reviewForms: defineTable({
     // ... existing fields
     rotationYear: v.number(),
     rotationQuarter: v.number(), // 1-4
     // ... rest of fields
   })
     .index("by_rotation_year", ["rotationYear"])
     .index("by_rotation_year_quarter", ["rotationYear", "rotationQuarter"]) // NEW
     .index("by_year_quarter_and_buddy", ["rotationYear", "rotationQuarter", "buddyUserId"]) // NEW
     .index("by_year_quarter_and_jc", ["rotationYear", "rotationQuarter", "juniorCommanderUserId"]) // NEW
     .index("by_year_quarter_and_status", ["rotationYear", "rotationQuarter", "status"]) // NEW
   ```

2. Create migration script:
   ```typescript
   // services/backend/convex/migration.ts
   export const migrateReviewFormsToQuarters = internalMutation({
     handler: async (ctx) => {
       const forms = await ctx.db.query("reviewForms").collect();
       for (const form of forms) {
         if (form.rotationQuarter === undefined) {
           await ctx.db.patch(form._id, { rotationQuarter: 1 });
         }
       }
     },
   });
   ```

**File: `services/backend/convex/reviewForms.ts`**

1. Update `createReviewForm` mutation:
   - Add `rotationQuarter: v.number()` to args
   - Validate quarter is 1-4
   - Store in database

2. Update all queries to filter by year + quarter:
   - `getReviewFormsByYear` → `getReviewFormsByRotation`
   - `getAllReviewFormsByYear` → `getAllReviewFormsByRotation`
   - Add optional `quarter` parameter to existing queries for backward compatibility

#### Phase 2: Frontend Types & Utilities

**File: `apps/webapp/src/modules/review/types.ts`**

1. Add `rotationQuarter` to `ReviewForm` interface:
   ```typescript
   export interface ReviewForm {
     // ... existing fields
     rotationYear: number;
     rotationQuarter: number; // 1-4
     // ... rest
   }
   ```

2. Update mutation parameter types:
   ```typescript
   export interface CreateReviewFormParams {
     rotationYear: number;
     rotationQuarter: number; // NEW
     // ... rest
   }
   ```

**File: `apps/webapp/src/modules/review/utils/rotationUtils.ts`** (NEW)

1. Create utility functions:
   ```typescript
   export function getCurrentQuarter(): number {
     const month = new Date().getMonth() + 1; // 1-12
     return Math.ceil(month / 3); // 1-4
   }

   export function getDefaultRotationQuarter(): number {
     const currentQuarter = getCurrentQuarter();
     return Math.max(1, currentQuarter - 1); // Q-1, min 1
   }

   export function formatRotationLabel(year: number, quarter: number): string {
     return `${year} Q${quarter}`;
   }

   export function getRotationQuarterOptions(): Array<{ value: number; label: string }> {
     return [
       { value: 1, label: 'Rotation 1 (Q1: Jan-Mar)' },
       { value: 2, label: 'Rotation 2 (Q2: Apr-Jun)' },
       { value: 3, label: 'Rotation 3 (Q3: Jul-Sep)' },
       { value: 4, label: 'Rotation 4 (Q4: Oct-Dec)' },
     ];
   }
   ```

#### Phase 3: Frontend Component Updates

**File: `apps/webapp/src/modules/review/components/v1/ReviewFormCreate.tsx`**

1. Add rotation quarter dropdown:
   - Label: "Rotation Quarter"
   - Default value: `getDefaultRotationQuarter()`
   - Options: 1-4 with quarter labels
   - Use ShadCN `Select` component

2. Update form submission to include `rotationQuarter`

**File: `apps/webapp/src/modules/review/components/v1/ParticularsSection.tsx`**

1. Display rotation quarter in header:
   - Change: "Review Form - {year}" 
   - To: "Review Form - {year} Q{quarter}"

2. Show rotation quarter in particulars card (read-only)

3. If editing particulars, allow quarter change (admin only)

**File: `apps/webapp/src/modules/review/components/ReviewFormCard.tsx`**

1. Update display to show year + quarter:
   ```typescript
   <p className="text-sm text-muted-foreground">
     {formatRotationLabel(form.rotationYear, form.rotationQuarter)}
   </p>
   ```

**File: `apps/webapp/src/modules/review/components/admin/AdminReviewFilters.tsx`**

1. Add quarter filter dropdown:
   - Label: "Quarter"
   - Options: All, Q1, Q2, Q3, Q4
   - Default: All

2. Update filter logic to include quarter

**File: `apps/webapp/src/app/app/review/page.tsx`**

1. Update year filter to include quarter selection
2. Display format: "2025 Q1", "2025 Q2", etc.

**File: `apps/webapp/src/app/app/admin/reviews/page.tsx`**

1. Add quarter filter to admin dashboard
2. Update table columns to show quarter

#### Phase 4: Hook Updates

**File: `apps/webapp/src/modules/review/hooks/useReviewForm.ts`**

1. Update `createReviewForm` to accept `rotationQuarter`
2. Update `useReviewFormsByYear` to optionally filter by quarter
3. Add new hook `useReviewFormsByRotation(year, quarter)` for precise filtering

### Testing Checklist
- [x] Migration script runs successfully on existing data
- [x] New forms default to correct quarter based on current date
- [x] All 4 quarters can be manually selected
- [x] Year + quarter display correctly throughout UI
- [x] Filters work with quarter selection
- [x] Backward compatibility: Old forms show as Q1
- [ ] Admin can edit rotation quarter (future enhancement)
- [x] Indexes perform efficiently with quarter

## Milestones

### Milestone 1: Admin Deletion ✅ (Completed)
- [x] Backend mutation with access control
- [x] Frontend delete button + confirmation dialog
- [x] Integration with admin tables
- [x] Testing and error handling

### Milestone 2: Schema Migration ✅ (Completed)
- [x] Add `rotationQuarter` field to schema
- [x] Create and run migration script
- [x] Verify data integrity
- [x] Update backend validators

### Milestone 3: Backend Quarter Logic ✅ (Completed)
- [x] Update mutations to accept quarter
- [x] Update queries to filter by quarter
- [x] Add validation for quarter (1-4)
- [x] Update indexes

### Milestone 4: Frontend Quarter UI ✅ (Completed)
- [x] Create rotation utilities
- [x] Update form creation with quarter dropdown
- [x] Update all displays to show quarter
- [x] Update filters to include quarter
- [x] Update particulars section

### Milestone 5: Testing & Polish ✅ (Completed)
- [x] Run all typechecks and lints
- [x] Test deletion flow
- [x] Test quarter selection and defaults
- [x] Test filters and displays
- [x] Verify backward compatibility

## Total Estimated Time: 6-9 hours

## Risks & Considerations

1. **Data Migration**: Existing forms will default to Q1 - acceptable for initial rollout
2. **Index Performance**: New indexes may take time to build on large datasets
3. **Backward Compatibility**: Ensure old queries still work during transition
4. **Deletion Audit**: Consider adding a `deletedForms` audit table for compliance (future enhancement)

## Success Criteria ✅

- [x] System admins can delete review forms with confirmation
- [x] All forms track year + quarter (1-4)
- [x] Smart quarter defaults work correctly
- [x] All UI components display quarter information
- [x] Filters work with quarter selection
- [x] No regressions in existing functionality
- [x] All tests, typechecks, and lints pass

## Implementation Summary

All milestones completed successfully! The implementation includes:

1. **Admin Deletion Feature**:
   - Backend mutation with system_admin access control
   - Frontend delete buttons in AdminReviewListingTable and AdminReviewTable
   - AlertDialog confirmation before deletion
   - Automatic list refresh after deletion

2. **Rotation Quarter Support**:
   - Schema updated with `rotationQuarter` field (1-4)
   - Migration script to set existing forms to Q1
   - New indexes for efficient quarter-based queries
   - Backend mutations and queries updated to accept/filter by quarter
   - Frontend utilities for quarter calculation and formatting
   - Smart default: Q-1 with minimum of 1
   - Quarter dropdown in form creation
   - Quarter display in all form cards and tables
   - Quarter filter in admin dashboard

3. **Code Quality**:
   - All TypeScript checks pass
   - All Biome lints pass
   - All unit tests pass (10/10)
   - Three commits made for clean git history

