# JCEP Review Form V2 Enhancements Plan

**Status**: 📋 Planning Phase  
**Created**: 2025-11-21  
**Parent**: jcep-review-form.plan.md (V1 Complete)

---

## Overview

This document outlines enhancements to the existing JCEP Review Form system to support:
1. Admin-initiated form creation with secret links
2. Anonymous access via tokens (before account linking)
3. Response visibility control (hidden until admin reveals)
4. Buddy access to all their assigned forms

---

## Current State (V1)

✅ **Implemented Features:**
- Forms created by buddy/admin with both names assigned
- Session-based authentication
- Buddy and JC can see each other's responses immediately
- Progressive editing (save, edit, re-save)
- Admin dashboard with filtering and export
- Dark mode support throughout

❌ **Limitations:**
- No anonymous access mechanism
- No response visibility control
- No secret link generation
- Buddy cannot see aggregated view of all their forms

---

## Proposed Changes (V2)

### 1. Secret Token System

**Backend Changes:**
- Add `buddyAccessToken` and `jcAccessToken` fields to `reviewForms` table
- Generate cryptographically secure tokens on form creation
- Add token-based authentication alongside session auth
- Token expiry mechanism (optional, for security)

**Frontend Changes:**
- New route: `/review/token/[token]` for anonymous access
- Token validation before showing form
- Store token in localStorage for return visits
- Link account later (convert token access to user access)

### 2. Response Visibility Control

**Backend Changes:**
- Add `buddyResponsesVisibleToJC` boolean field (default: false)
- Add `jcResponsesVisibleToBuddy` boolean field (default: false)
- Modify query logic to filter responses based on visibility flags
- Admin mutation to toggle visibility flags

**Frontend Changes:**
- Conditionally render sections based on visibility
- Show "Response hidden by admin" placeholder
- Admin UI to toggle visibility per form
- Visual indicators for hidden/visible state

### 3. Buddy Aggregated View

**Backend Changes:**
- New query: `getReviewFormsByBuddy(buddyUserId, year?)` 
- Returns all forms where user is assigned as buddy
- Efficient index: `by_buddy_and_year`

**Frontend Changes:**
- New page: `/app/review/my-jcs` - Buddy's dashboard
- List all JCs assigned to current buddy
- Quick access to each form
- Status indicators for each form

### 4. Admin Form Pre-Creation

**Backend Changes:**
- Modify `createReviewForm` to generate tokens automatically
- Return tokens in response for admin to distribute
- Add `createdBy` tracking (admin who created it)

**Frontend Changes:**
- Enhanced create form UI for admins
- Display generated links after creation
- Copy-to-clipboard functionality
- Email integration (future: send links directly)

---

## Implementation Plan

### Phase 1: Secret Token System (Milestone 7)

**Backend Tasks:**
1. Update schema with token fields
2. Generate tokens on form creation
3. Add token validation function
4. Implement token-based query access
5. Add token expiry logic (optional)

**Frontend Tasks:**
1. Create `/review/token/[token]` route
2. Implement token validation UI
3. Store token in localStorage
4. Handle token errors gracefully
5. Add "Link Account" flow

**Testing:**
- Generate token and access form anonymously
- Verify token validation
- Test invalid/expired tokens
- Test localStorage persistence

### Phase 2: Response Visibility Control (Milestone 8)

**Backend Tasks:**
1. Add visibility flags to schema
2. Modify query logic to respect flags
3. Add admin mutations to toggle visibility
4. Update existing queries to filter responses

**Frontend Tasks:**
1. Conditionally render sections
2. Add "Hidden Response" placeholders
3. Create admin visibility controls
4. Add visual indicators
5. Update form view to show/hide appropriately

**Testing:**
- Toggle visibility and verify responses hidden
- Test as buddy when JC responses hidden
- Test as JC when buddy responses hidden
- Verify admin can always see all responses

### Phase 3: Buddy Aggregated View (Milestone 9)

**Backend Tasks:**
1. Create `getReviewFormsByBuddy` query
2. Add `by_buddy_and_year` index
3. Optimize query performance

