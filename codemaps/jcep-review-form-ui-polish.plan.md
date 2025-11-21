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

**Status**: ⏳ Not Started

### Files to Review

- `apps/webapp/src/modules/review/components/ReviewFormList.tsx`
- `apps/webapp/src/modules/review/components/ReviewFormCard.tsx`
- `apps/webapp/src/modules/review/components/v1/ReviewFormView.tsx`
- `apps/webapp/src/modules/review/components/v1/ParticularsSection.tsx`
- `apps/webapp/src/modules/review/components/v1/BuddyEvaluationSection.tsx`
- `apps/webapp/src/modules/review/components/v1/JCReflectionSection.tsx`
- `apps/webapp/src/modules/review/components/v1/JCFeedbackSection.tsx`
- `apps/webapp/src/modules/review/components/v1/ReviewFormProgress.tsx`
- `apps/webapp/src/modules/review/components/admin/AdminReviewDashboard.tsx`
- `apps/webapp/src/modules/review/components/admin/AdminReviewListingTable.tsx`
- `apps/webapp/src/modules/review/components/admin/AdminReviewTable.tsx`
- `apps/webapp/src/modules/review/components/admin/AdminReviewFilters.tsx`
- `apps/webapp/src/modules/review/components/admin/TokenDisplay.tsx`
- `apps/webapp/src/modules/review/components/ParticipantInfoCard.tsx`
- `apps/webapp/src/app/app/review/page.tsx`
- `apps/webapp/src/app/app/review/create/page.tsx`
- `apps/webapp/src/app/app/review/[formId]/page.tsx`
- `apps/webapp/src/app/app/admin/reviews/page.tsx`
- `apps/webapp/src/app/review/token/[token]/page.tsx`

### Tasks

- [ ] Identify places where visual hierarchy is weak (e.g. too many headings, unclear primary info on cards).
- [ ] Identify places where copy is overly wordy or repetitive.
- [ ] Identify any clickable `div`/`span` or row-only click handlers that are not keyboard-friendly.
- [ ] Document keyboard traps or awkward flows (e.g. modals without Escape, hidden focus outlines).
- [ ] Decide on consistent:
  - [ ] Page headers and section headings.
  - [ ] Card layout structure (title, meta, actions).
  - [ ] Progress indicator layout (especially on mobile).
  - [ ] Focus styles (rely on ShadCN defaults + Tailwind where necessary).
- [ ] Capture design decisions in this file so later milestones can implement them.

### Validation

- [ ] All listed files quickly reviewed.
- [ ] A short written summary of issues and target improvements added to this plan.

### Commit

- [ ] Commit: `docs: add review form UI polish plan`

---

## Milestone 2: Review List & Card UI + Keyboard Navigation

**Goal**: Make review lists and cards clean, mobile-friendly, and fully keyboard-operable.

**Status**: ⏳ Not Started

### Scope

- `ReviewFormList.tsx`
- `ReviewFormCard.tsx`
- `app/app/review/page.tsx`
- `app/app/review/create/page.tsx` (header/layout consistency)
- Buddy dashboard listing (if applicable on `/app/review/my-jcs`)

### Tasks

- [ ] Simplify list page header and description text (keep to 1–2 short lines).
- [ ] Ensure filters (year/status/etc.) are:
  - [ ] In a compact layout that stacks cleanly on mobile.
  - [ ] Reachable and operable via keyboard (Tab/Shift+Tab).
- [ ] Update `ReviewFormCard` visual hierarchy:
  - [ ] JC name as primary title.
  - [ ] Buddy name + age group badge as secondary.
  - [ ] Status badge and compact progress line.
  - [ ] Avoid duplicated or verbose labels.
- [ ] Ensure card interaction is accessible:
  - [ ] Use semantic `Link` or `button` elements rather than clickable `div`s.
  - [ ] Avoid nested interactive elements inside a fully clickable card.
  - [ ] Provide visible focus ring on the primary interactive element.
- [ ] On mobile, ensure:
  - [ ] Cards use single-column layout with adequate spacing.
  - [ ] No overflowing text; use truncation where appropriate.

### Keyboard UX Checklist

- [ ] Tabbing through the list focuses cards or “Open” buttons in a logical order.
- [ ] Enter/Space activates navigation for each card.
- [ ] Filters can be adjusted using only keyboard (including dropdowns/selects).

### Validation

- [ ] `cd apps/webapp && npx tsc --noEmit`
- [ ] `cd apps/webapp && npx biome check .`
- [ ] (When dev server is available) Manually tab through `/app/review` and confirm usable without mouse.

### Commit

- [ ] Commit: `feat: refine review list cards and keyboard navigation`

---

## Milestone 3: Form View & Sections – Layout, Copy, Keyboard Flow

**Goal**: Make the main review form view and all sections feel structured, concise, and easy to navigate via keyboard.

**Status**: ⏳ Not Started

### Scope

- `v1/ReviewFormView.tsx`
- `v1/ReviewFormProgress.tsx`
- `v1/ParticularsSection.tsx`
- `v1/BuddyEvaluationSection.tsx`
- `v1/JCReflectionSection.tsx`
- `v1/JCFeedbackSection.tsx`
- `ParticipantInfoCard.tsx` (for token flows and context)

### Tasks

- [ ] Restructure `ReviewFormView` into:
  - [ ] Clear page header (names, age group, role, status).
  - [ ] Progress component near top.
  - [ ] Sections rendered as separate cards in a sensible order.
  - [ ] Clear action area for save/submit.
