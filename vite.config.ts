// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Pre-bundle `use-sync-external-store` and its dependents as ESM.
    //
    // Background: `@tanstack/react-store` imports the *named* export
    //   `useSyncExternalStoreWithSelector` from `use-sync-external-store/shim/with-selector`.
    // The shim file is CJS (`module.exports = require(...)`), so when Vite serves it
    // as raw ESM the named import fails with:
    //   "The requested module '/node_modules/use-sync-external-store/shim/with-selector.js'
    //    does not provide an export named 'useSyncExternalStoreWithSelector'"
    // That pageerror breaks React 19 hydration for the entire app in dev mode
    // (no event handlers attach, no state updates, etc.).
    //
    // Listing the shim and its dependents in `optimizeDeps.include` forces Vite to
    // pre-bundle them through esbuild, which correctly rewrites the CJS named
    // export so the import resolves at runtime. The TanStack Start preset only
    // pre-bundles React core, which is why this hole exists.
    optimizeDeps: {
      include: [
        "@tanstack/react-store",
        "use-sync-external-store",
        "use-sync-external-store/shim/with-selector",
      ],
    },
  },
});
