# Kano Model Analysis

Feature categorization for launch planning. Focuses on what is missing or incomplete.

---

## Must-Be (Basic)

Expected by all users. Absence causes dissatisfaction. No delight when present.

| Feature | Current State | Phase |
|---------|--------------|-------|
| Password reset / forgot password | Missing entirely -- users permanently locked out | 3a |
| 404 error page | Missing -- blank pages erode trust | 3c |
| App-level error boundary | Missing -- crashes show white screen | 3c |
| Legal pages (ToS, Privacy) | Missing -- required before billing is live | 3b |
| Real email sender domain | `noreply@yourdomain.com` placeholder -- emails rejected | 3a |
| Navigation to settings pages | Settings are orphaned -- no links anywhere in UI | 3a |
| Working plan limits (board creation) | Code exists but never called | 3a |
| Working plan limits (invitations) | Code exists but never called | 3a |
| UpgradePrompt on limit hit | Component exists but never rendered | 3a |
| Form label accessibility | Missing htmlFor/id pairs -- screen readers fail | 3c |
| Notification settings honesty | Stub shows fake "Enabled" badges | 3a |
| Google OAuth UI | Configured server-side but no buttons in UI | 3b |
| User profile management | Cannot change name, email, or password | 3c |
| Favicon and metadata | No favicon, no OG tags, generic "Kanban Board" title | 3c |

---

## Performance (Linear)

More is better. Satisfaction scales with quality.

| Feature | Current State | Improvement | Phase |
|---------|--------------|-------------|-------|
| Board list metadata | Column count only | Add card count, member count, last activity | 3e |
| Search | Basic title/label match | Full-text search on card details | Backlog |
| Filter capabilities | Label, assignee, due-date | Add "no due date", "unassigned", column filter | Backlog |
| Command palette | 3 actions, client-only search | More actions, server-side search | Backlog |
| Invitation flow | No context shown on accept page | Show board name, inviter, role | 3b |
| Undo/redo | Card delete only | Extend to moves, renames, label changes | Backlog |
| Activity feed | Basic action strings | Richer "what changed" metadata | Backlog |
| Pricing page | Monthly only, no auth-awareness | Yearly toggle, hide CTA for Pro users | 3b |
| VIEWER role | Defined but UI ignores it | Enforce in UI, hide edit controls | 3e |

---

## Attractive (Delighters)

Unexpected features that create excitement. Users do not expect these.

### Already built
- Command palette (Cmd+K) -- searches boards/cards, quick actions
- Keyboard shortcuts with ShortcutsHelp modal (?, n, /, Ctrl+Z)
- Real-time presence indicators (stacked avatars, green online dot)
- Undo/redo concept (limited scope but the pattern exists)
- Dark mode with system preference detection
- Saved filter presets per board

### On roadmap (selected for implementation)
| Feature | Description | Phase |
|---------|-------------|-------|
| Board templates | Pre-built layouts on board creation (Sprint, Roadmap, Bug Tracker) | 3e |
| Card archive | Non-destructive hide with restore, replacing hard delete | 3e |
| Public board sharing | Read-only link without login requirement | 3e |

### Future backlog (not scheduled)
- Bulk card actions (multi-select to label/assign/delete)
- Export board to CSV/JSON
- Card cover images
- Card checklists / sub-tasks
- Rich text / markdown in card details
- Email notification option per type
- Board background customization

---

## Indifferent

Users do not care much either way.

| Feature | Notes |
|---------|-------|
| Email verification on signup | Most SaaS tools skip this early-stage. Credentials auth works without it. |
| Account deletion UI | Required for GDPR compliance eventually, but most users never use it. |
| Cross-browser Playwright tests | Adds test reliability but no user-facing impact. |
| Board background color/image | Some users want it, most ignore it. |
| Per-notification read state | "Mark all read" is usually sufficient. |

---

## Reverse

Features some users would actively dislike if added.

| Feature | Risk |
|---------|------|
| Onboarding tooltip tours | Power users find them patronizing and hard to dismiss. Better: helpful empty states with clear CTAs. |
| Aggressive upgrade modals | Blocking modals on every near-limit action drives free users away. Use inline banners instead. |
| Mandatory email verification | Adds friction at signup for minimal benefit in a Kanban tool. High dropout risk. |
| Weekly digest emails | Unsolicited email is a spam risk. Only add if user explicitly opts in. |
| Social sharing prompts | "Share on Twitter!" feels out of place in a productivity tool. |
