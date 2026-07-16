# Plan: Unified Owner Settings + Clean Customer Settings

## Goal
- `/dashboard/settings` = **sirf customers ke liye** (personal profile, notifications, security). Isme koi shop/owner data nahi.
- Owner ke liye **ek hi jagah** shop details edit karne ki — `/owner/settings` (naya route). Ye page SetupWizard (business basics) + EditShop (full details) ko merge karega.
- Templates (`/site/<slug>`) already `salons` table se data leta hai — jo bhi is unified page se save hoga, wahi templates par dikhega. Data source ek hi rahega, confusion khatam.
- Sign-up flows already alag hain (`/register` customer, `/owner/register-business` owner) — inhe untouched rakhenge, sirf owner form main missing fields (owner_name, tagline, address etc.) already added.

## Changes

### 1. Naya unified page: `src/pages/owner/OwnerSettingsPage.tsx`
- EditShopPage ki full-featured form (name, category, owner_name, tagline, description, phone, whatsapp, email, address, city, location, pincode, logo, cover, upi_id) ko base banayenge.
- SetupWizard ki "business basics" fields already isi form me hai — same salon record par likhta hai.
- Route: `src/routes/owner.settings.tsx` → `/owner/settings`.
- Save ke baad `/owner/welcome` ya same page par rehta hai, toast confirm.

### 2. Delete redundant pages/routes
- `src/pages/owner/EditShopPage.tsx` + `src/routes/owner.edit-shop.tsx`
- `src/pages/owner/SetupWizardPage.tsx` + `src/routes/owner.setup-wizard.tsx`
- Har jagah `/owner/edit-shop` aur `/owner/setup-wizard` ke references ko `/owner/settings` par point karenge (register-business ke success redirect samet).
- OwnerWebsitePage ke "Edit Website Sections" card ke About/Contact/etc. hints bhi `/owner/settings` par point karenge jahan applicable ho.

### 3. Customer `/dashboard/settings`
- Existing `AccountSettingsPage` already customer-only. Verify karenge ki isme kahin bhi owner/shop data nahi hai — agar hai to hataenge.

### 4. Sign-up separation (already done — verify only)
- `/register` = customer signup
- `/owner/register-business` = owner signup (Category/WhatsApp/Address included in previous turn)
- Login page par pehle se hi "Are you a salon owner? Register Your Business" CTA hai (screenshot me dikh raha hai).

## Files touched
- **Create**: `src/pages/owner/OwnerSettingsPage.tsx`, `src/routes/owner.settings.tsx`
- **Delete**: `src/pages/owner/EditShopPage.tsx`, `src/pages/owner/SetupWizardPage.tsx`, `src/routes/owner.edit-shop.tsx`, `src/routes/owner.setup-wizard.tsx`
- **Update refs**: `src/pages/auth/OwnerBusinessRegisterPage.tsx` (redirect), `src/pages/owner/OwnerWebsitePage.tsx`, koi bhi nav/link jo in do routes par jaata hai (grep karke fix karenge).

## Not doing
- Templates ke data-fetch logic ko chhedenge nahi — wo pehle se `salons` table se leta hai jo is unified form se update hota hai.
- Customer dashboard ke doosre pages ko touch nahi karenge.

Confirm karein to implement kar deta hun.
