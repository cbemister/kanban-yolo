# Phase 3b -- Core Pages

**Status:** Not started
**Priority:** Must complete before publicizing the product
**Depends on:** Phase 3a (AppHeader and navigation must exist)

## Goal

Build the public-facing and auth-completion pages needed before marketing the product: a full marketing landing page, Google OAuth UI, legal pages, settings layout, and pricing improvements.

## Items

### 1. Marketing landing page
Replace the current auth-redirect at `/` with a full conversion-focused marketing page for unauthenticated visitors. Authenticated users still redirect to `/boards`.
- Rewrite: `src/app/page.tsx` (server component that checks auth and branches)
- New components in `src/components/landing/`:
  - `LandingHeader.tsx` -- logo, "Sign in" link, "Start free" CTA
  - `HeroSection.tsx` -- headline, subheadline, CTA buttons
  - `FeaturesSection.tsx` -- 4-6 feature cards (drag-drop, real-time, labels, collaboration)
  - `PricingTeaser.tsx` -- condensed free/pro comparison, link to `/pricing`
  - `LandingFooter.tsx` -- links to /pricing, /login, /signup, /terms, /privacy
- Reuse: existing color scheme tokens (#ecad0a accent, #209dd7 blue, #753991 purple, #032147 navy)

### 2. Settings layout with sidebar nav
Create a shared layout for all `/settings/*` pages with sidebar navigation.
- New: `src/app/settings/layout.tsx` (applies AppHeader + sidebar automatically)
- New: `src/components/SettingsLayout.tsx` (sidebar nav: Profile, Billing, Notifications)
- Reuse: `AppHeader` from Phase 3a

### 3. Google OAuth buttons on login and signup
The Google OAuth provider is fully configured in NextAuth but has zero UI entry points. Add "Sign in with Google" buttons.
- Files: `src/app/login/page.tsx`, `src/app/signup/page.tsx`
- Call: `signIn("google")` from `next-auth/react` (already imported in login)

### 4. Legal pages (Terms of Service + Privacy Policy)
Static server-rendered pages with placeholder content structure. Real legal copy must be written before billing goes live.
- New: `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`
- Reuse: landing page styling for consistent look

### 5. Legal links on signup page
Add ToS and Privacy Policy links to the signup form (checkbox or footer text).
- File: `src/app/signup/page.tsx`

### 6. Invitation context
Currently the invitation page shows "You have been invited to collaborate on a Kanban board" with zero specifics. Fetch and display the board name, inviter name, and role.
- New API: `GET /api/invitations/[token]/route.ts` (return board name, inviter, role, expiry)
- Update: `src/app/invitations/[token]/page.tsx` (fetch context on mount, display it)
- Reuse: existing invitation token lookup pattern from accept/decline routes

### 7. Yearly billing toggle on pricing page
The env vars `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID` and `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID` both exist, but the UI only shows monthly. Add a toggle.
- File: `src/app/pricing/page.tsx`
- Add: client-side toggle state, switch between price IDs, show annual savings

### 8. Auth-aware pricing page
Pro subscribers currently see the same "Upgrade to Pro" CTA as free users. Check subscription status and adjust the CTA accordingly.
- File: `src/app/pricing/page.tsx` (convert to client component or use server session check)
- Reuse: `GET /api/billing/subscription` endpoint

## Dependencies

- Phase 3a must be complete: AppHeader (3a.10) is reused by the settings layout
- Item 2 (settings layout) should be built before Phase 3c profile page
- Items 7-8 (pricing improvements) depend on the Stripe env vars being correct (3a.4)

## Parallel Development Opportunities

- Item 1 (landing page) is the largest item and is fully independent of everything else
- Items 3-5 (auth pages + legal) can be done together in one pass
- Items 7-8 (pricing) can be done together
- Item 6 (invitation context) is independent
- Item 2 (settings layout) is independent
- Maximum parallelism: 4 independent work streams (landing, auth pages, pricing, invitation)
