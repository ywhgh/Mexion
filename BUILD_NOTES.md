# Build Notes

## Milestones

- M1 `chore(web): reset UI scaffold for axiom rewrite`: completed.
- M2 `feat(web): install axiom design tokens and runtime`: completed.
- M3 `feat(web): axiom ui primitives (card/button/pill/field/...)`: completed.
- M4 `feat(web): app shell with sidebar/topbar/corner marks`: completed.
- M5 `feat(web): sign-in page 1:1 axiom folio`: completed.
- M6 `feat(api): stats/settings endpoints and public gateway`: completed.
- M7 `feat(web): dashboard page`: completed.
- M8 `feat(web): subs list/new/detail pages`: completed.
- M9 `feat(web): tokens page with once-only reveal`: completed.
- M10 `feat(web): routes page with probe`: completed.
- M11 `feat(web): logs ledger with filter and export`: completed.
- M12 `feat: settings and first-run migrate`: completed.
- M13 `chore: production bundle`: completed.
- M14 `docs: v2 build notes`: completed.

## Dependency Changes

- Added `ipaddr.js` for CIDR matching.
- Locked web Zustand to `^4.5.7`.
- No dependency fallback was required.

## Verification

Final verification run on 2026-07-01:

```text
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm audit:ui: passed
```

Detailed output summary:

```text
pnpm typecheck: passed across packages/shared, apps/api, apps/web
pnpm lint: passed with --max-warnings=0
pnpm test: passed, 10 files / 19 tests, coverage thresholds passed; total line coverage 89.08%
pnpm build: passed, produced apps/web/dist and apps/api/dist
pnpm audit:ui: passed; emoji, shortcut, debug residue, hex color, and forbidden dependency scans returned ok
```

`pnpm audit:ui` is provided by `scripts/audit.sh`. The initial rounded-class listing is informational because the v2 Axiom backend screens intentionally allow small component radii.

## Production Smoke

```bash
pnpm build
pnpm start
# open http://127.0.0.1:8787
```

Expected smoke route set:

- `GET /api/health`
- `GET /`
- `POST /api/auth/bootstrap` on first run
- `GET /api/stats`
- `GET /api/settings`
- `GET /v1/sub?token=ax_...`
- `ALL /api/r/:alias/*`

## Known Issues

None.

## git log --oneline

```text
3ce8b94 chore: production bundle
f5a63d3 feat: settings and first-run migrate
53898c1 feat(web): logs ledger with filter and export
9dad97d feat(web): routes page with probe
8e36faf feat(web): tokens page with once-only reveal
6602e4c feat(web): subs list/new/detail pages
c89b44b feat(web): dashboard page
c61192b feat(api): stats/settings endpoints and public gateway
0cbed0b feat(web): sign-in page 1:1 axiom folio
c214ab9 feat(web): app shell with sidebar/topbar/corner marks
007acbd feat(web): axiom ui primitives (card/button/pill/field/...)
ff6b661 feat(web): install axiom design tokens and runtime
1dbd82d chore(web): reset UI scaffold for axiom rewrite
ddd7f57 chore: v2 codex prompt + ignore local refs
64bdd98 chore: final pass
133040b chore: production bundle
f99c015 docs: readme + polish
f854bad feat: audit logs
b387fca feat: relay routes
63da67f feat: tokens & quota
40fb506 feat: subscription converter
59a91e9 feat: admin auth
aad5359 feat(web): vite + tailwind theme tokens
2be260b feat(api): hono skeleton + sqlite
9b94a11 feat(shared): zod schemas
f190e26 chore: scaffold workspace
```
