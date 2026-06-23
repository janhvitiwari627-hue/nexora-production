ns# Nexora SalonOS — Premium SaaS Redesign

Reposition the platform from "salon booking site" to **India's Beauty Industry Operating System**. The redesign is a visual + structural skin pass on the existing app — no feature removal, no backend changes.

## 1. Design tokens (src/styles.css)

Replace the current public-site palette with the Nexora system. All values exposed as semantic tokens so every component picks them up automatically.

- **Primary** Deep Indigo `#3D2BAA`
- **Secondary** Premium Purple `#7C5CFF`
- **Accent** Electric Blue `#2D6BFF`
- **Background** Soft Light Grey `#F6F7FB`
- **Surface** Pure White `#FFFFFF`
- **Text** Dark Navy `#0B1437`
- **Muted text** `#5B6478`
- **Border** Soft Neutral `#E5E8F0`
- **Gradient mesh** indigo → purple → electric blue, used only in hero + premium cards
- **Shadow** layered, low-opacity (`0 1px 2px rgba(11,20,55,.04), 0 8px 24px rgba(11,20,55,.06)`) — Stripe style
- **Radius** `14px` cards, `12px` inputs/buttons, `20px` hero panels
- **Font** Inter only (already loaded). Display sizes 56/40/32 with tight tracking for Apple-style headlines.
- Remove pink/yellow/orange/dark-black surfaces from the public theme.

## 2. Global shell

- **PublicHeader**: glass effect (white/70 + backdrop blur), sticky, thin border-bottom. Left logo + "Nexora", center nav (Explore / Membership / For Shop Owners), right search icon, notifications, Login, Register, Avatar. Keep existing Job Portal + Partner Growth items inside an "Explore" mega-menu so nav stays clean.
- **PublicFooter**: minimal Stripe-style multi-column, dark navy on soft grey, with tagline "Salon Ja Rahe Ho? Nexora Kiya Kya?".
- **MobileMenuOverlay**: same nav, full-screen, large tap targets.

## 3. Home page (src/pages/public/HomePage.tsx and section components)

Restructure into clearly spaced sections with generous whitespace:

1. **Hero** — split layout. Left: H1 "Book Jaipur's Best Beauty Services", subhead, two CTAs (Explore / Become a Partner). Right: layered visual composition (gradient mesh + Jaipur skyline silhouette + a beauty lifestyle photo card + a floating booking-confirmation card). Background: subtle gradient mesh.
2. **Smart Search** — large floating pill search bar overlapping hero bottom. Filters chips below (Near Me, Open Now, Top Rated, Price, Male, Female, Unisex).
3. **Categories** — large cards (Salon, Parlour, Spa, Tattoo, Massage, Nail, Makeup, Bridal) with premium line icons, hover-lift.
4. **Shop Listings** — Airbnb-style: big rounded image, rating, distance, services pills, verified badge, Book Now.
5. **Membership** — Apple product-showcase: 3 metallic cards (Silver/Gold/Platinum) with gradient + glass reflection, benefits list, CTA.
6. **Offers** — Stripe promotional cards (no flashing banners).
7. **White Label Builder** — Apple horizontal scroll of template previews (Royal Luxe / Urban Pro / Beauty Blossom) with "Choose → Customize → Publish" flow.
8. **App Download** — phone mockup with real app screen, benefits list, store badges.
9. **Trust strip** — partner brand logos + investor-grade stats (bookings, shops, cities).

Each existing section component gets restyled (no logic touched): `HeroSection`, `SmartSearchCard`, `CategorySection`, `NearbyShopsSection`, `TopRatedShopsSection`, `MembershipSection`, `OffersSection`, `AppDownloadSection`, `PortalSection`.

## 4. Shop owner dashboard (Stripe-inspired)

Restyle `src/pages/owner/*` and `src/routes/owner.*`:
- KPI cards: large number, label, delta chip, sparkline. Soft white surface, thin border, layered shadow.
- Tables: zebra-free, generous row padding, subtle dividers.
- Charts: rounded, single-accent (indigo), clean axis.
- Sidebar nav: white, icon + label, active state = indigo pill.

## 5. Admin panel

Restyle `src/pages/admin/*`:
- Left sidebar SaaS control center (Analytics, Search, Reports, Settings, Payments, Memberships, Rewards, Advertisements).
- Same KPI + table + chart language as owner dashboard.

## 6. White-label templates

Templates already exist (Royal Luxe / Urban Pro / Beauty Blossom). No changes to feature parity. Only ensure the showcase page on the public site uses the new Apple-style horizontal scroll presentation.

## 7. Animations

Add reusable utilities: `hover-lift`, `fade-in-up`, `soft-scale`. Apply sparingly to cards and CTAs. No parallax, no heavy motion.

## 8. Copy + tagline

- Inject tagline "Salon Ja Rahe Ho? Nexora Kiya Kya?" in hero subhead area and footer.
- Replace headlines with the short powerful statements listed in the brief.

## Out of scope

- No DB / server-fn / auth changes.
- No new routes (Job Portal & Partner Growth already exist).
- White-label template internals untouched — only the public showcase styling.
- No replacement of existing images with stock photos in this pass; reuse current assets and only swap where placeholders exist.

## Technical notes

- All color/shadow/radius edits land in `src/styles.css` via `@theme inline` tokens + utility classes, so shadcn components inherit automatically.
- Section restyles are className-only edits in the existing components — no prop or data-shape changes.
- Inter is already loaded via `<link>` in `__root.tsx`; no font work needed.
- Verify after each major section with a Playwright screenshot at 1280×1800 on `/`, `/owner`, `/admin/dashboard`.

## Rollout order

1. Tokens in `src/styles.css` + header/footer.
2. Home page sections top-to-bottom.
3. Owner dashboard.
4. Admin panel.
5. Polish pass + screenshots.
