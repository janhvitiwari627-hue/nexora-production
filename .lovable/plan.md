## Problem

Admin panel ke saare 12 options open toh ho rahe hain, lekin andar ke features properly kaam nahi kar rahe:

- Most pages **mock data** (`useState` + hardcoded arrays) use kar rahe hain — actual website ka data show nahi hota
- Buttons (Approve, Reject, Suspend, Save, Delete) sirf `toast` message dikhate hain, real DB update nahi karte
- Kuch pages incomplete hain (missing filters, empty tabs, no detail views)
- Cross-linking missing hai (e.g. Business row se User profile ya bookings tak jump)

Yaani admin ke paas "full control" abhi sirf UI level pe hai — real backend ke saath wired nahi.

## Scope: 12 admin pages — page by page

Har page pe (a) real Lovable Cloud data pull karna hai, (b) actions ko real DB writes se jodna hai, (c) missing features complete karne hain.

### 1. Dashboard (`/admin/dashboard`)
- Real KPIs: total users, businesses, bookings, revenue, active jobs — DB counts se
- Recent activity feed real bookings/signups/reviews se
- Pending actions live count (approvals waiting)
- Quick-jump links har KPI se relevant page tak

### 2. Users (`/admin/users`)
- Real user list `profiles` + `user_roles` se
- Filters: role, status, city, signup date, search
- Actions: role assign/revoke, suspend, delete, reset password, view bookings
- Detail drawer: profile, roles, activity, membership, reviews

### 3. Businesses (`/admin/businesses`)
- Real salon list; approve/reject pending owner registrations (already partial)
- Suspend/verify/feature toggle — DB write
- View business detail: staff, services, bookings, revenue, reviews
- Bulk actions

### 4. Jobs & Hiring (`/admin/jobs`)
- Real jobs from `jobs` table (currently mock)
- Applications tab wired to real applicants table
- Interview requests + Hire requests real
- Approve/close/flag job, approve/reject applications — DB write
- Candidate profile view

### 5. Partner Applications (`/admin/partner-applications`)
- Pehle se real hai — polish: bulk actions, notes, contact log

### 6. Payments (`/admin/payments`)
- UPI/QR management from DB (not local state)
- Pending payment verifications: approve screenshot → mark booking paid
- Settlements table with real aggregates
- Transactions with filters (date, amount, status, method)
- Refund action

### 7. Advertising (`/admin/advertising`)
- Listing + Video campaigns real from DB
- Create/edit campaign → DB write, upload creative
- Approve pending campaigns, pause/resume, budget edits
- Performance metrics (impressions/clicks) from analytics events

### 8. Rewards (`/admin/rewards`)
- Reward rules CRUD (points per booking, referral bonus, etc.)
- Redemption requests approve/reject
- Reward transactions log
- Manual points adjustment for a user

### 9. Reviews (`/admin/reviews`)
- Real reviews list with filters (rating, business, flagged)
- Approve/reject/hide, delete, reply as admin
- Flagged reviews queue

### 10. Rankings (`/admin/rankings`)
- Featured shops management: pin/unpin, order, expiry
- Sponsored slots CRUD
- Category-wise top shops override

### 11. Analytics (`/admin/analytics`)
- Real charts: revenue trend, bookings/day, user growth, top cities, top categories
- Date range picker, export CSV
- Cohort/funnel basics

### 12. Settings (`/admin/settings`)
- Platform settings (commission %, min payout, feature flags) persisted in a `platform_settings` table
- Contact email, support phone
- Terms/Privacy content editors
- Maintenance mode toggle

## Approach

Because ye 12 pages ka bada kaam hai, main **do phases** mein karunga taaki har turn pe ek clean shippable slice mile:

**Phase 1 — Data wiring (real DB reads):**
Har page ke lists/tables ko real Lovable Cloud queries se jodna. Jo tables missing hain (jaise `platform_settings`, `reward_rules`, `ad_campaigns`) unke migrations create karna with RLS + GRANTs.

**Phase 2 — Action wiring:**
Har button/toggle/form ko real mutation se jodna (RPC ya server function), success/error handling, optimistic updates, react-query invalidation.

Ek turn mein 2–3 pages complete karunga end-to-end, phir agla batch. Aap priority bata sakte hain — konsa page pehle chahiye.

## Confirm before I start

1. **Priority order** — konsa page sabse pehle chahiye? (default order: Jobs → Payments → Businesses → Users → baaki)
2. **Missing tables banane ki permission** — Rewards, Ads, Platform Settings, Rankings ke liye naye tables chahiye. OK?
3. **Kya kuch page abhi mock hi rehne dena hai** (agar aap chahte ho ki sirf UI dikh jaaye MVP ke liye)?
