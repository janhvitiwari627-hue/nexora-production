# PWA Home-Screen Icon Refresh — Test Plan

Verifies that after a redeploy which changes the Nexora logo, returning
visitors and freshly-installed PWAs pick up the new home-screen icon
without any manual cache clear.

## Refresh strategy (what makes this safe)

1. Icon URLs are **content-addressed** on the Lovable CDN:
   `/__l5e/assets-v1/<uuid>/<filename>`. A re-uploaded logo gets a new
   UUID, so the URL itself changes — no browser or SW cache can serve
   the old bytes under the new URL.
2. `/manifest.webmanifest` is served with `cache-control: no-cache`,
   so browsers always revalidate and see the new icon URLs on the next
   visit.
3. `public/sw.js` is a kill-switch worker: it does not intercept
   `fetch`, deletes legacy `nexora-*` caches on activate, and
   unregisters itself. It cannot cache icons or manifests.

## Automated checks

Run all with `bunx playwright test` (dev server on `:8080`).

| Test file | What it proves |
| --- | --- |
| `e2e/pwa-icon-refresh.spec.ts` | Favicon `<link>`s and every manifest icon use content-addressed CDN URLs, resolve 200, are `immutable`; manifest itself revalidates; SW does not rewrite icon headers; a tampered UUID does not resolve. |
| `e2e/pwa-icon-redeploy.spec.ts` | Simulates a redeploy by intercepting `/manifest.webmanifest` and rewriting every icon UUID. Confirms the browser re-fetches the manifest, receives the new UUIDs, and never surfaces the old UUID after the "deploy". |
| `e2e/pwa-published.spec.ts` | Sanity: production build serves the manifest + kill-switch SW. |

## Manual smoke test (post-deploy)

1. Open the published site in Chrome on Android, "Add to Home Screen".
2. Confirm the launcher icon matches the new logo.
3. Re-upload a different logo in Lovable, redeploy.
4. Reopen the site in Chrome (do **not** uninstall). Chrome should
   fetch the new manifest within a visit or two and update the shortcut
   icon on next install. Existing installs keep the old icon until the
   user reinstalls — this is an OS-level constraint, not a caching bug.
5. iOS Safari caches `apple-touch-icon` at install time; reinstall
   required to refresh. Documented, not a regression.

## What is NOT covered (by design)

- Actual OS home-screen icon repaint after install — not scriptable
  from a headless browser; verified manually.
- Cross-origin CDN cache eviction — not needed because the URL changes.
