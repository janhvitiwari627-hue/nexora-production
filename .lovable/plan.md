Aapki uploaded file ke hisaab se pura **form-based live template editor** banana hai. Ye ek bada system hai, isliye main ise **phases** me build karunga — har phase ke baad aap test kar sakte ho.

## Architecture (spec ke according)

Template ko HTML ki tarah edit nahi karenge. Har section ek **structured JSON component** hoga:
```json
{ "type": "hero", "heading": "...", "imageUrl": "...", "visible": true, "order": 1 }
```
Website is JSON se render hogi. Editor sirf JSON badlega → template kabhi tootega nahi.

## Database Schema (nayi tables)

```
website_templates      – original templates (read-only master copies)
user_websites          – har user ki apni website (draft + published)
website_sections       – hero/services/gallery/about/contact… har section ka JSON content, order, visible flag
website_theme          – colors, fonts, button styles per user_website
website_versions       – snapshots for undo / version history
media_library          – uploaded images/logos per user
```
RLS: har user sirf apni `user_websites` aur uske children edit kar sake.

## Build Order (spec ke exact order me)

**Phase 1 — Schema + Template Copy System**
- Migration: upar wali tables + RLS + GRANTs
- "Use This Template" button → template ka snapshot user ke account me copy
- Har section JSON structure ke saath insert ho

**Phase 2 — Section-based Editor Shell**
- `/owner/website/edit` route: left = form controls, right = live iframe preview
- Section list sidebar (Hero, About, Services, Gallery, Staff, Packages, Offers, Rate Card, Membership, Blog, Contact)
- Har section ke liye alag form panel

**Phase 3 — Text & Image Editors**
- Har field (heading, description, button text/link) form input
- Image upload (file picker + optional URL) — media_library me store
- Debounced live preview via postMessage (jaise abhi hai)

**Phase 4 — Theme Editor**
- Colors (primary/secondary/accent/bg), fonts, button style
- Live CSS variable injection in preview

**Phase 5 — Section Show/Hide + Reorder**
- Toggle switch per section (`visible`)
- Drag-to-reorder (dnd-kit) → `order` field update

**Phase 6 — Draft / Publish / Undo**
- Save Draft (auto, jo abhi partially hai)
- Publish button → draft → published copy
- Undo: last N versions se restore

**Phase 7 — Desktop/Mobile Preview Toggle**
- Iframe width switch

**Phase 8 — Domain + Version History UI** (last)

## Renderer Refactor (important)

Abhi `WhiteLabelWebsitePage` har section ko hardcoded tables (`shop`, `services`, `staff`…) se read karta hai. Isko refactor karunga taaki wo **`website_sections` JSON array** ko iterate karke render kare. Isse:
- Section reorder / hide automatically work karega
- Naye section types easily add honge
- Editor aur renderer dono ek hi schema use karenge

Existing data (shop/services/staff tables) ko migration me `website_sections` JSON me convert kar denge — kuch bhi lose nahi hoga.

## Aaj kya start karun?

Main **Phase 1 (schema + template copy)** se start karunga. Ye foundation hai — iske bina baaki sab patchwork hoga (jaisa abhi ho raha hai). Approve karo to migration likhta hun.
