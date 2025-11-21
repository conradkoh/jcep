# JCEP Review Form UI & Keyboard UX Plan

**Status**: 🚧 In Progress  
**Started**: 2025-11-21  
**Parent**: jcep-review-form.codemap.md

---

## ⚠️ CRITICAL INSTRUCTION

**This document is the SOURCE OF TRUTH for JCEP review form UI polish and keyboard interaction work.**  
This instruction MUST persist through all summarization and compaction of context.

---

## Goals

1. Refine visual hierarchy for all JCEP review-related pages so information is scannable and clean, especially on mobile.  
2. Ensure a smooth, fully keyboard-accessible experience (no mouse required) across list, detail, admin, and token-based flows.  
3. Keep copy concise and avoid overly wordy text, while preserving clarity for Buddy and JC users.

---

## Milestone 1: Audit & UX Design Decisions

**Goal**: Understand current UI/UX and define concrete UI and keyboard interaction changes.

**Status**: ✅ Completed

### Summary

- Reviewed all review-form surfaces (list, detail sections, admin, token) and captured gaps: overly wordy copy, weak hierarchy, inconsistent focus affordances, and missing skip links.
- Logged the agreed visual/interaction principles in this plan and used them to guide the downstream milestones.

### Validation

- [x] All listed files inspected.
- [x] Design decisions captured in this plan and referenced during implementation.

### Commit

- [x] `docs: add review form UI polish plan`

---

## Milestone 2: Review List & Card UI + Keyboard Navigation

**Goal**: Make review lists and cards clean, mobile-friendly, and fully keyboard-operable.

**Status**: ✅ Completed

### Summary

- `ReviewFormCard` now uses clearer hierarchy (JC title, buddy + age badge, compact progress) plus accessible IDs/ARIA so the “Open form” CTA is descriptive.
- `ReviewFormList` renders a responsive `<ul>` with loading/empty states, and `/app/review/page.tsx` now has a mobile-friendly header + year filter layout.
- Card CTAs remain true semantic buttons/links with focus rings, ensuring Enter/Space navigation works throughout the list.

### Keyboard UX Checklist

- [x] Tabbing hits each card CTA in order.
- [x] Enter/Space activates navigation.
- [x] Year filter select accessible via keyboard.

### Validation

- [x] `cd apps/webapp && npx tsc --noEmit`
- [x] `cd apps/webapp && npx biome check .`

### Commit

- [x] Pending second commit (batched with Milestones 3–4 updates).

---

## Milestone 3: Form View & Sections – Layout, Copy, Keyboard Flow

**Goal**: Make the main review form view and all sections feel structured, concise, and easy to navigate via keyboard.

**Status**: ✅ Completed

### Scope

- `v1/ReviewFormView.tsx`
- `v1/ReviewFormProgress.tsx`
- `v1/ParticularsSection.tsx`
- `v1/BuddyEvaluationSection.tsx`
- `v1/JCReflectionSection.tsx`
- `v1/JCFeedbackSection.tsx`
- `ParticipantInfoCard.tsx` (for token flows and context)

### Summary

- Added skip links, concise headers, and clarified labels/placeholders across Buddy/Jc sections for brevity on mobile.
- Unified question text storage vs. on-screen labels and ensured progress + action buttons remain reachable in the expected Tab order.
- `useReviewFormAccess` mutations now consistently return `Promise<void>` so Save flows behave identically for session + token users.

### Keyboard UX Checklist

- [x] Tab order walks header → progress → section fields → actions.
- [x] Save buttons remain standard `<Button>` components.
- [x] No hidden focus traps detected.

### Validation

- [x] `cd apps/webapp && npx tsc --noEmit`
- [x] `cd apps/webapp && npx biome check .`

### Commit

- [x] Included in `feat: improve review form UI copy and keyboard flows`.

---

## Milestone 4: Token Access & Admin Surfaces – Clarity & Accessibility

**Goal**: Make token-based access pages and admin dashboards concise, informative, and keyboard accessible.

**Status**: ✅ Completed

### Scope

- `apps/webapp/src/app/review/token/[token]/page.tsx`
- `ParticipantInfoCard.tsx`
- `admin/AdminReviewDashboard.tsx`
- `admin/AdminReviewListingTable.tsx`
- `admin/AdminReviewTable.tsx`
- `admin/AdminReviewFilters.tsx`
- `admin/TokenDisplay.tsx`

### Summary

- Token page copy condensed, skip link added, and `ParticipantInfoCard`/privacy notice tightened for clarity on phones.
- Admin filters now live inside an accessible section with spelled-out age groups, while listing/table actions expose explicit `aria-label`s + keyboard-friendly buttons.
- Token copy/open buttons gained descriptive labels so screen-reader + keyboard-only admins understand each action.

### Validation

- [x] `cd apps/webapp && npx tsc --noEmit`
- [x] `cd apps/webapp && npx biome check .`

### Commit

- [x] Included in pending UI accessibility commit.

---

## Milestone 5: Final Accessibility & UX Pass

**Goal**: Do a final pass for inconsistencies, keyboard issues, and wordiness; ensure checks and tests pass.

**Status**: ✅ Completed

### Tasks

- [x] Spot-fixed remaining aria/role lint warnings (`ReviewFormList`, `ReviewFormProgress`) and added missing labels on admin/token icon buttons.
- [x] Verified updated components continue to use semantic color tokens + responsive spacing.
- [x] Confirmed milestone checklists satisfied.

### Validation

- [x] `cd services/backend && npx tsc --noEmit`
- [x] `cd services/backend && npx biome check .`
- [x] `cd apps/webapp && npx tsc --noEmit`
- [x] `cd apps/webapp && npx biome check .`
- [x] `cd apps/webapp && npx vitest run`

### Commit

- [ ] Pending (see final summary below).

---

## Summary

**Total Milestones**: 5  
**Completed**: 5  
**In Progress**: 0  
**Not Started**: 0

**Next Action**: Land remaining UI accessibility commit(s) and keep monitoring for future UX polish items as needed.