- [ ] Ensure `ReviewFormProgress` is:
  - [ ] Screen-reader friendly (aria labels for steps).
  - [ ] Navigable via keyboard (steps as `button`s or `Link`s, not plain text).
  - [ ] Visually compact on mobile (avoid multi-line labels where possible).
- [ ] In each section component:
  - [ ] Use short labels for questions; move long wording to helper text or rely on stored `questionText` only for backend.
  - [ ] Ensure fields are ordered logically for Tab navigation.
  - [ ] Ensure all action buttons (Save/Edit) are standard `Button` components with visible focus states.
- [ ] Simplify copy:
  - [ ] Avoid long paragraphs at top of sections.
  - [ ] Prefer one-sentence intros or rely purely on field labels.

### Keyboard UX Checklist

- [ ] Starting from top of page, Tab cycles through: header actions → progress → first editable field in the current section → subsequent fields → section actions (Save/Submit).
- [ ] Pressing Enter on “Save” triggers save; focus behavior is predictable (e.g. stays in section).
- [ ] No hidden focusable elements or off-screen traps from conditionally rendered content.

### Validation

- [ ] `cd apps/webapp && npx tsc --noEmit`
- [ ] `cd apps/webapp && npx biome check .`
- [ ] (When dev server is available) Manual keyboard-only walkthrough of a full form (all sections).

### Commit

- [ ] Commit: `feat: polish review form view layout and keyboard flow`

---

## Milestone 4: Token Access & Admin Surfaces – Clarity & Accessibility

**Goal**: Make token-based access pages and admin dashboards concise, informative, and keyboard accessible.

**Status**: ⏳ Not Started

### Scope

- `apps/webapp/src/app/review/token/[token]/page.tsx`
- `ParticipantInfoCard.tsx`
- `admin/AdminReviewDashboard.tsx`
- `admin/AdminReviewListingTable.tsx`
- `admin/AdminReviewTable.tsx`
- `admin/AdminReviewFilters.tsx`
- `admin/TokenDisplay.tsx`

### Tasks

- [ ] Token access page:
  - [ ] Keep explanation to 1–3 short sentences.
  - [ ] Ensure `ParticipantInfoCard` clearly shows who the user is and other participant’s status using concise labels.
  - [ ] Ensure primary action (“Continue” or “Open form”) is a single, obvious button with good focus styling.
- [ ] `ParticipantInfoCard`:
  - [ ] Use semantic headings and labels.
  - [ ] Avoid overly verbose descriptions.
  - [ ] Ensure contents stack nicely on mobile.
- [ ] Admin filters (`AdminReviewFilters`):
  - [ ] Ensure all filter controls are reachable and operable via keyboard.
  - [ ] Consider grouping filters visually within one compact card.
- [ ] Tables (`AdminReviewTable`, `AdminReviewListingTable`):
  - [ ] Ensure row actions are implemented as `Link`s or `button`s, not row-only click handlers.
  - [ ] Provide focus styles for action cells and any inline buttons (copy tokens, view).
- [ ] `TokenDisplay`:
  - [ ] Ensure copy buttons have accessible labels and tooltips if needed.
  - [ ] Confirm Enter/Space activates copy behavior and any success feedback is conveyed (e.g. toast).

### Keyboard UX Checklist

- [ ] From the token page, user can:
  - [ ] Tab to the main CTA and activate it with Enter/Space.
  - [ ] Reach any secondary actions (if present) in sensible order.
- [ ] In admin tables:
  - [ ] Tab order moves across filter controls, then into table header, then row actions.
  - [ ] Row-level actions are focusable and operable via keyboard.

### Validation

- [ ] `cd apps/webapp && npx tsc --noEmit`
- [ ] `cd apps/webapp && npx biome check .`
- [ ] (When dev server is available) Keyboard-only test of token page and admin review pages.

### Commit

- [ ] Commit: `feat: improve token and admin review UI accessibility`

---

## Milestone 5: Final Accessibility & UX Pass

**Goal**: Do a final pass for inconsistencies, keyboard issues, and wordiness; ensure checks and tests pass.

**Status**: ⏳ Not Started

### Tasks

- [ ] Run a quick scan for:
  - [ ] Click handlers on non-interactive elements (`div`, `span`) and replace with semantic elements.
  - [ ] Missing `aria-label`s on icon-only buttons.
  - [ ] Overly verbose labels or helper texts; tighten where possible.
  - [ ] Inconsistent card headers or spacing across review components.
- [ ] Ensure all review-related pages:
  - [ ] Use semantic color tokens (`bg-card`, `text-muted-foreground`, etc.).
  - [ ] Look clean and uncluttered on mobile (no squeezed side-by-side layouts).
- [ ] Confirm that each milestone’s keyboard UX checklist items are satisfied.

### Validation

- [ ] `cd services/backend && npx tsc --noEmit` (sanity check)
- [ ] `cd services/backend && npx biome check .`
- [ ] `cd apps/webapp && npx tsc --noEmit`
- [ ] `cd apps/webapp && npx biome check .`
- [ ] `cd apps/webapp && npx vitest run`

### Commit

- [ ] Commit: `chore: finalize review form UI and keyboard accessibility`

---

## Summary

**Total Milestones**: 5  
**Completed**: 0  
**In Progress**: 0  
**Not Started**: 5

**Next Action**: Complete Milestone 1 audit and update this plan with specific UX decisions.


