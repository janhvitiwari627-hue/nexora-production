// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
//
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// The MCP route generator compares Windows and POSIX paths without normalising
// them, which makes local Windows builds fail before Vite can compile the app.
// Generated MCP routes are already committed; keep regeneration enabled in CI
// and hosting (Linux) while allowing the real application build locally.
const mcpPlugins = process.platform === "win32" ? [] : [mcpPlugin()];

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: mcpPlugins,
    optimizeDeps: {
      include: [
        "@tanstack/react-store",
        "use-sync-external-store",
        "use-sync-external-store/shim/with-selector",
      ],
    },
  },
});