**Frontend Tasks:**
1. Create `/app/review/my-jcs` page
2. Implement buddy dashboard component
3. Add filtering by year/status
4. Add quick actions (view, edit)
5. Show completion status for each form

**Testing:**
- Verify buddy sees all their assigned forms
- Test filtering and sorting
- Verify non-buddies cannot access
- Test with multiple years of data

### Phase 4: Enhanced Admin Creation (Milestone 10)

**Backend Tasks:**
1. Ensure tokens returned in create response
2. Add mutation to regenerate tokens (if needed)

**Frontend Tasks:**
1. Enhanced create form UI
2. Display generated links after creation
3. Add copy-to-clipboard buttons
4. Add QR code generation (optional)
5. Email integration UI (future)

**Testing:**
- Create form and verify tokens generated
- Test copy-to-clipboard functionality
- Verify links work correctly
- Test with multiple forms

---

## Schema Changes

### reviewForms Table Updates

```typescript
// New fields to add:
{
  // Secret access tokens
  buddyAccessToken: v.string(), // Cryptographically secure token
  jcAccessToken: v.string(), // Cryptographically secure token
  tokenExpiresAt: v.union(v.number(), v.null()), // Optional expiry
  
  // Response visibility control
  buddyResponsesVisibleToJC: v.boolean(), // Default: false
  jcResponsesVisibleToBuddy: v.boolean(), // Default: false
  
  // Visibility change tracking
  visibilityChangedAt: v.union(v.number(), v.null()),
  visibilityChangedBy: v.union(v.id("users"), v.null()),
}

// New indexes:
.index("by_buddy_access_token", ["buddyAccessToken"])
.index("by_jc_access_token", ["jcAccessToken"])
.index("by_buddy_and_year", ["buddyUserId", "rotationYear"])
```

---

## API Changes

### New Queries

```typescript
// Get form by access token (anonymous access)
getReviewFormByToken(args: {
  token: string;
}): Promise<ReviewFormDoc | null>

// Get all forms where user is buddy
getReviewFormsByBuddy(args: {
  sessionId: string;
  buddyUserId?: Id<"users">; // Optional, defaults to current user
  year?: number; // Optional year filter
}): Promise<ReviewFormDoc[]>
```

### New Mutations

```typescript
// Toggle response visibility
toggleResponseVisibility(args: {
  sessionId: string;
  formId: Id<"reviewForms">;
  buddyResponsesVisibleToJC?: boolean;
  jcResponsesVisibleToBuddy?: boolean;
}): Promise<void>

// Regenerate access tokens (if compromised)
regenerateAccessTokens(args: {
  sessionId: string;
  formId: Id<"reviewForms">;
  regenerateBuddy?: boolean;
  regenerateJC?: boolean;
}): Promise<{
  buddyAccessToken?: string;
  jcAccessToken?: string;
}>
```

### Modified Queries

```typescript
// getReviewForm - now supports token-based access
getReviewForm(args: {
  sessionId?: string; // Optional for token access
  formId: Id<"reviewForms">;
  accessToken?: string; // Alternative to session
}): Promise<ReviewFormDoc | null>
```

---

## Migration Strategy

### Database Migration

1. Add new fields with default values
2. Generate tokens for existing forms
3. Set visibility flags to `true` for existing forms (backward compatible)
4. Add new indexes

### Code Migration

1. Update types to include new fields
2. Modify existing queries to handle visibility
3. Add new routes and components
4. Update admin UI with new controls
5. Add token-based authentication flow

### User Migration

1. Existing forms continue to work (visibility = true)
2. New forms use token-based flow
3. Users can convert token access to account access
4. No breaking changes to existing functionality

---

## Security Considerations

### Token Security

- Use cryptographically secure random tokens (32+ characters)
- Store tokens hashed in database (optional, for extra security)
- Implement rate limiting on token validation
- Add token expiry (optional, configurable per form)
- Log token access for audit trail

### Access Control

- Token grants access only to specific form
- Token cannot be used to access other forms
- Admin can revoke/regenerate tokens
- Visibility flags enforced at query level
- Admin always has full visibility

### Privacy

- Responses hidden by default in new flow
- Admin explicitly enables visibility
- Audit trail for visibility changes
- Token access logged for security

