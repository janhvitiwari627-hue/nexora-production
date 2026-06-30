## Goal
Stop expanding scope. Lock V1 to the four items your own "Final Recommendation" lists, ship them to production-ready quality, and pilot in Jaipur before touching anything else on the gap list.

## In Scope (V1 — ship these only)

1. **Supabase schema + RLS hardening** (already ~90% done)
   - Audit existing tables against SSOT; confirm RLS on every public table.
   - Add only the 3 truly-blocking operational tables: `audit_events`, `system_settings`, `notification_queue`. Everything else on the "missing modules" list is deferred.
   - Re-run security scanner; fix any findings.

2. **30-Minute White-Label Website Builder** (wizard already shipped last turn)
   - Lock template gallery to the 3 approved templates: Luxury Salon (royal-luxe), Modern Professional (modern-salon), Spa & Wellness (professional-beauty).
   - Verify: content persists across template switches, live preview works, mobile-first, "Powered by Nexora" only in footer, Nexora QR block present, no owner QR anywhere.
   - Add a publish checklist gate (re-use `markSalonSetupComplete`).

3. **60-Second Booking Flow** (already wired)
   - Verify Search → Business → Service → Staff → Date → Time → Confirm → WhatsApp end-to-end on mobile.
   - Add: booking slot buffer (configurable, default 0), 90-day max advance window (already enforced as 30; bump to 90), min cancellation window (24h already), review eligibility = completed bookings only.
   - WhatsApp deep link confirmation after booking.

4. **Nexora QR + Daily 10 PM Settlement**
   - Confirm only Nexora QR is rendered on public sites / booking confirmation (remove any owner-QR paths).
   - Schedule `process_pending_settlements` via pg_cron at 22:00 IST daily.
   - Owner wallet shows daily settlement entries.

## Explicitly Deferred (NOT in V1)

Everything else in your message:
- Legal/help/status/press pages (stub with placeholder routes only if missing)
- 16 operational DB modules beyond the 3 above
- Owner Referral 2%/8% split, District Partner 10/5/2% commission ladder, Distributor portal expansion, Super Admin fraud/AI suite
- AI Marketing / Posters / Content / Revenue Advisor / Return Manager
- 30 enterprise doc volumes
- Search ranking algorithm, idempotency standard, correlation IDs, webhook management API, feature flags, support tickets, media processing jobs

These re-enter scope **after** the Jaipur pilot validates V1.

## Execution Order
1. Run security scan → fix blockers (1 turn)
2. Template gallery audit + publish-checklist gate (1 turn)
3. Booking flow rule tweaks (buffer, 90-day window, review gating) (1 turn)
4. pg_cron 22:00 IST settlement job + owner wallet verification (1 turn)
5. Add `audit_events`, `system_settings`, `notification_queue` tables with RLS (1 migration)
6. End-to-end Playwright smoke on mobile viewport, then publish "Nexora SalonOS V1 — Jaipur Pilot"

## Confirm before I start
Reply **"go V1"** to proceed exactly as above, or tell me which of the deferred items must move into V1 (each one added pushes pilot launch).
