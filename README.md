# Nexora SalonOS

A premium SaaS platform for India's beauty and wellness industry — salon discovery, booking, website builder, and business operations in one place.

---

## Forbidden Reference Scan & Code Quality

This project runs an automated, repository-wide scan to prevent legacy or unauthorized symbols (for example the old `public.public_salons_search` RPC) from being accidentally re-introduced.

### What is checked

The current forbidden pattern is:

| Pattern                | Why it is forbidden                                                                                                                  | Use instead    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| `public_salons_search` | The legacy Supabase RPC `public.public_salons_search` no longer exists in the schema and callers now fail with a schema-cache error. | `shops_search` |

Additional patterns can be added to the `FORBIDDEN` array in `scripts/check-forbidden-refs.mjs`.

### Where the scan runs

The scan is enforced at every layer so a bad reference cannot reach production:

1. **Local builds** — `prebuild` and `prebuild:dev` run the scan before `vite build`.
2. **CI on pull requests / pushes to `main`** — `.github/workflows/forbidden-refs.yml` runs `bun run check:forbidden` and fails the PR if anything is found.
3. **Pre-commit hook** — `.husky/pre-commit` blocks the commit locally if a forbidden reference is staged.
4. **Pre-push hook** — `.husky/pre-push` blocks the push before code reaches the remote.
5. **Manual** — the `check:forbidden` npm script can be run at any time.

### How to run the scan manually

```bash
bun run check:forbidden
```

### What happens if the scan fails

- The exact offending file and line number are printed.
- The build / commit / push / CI job is aborted.
- The error message tells you to replace the forbidden reference (for example, use `shops_search` instead of `public_salons_search`).

### Current scan status

```
✅ Forbidden-reference scan passed.
```

Last verified: this commit / CI run. If the scan is failing in your local environment, fix the reported references before committing.