---

## UI/UX Considerations

### Anonymous Access Flow

1. User receives link: `/review/token/abc123...`
2. System validates token and shows form
3. User completes their section
4. Option to "Link Account" for easier future access
5. Token stored in localStorage for return visits

### Buddy Dashboard

1. Navigate to "My Junior Commanders"
2. See all assigned forms in card grid
3. Filter by year, status, completion
4. Quick actions: View, Edit, Export
5. Visual indicators for completion status

### Admin Controls

1. Create form → Generate tokens → Copy links
2. Toggle visibility per form
3. Regenerate tokens if compromised
4. View access logs (future)
5. Bulk operations (future)

---

## Testing Strategy

### Unit Tests

- Token generation and validation
- Visibility flag logic
- Query filtering based on visibility
- Access control enforcement

### Integration Tests

- End-to-end token-based access
- Visibility toggle workflow
- Buddy dashboard functionality
- Admin creation and distribution

### Browser Tests

- Anonymous access via token link
- Response hiding/showing
- Buddy viewing all their forms
- Admin creating and distributing forms
- Dark mode compatibility

---

## Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Deploy to staging environment
- Test with admin accounts
- Verify token generation and access
- Test visibility controls

### Phase 2: Pilot (Week 2)
- Select small group of buddies/JCs
- Distribute test forms
- Gather feedback
- Fix any issues

### Phase 3: Full Rollout (Week 3+)
- Deploy to production
- Migrate existing forms (optional)
- Train admins on new features
- Monitor usage and performance

---

## Future Enhancements

### Email Integration
- Send token links directly from admin UI
- Email templates for buddy and JC
- Automated reminders for incomplete forms

### Advanced Analytics
- Track response times
- Completion rates by buddy/JC
- Identify bottlenecks in process

### Bulk Operations
- Create multiple forms at once
- Bulk visibility toggle
- Bulk token regeneration

### Mobile App
- Native mobile app for easier access
- Push notifications for form updates
- Offline support

---

## Success Metrics

### Adoption
- % of forms using token-based access
- % of buddies using aggregated view
- % of admins using pre-creation flow

### Efficiency
- Time to complete form (before vs after)
- Number of forms completed per buddy
- Admin time saved on form distribution

### Quality
- Response quality (length, detail)
- Completion rates
- User satisfaction scores

---

## Decision Log

### Why Secret Tokens?
- Allows anonymous access before account creation
- Simpler than email-based authentication
- More flexible for distribution (QR codes, etc.)
- Can be converted to account access later

### Why Visibility Flags?
- Prevents premature viewing of responses
- Allows admin to control reveal timing
- Supports blind evaluation workflow
- Can be toggled per form as needed

### Why Buddy Aggregated View?
- Buddies often manage multiple JCs
- Reduces navigation overhead
- Provides overview of all assignments
- Enables better time management

---

## Open Questions

1. **Token Expiry**: Should tokens expire? If so, what duration?
   - Recommendation: Optional, configurable per form (default: no expiry)

2. **Email Integration**: Should we auto-send emails or just provide links?
   - Recommendation: Phase 1 = copy links, Phase 2 = email integration

3. **Account Linking**: Required or optional?
   - Recommendation: Optional, but encouraged for easier access

4. **Visibility Default**: Should new forms default to hidden or visible?
   - Recommendation: Hidden (new flow), Visible (backward compatible)

5. **Token Regeneration**: Should old token be invalidated immediately?
   - Recommendation: Yes, invalidate old token when regenerating

---

## Summary

This enhancement plan adds significant value to the JCEP Review Form system:

✅ **Admin Efficiency**: Pre-create forms and distribute via links  
✅ **Privacy Control**: Hide responses until appropriate time  
✅ **Buddy Experience**: Aggregated view of all assignments  
✅ **Flexibility**: Token-based access for anonymous users  
✅ **Security**: Cryptographic tokens with optional expiry  
✅ **Backward Compatible**: Existing forms continue to work  

**Estimated Effort**: 4 milestones, ~2-3 weeks of development

**Risk Level**: Medium (requires careful access control implementation)

**Impact**: High (significantly improves workflow and privacy)

