// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
//
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Lovable Cloud provides these values as managed server environment variables.
// Mirror only the public URL and publishable key into Vite's client build so an
// imported GitHub project works without committing a .env file. Never mirror a
// service-role key or any other backend secret here.
const managedCloudPublicEnv = Object.fromEntries(
  [
    ["import.meta.env.VITE_SUPABASE_URL", process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL],
    [
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY",
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY,
    ],
  ]
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([name, value]) => [name, JSON.stringify(value)]),
);

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: managedCloudPublicEnv,
    // Background: `@tanstack/react-store` imports the *named* export
    //   `useSyncExternalStoreWithSelector` from `use-sync-external-store/shim/with-selector`.
    // The shim file is CJS (`module.exports = require(...)`), so when Vite serves it
    // as raw ESM in dev mode the named import fails with:
    //   "The requested module '.../shim/with-selector.js' does not provide an export
    //    named 'useSyncExternalStoreWithSelector'"
    // That pageerror breaks React 19 hydration in dev (no event handlers attach).
    //
    // Production builds (`npm run build` → Rollup + Nitro cloudflare-module)
    // handle the CJS-to-ESM conversion correctly on their own — the bundler
    // rewrites the CJS named export and the import resolves. We only need
    // esbuild pre-bundling for the dev server, so the optimizeDeps block is
    // optimizeDeps only affects dev dependency pre-bundling; production builds
    // continue to use the regular Rollup/Nitro conversion path.
    optimizeDeps: {
      include: [
        "@tanstack/react-store",
        "use-sync-external-store",
        "use-sync-external-store/shim/with-selector",
      ],
    },
  },
});
