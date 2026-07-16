# P0 Supabase foundation and mapping

This phase changes the database contract only. It does not redesign UI or
replace any existing application workflow.

## Inventory

Canonical tables already present:

- `profiles`
- `services`
- `website_templates`

Existing application tables used as the source of truth:

- `salons`
- `bookings`
- `salon_owners`
- `partner_shop_mapping`
- `district_business_partners`
- `public_salon_cards`
- `storage.objects` in the `salon-media` bucket

Other legacy domain tables found but not changed in P0 include `shops` and
`businesses`. The current owner marketplace flow is linked to `salons`, so P0
does not move or copy their rows.

## Canonical mapping

| Canonical name      | Existing source                   | P0 implementation       | Write path                     |
| ------------------- | --------------------------------- | ----------------------- | ------------------------------ |
| `profiles`          | `profiles`                        | Existing table          | Existing profile policies      |
| `tenants`           | `salons`                          | `security_invoker` view | Existing salon RPCs/table      |
| `services`          | `services.salon_id`               | Existing table          | Existing owner policies        |
| `customers`         | `profiles`                        | `security_invoker` view | Existing profile policies      |
| `appointments`      | `bookings`                        | `security_invoker` view | Existing booking RPCs/table    |
| `website_templates` | `website_templates`               | Existing table          | Admin policy                   |
| `tenant_websites`   | safe active salon projection      | `security_invoker` view | Existing salon setup RPC/table |
| `media_files`       | `storage.objects` (`salon-media`) | `security_invoker` view | Supabase Storage API           |

The compatibility views are read-only. This avoids dual writes and prevents
canonical and legacy records from drifting apart.

## RLS access plan

| Surface        | Allowed access                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| Owner          | Assigned tenant, its services and appointments, and profiles of customers who booked that tenant                    |
| Public website | Active salon marketing columns, active services/templates, published website projection and public salon media      |
| Customer app   | Own profile and own appointments; public marketplace data                                                           |
| Growth partner | Active tenants explicitly assigned through `partner_shop_mapping`; no customer, appointment or owner-finance access |
| Admin          | Existing admin/super-admin policies across the mapped source tables                                                 |

Every compatibility view uses `security_invoker = true`, so the source table
RLS policies are applied to the caller. Grants are reset and then added
explicitly for `anon` and `authenticated`.

## Credentials

The browser client reads only the Lovable-managed Supabase URL and publishable
key. P0 does not add, request or commit a service-role credential.

## Deferred after P0

- Apply the migration through the Lovable Cloud migration runner and regenerate
  `src/integrations/supabase/types.ts` from the connected database.
- Confirm live policy behavior with one owner, customer, partner and admin test
  identity. This requires normal user sessions, not a frontend service-role key.
- Decide in the appointment module whether bookings should gain a stable
  `service_id`; the current schema stores `service_name` as a snapshot.
- Decide module-by-module whether later write APIs should adopt canonical names.
  Until then, the existing RPCs remain the single write path.
