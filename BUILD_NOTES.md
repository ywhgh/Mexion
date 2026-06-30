# Build Notes

## Decisions

- Vitest is pinned to `^2.1.9` so the test runner remains peer-compatible with the required Vite 5 stack.
- `pnpm.onlyBuiltDependencies` allows `better-sqlite3` and `esbuild` native build scripts so SQLite and Vite work without interactive approval.
- The API serves the production web bundle from `apps/web/dist` through Hono static middleware when the bundle exists.
- Token plaintext is returned only once on create; persistent storage keeps bcrypt hash plus the first 8-character prefix.

## Final Verification Log

- `pnpm install`: passed, lockfile up to date, no peer warnings.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed with `--max-warnings=0`.
- `pnpm test`: passed, 10 files / 24 tests, coverage lines 69.53%.
- `pnpm build`: passed, produced `apps/api/dist` and `apps/web/dist`.
- Production smoke: passed on `http://127.0.0.1:8787` with a fresh SQLite DB. Root `pnpm start` smoke also passed.
  - `GET /api/health` returned ok.
  - `GET /` served the built web shell.
  - `bootstrap -> sign-out -> sign-in` passed.
  - Created a Clash Meta subscription and pulled `/v1/sub?token=...` with real config text.
  - Created a 1 GB Token, pulled subscription with it, and found its prefix in `/api/logs`.
  - Created `/api/r/demo/* -> https://httpbin.org/anything/*`, requested `/api/r/demo/final-smoke`, and found the route log.
- UI grep checks:
  - `rounded-*` / `shadow-*`: none in `apps/web/src` except allowed none pattern.
  - `transition-all`: none.
  - Color literals: only approved Axion tokens in source and Tailwind config.
  - Banned dependency families: none.
  - Shortcut guard: no `as any`, `@ts-ignore`, or `--no-verify` in app/package/script sources.

## Known Issues

None.


