# Mexion Security Optimization Plan

> Machine marker: `MEXION-SECURITY-PLAN:1`
>
> This document is intentionally safe to commit. It must never contain a real
> password, token, cookie, private key, database secret, or live session value.

## 1. Purpose

This plan defines the security invariants for the Mexion overlay, its local
runtime, and the external Sub2API backend. It is both the reconstructed
replacement for the lost local plan and the human-readable source behind the
automated security gates in this repository.

The machine-readable contracts live in:

- `security/security-baseline.json`
- `overlays/sub2api/upstream-baseline.json`
- `docs/UPSTREAM_UPGRADE_SECURITY_OVERLAY.md`

## 2. Recovery Record

The earlier `docs/SECURITY_OPTIMIZATION_PLAN.md` was an untracked local file.
Historical session records show that it contained local plaintext credentials,
was excluded through `.gitignore`, and was later deleted during repository
cleanup. Git history, branches, stash, unreachable blobs, the recycle bin, and
editor history do not contain a complete recoverable copy.

The recoverable requirements were:

1. Remove hardcoded administrator, database, JWT, and generic default secrets.
2. Load local secrets from environment variables or a private local settings file.
3. Scan the complete repository for leaked credentials.
4. Repeat the scan after every upstream upgrade.

This replacement keeps those requirements while removing all secret material.

## 3. Trust Boundaries

| Boundary | Trusted input | Untrusted input | Required control |
| --- | --- | --- | --- |
| Local runtime | Git-tracked scripts and private settings | inherited environment, occupied ports | short-lived secret scope, ACL, loopback assertions |
| Browser HTML | source literals and sanitized render output | settings, announcements, Markdown, custom pages | DOMPurify or an explicit isolated sink contract |
| Preview login | explicit local launcher and loopback backend | Host, Origin, method, arbitrary backend URL | POST-only, dedicated header, loopback/same-origin validation |
| Dependencies | root manifest and frozen lockfile | transitive updates and install scripts | overrides, frozen install, minimal build-script allowlist |
| Upstream sync | pinned Sub2API commit and exported patches | new upstream commits/migrations | manifest validation, patch replay, tests, rollback backup |
| Audit output | rule IDs and file locations | secret values and response bodies | never serialize matched secret text |

## 4. Secret Handling

### SEC-SECRET-001: no tracked secrets

- Real local values may exist only in `.runtime/local-runtime.settings.json`.
- That file and `.runtime/` remain Git-ignored.
- Documentation and examples use placeholders only.
- Audit findings report a rule, path, and line number, never the matched value.

### SEC-SECRET-002: local file ACL

On Windows, secret-bearing files must disable inherited ACLs and allow only:

- the current user
- `SYSTEM`
- local `Administrators`

The runtime launcher applies this policy to the local settings file, temporary
PostgreSQL password file, and external backend `config.yaml`.

### SEC-SECRET-003: process environment scope

- Input variables are copied into PowerShell variables and removed from the
  launcher process before long-lived services start.
- `PGPASSWORD`, bcrypt bootstrap input, and Preview credentials use the smallest
  possible child-process scope and are restored in `finally` blocks.
- The Preview Vite plugin snapshots its two required values once, then deletes
  them from `process.env`.

## 5. Local Runtime

### SEC-RUNTIME-001: loopback-only listeners

PostgreSQL `5432`, Redis `6379`, Sub2API `8080`, and Vite `5515` must listen only
on `127.0.0.1` or `::1`. An already occupied wildcard/non-loopback listener is a
hard failure, even when it is reachable through localhost.

### SEC-RUNTIME-002: authenticated application access

The default launcher starts normal application authentication. Auto-login exists
only in the explicit local Preview launcher. The database invariant is exactly
one active administrator, and the current administrator user ID is `1`.

### SEC-RUNTIME-003: deterministic backend binary

The launcher uses `backend/bin/server`. If it is absent, the build uses the
nearest release tag, `timetzdata`, `CGO_ENABLED=0`, `-trimpath`, and an explicit
`main.Version`. A cold start must not use `go run ./cmd/server`.

### SEC-RUNTIME-004: Redis lifecycle

The currently installed Windows Redis is restricted to loopback and protected
mode. Its legacy version remains a local dependency replacement item: prefer a
currently supported Redis release or maintained compatible distribution during
the next runtime-platform maintenance window. It must never be re-exposed while
that replacement is pending.

## 6. Browser and Preview Controls

### SEC-WEB-001: HTML sinks

Every `v-html` and `srcdoc` sink must appear in
`security/security-baseline.json`. New or changed sinks fail the audit until the
source, sanitizer, and isolation contract are reviewed and recorded.

- Administrator rich text uses `sanitizeRichHtml`.
- Markdown uses DOMPurify after rendering.
- SVG sinks use `sanitizeSvg` or source-owned static path fragments.
- Email template `srcdoc` remains inside an empty sandbox with no referrer.
- Non-empty direct `innerHTML` assignments are forbidden.

### SEC-WEB-002: URL and iframe controls

- General links accept only HTTP(S), with explicit relative URL opt-in.
- Image data URLs accept base64 raster formats only; SVG data URLs are rejected.
- Custom iframes are opt-in, URL-sanitized, sandboxed, no-referrer, and lazy.
- `_blank` anchors receive `noopener noreferrer`.

### SEC-WEB-003: public configuration injection

Development-time public settings inserted into an inline script must escape
`<`, `>`, `&`, U+2028, and U+2029. Raw `JSON.stringify` output cannot be inserted
directly into HTML.

### SEC-WEB-004: Preview session boundary

The local Preview endpoint requires all of the following:

- HTTP `POST`; all other methods return `405` and `Allow: POST`
- `X-Mexion-Preview: 1`
- loopback client socket and loopback Host
- same-origin or absent browser Fetch Metadata
- HTTP loopback backend root URL with no userinfo, path, query, or fragment
- no-store response headers and non-detailed errors

## 7. Dependency Controls

### SEC-DEPS-001: manifest/lockfile parity

`pnpm install --frozen-lockfile` must pass. Security overrides are declared in
the root `package.json`, not only in `pnpm-lock.yaml`.

### SEC-DEPS-002: install-script allowlist

Only packages listed in `pnpm.onlyBuiltDependencies` may execute install scripts.
The current allowlist is `esbuild` and `vue-demi`; `pnpm ignored-builds` must show
no unexpected package.

### SEC-DEPS-003: vulnerability data

The offline deterministic audit is mandatory. Connected CI additionally runs a
registry audit, Gitleaks, and a filesystem/dependency scanner. Failure to reach
an external advisory service is recorded as unavailable evidence, never as a
clean result.

## 8. Upstream Upgrade Controls

Every Sub2API upgrade must:

1. Read and hash-check `docs/UPSTREAM_UPGRADE_SECURITY_OVERLAY.md` and this plan.
2. Validate the pinned baseline and exported patch before changing the worktree.
3. Create a rollback directory and preserve config, current diff, binary, and a
   database dump before migration-capable startup.
4. Remove the current overlay patch, update the clean upstream tree, and replay
   patches in manifest order.
5. Verify previous migration files were not silently removed, then run upstream
   migration/checksum tests.
6. Build a candidate backend before replacing the active binary.
7. Refresh the baseline manifest and patch hash.
8. Run the post-upgrade security audit, frontend checks, backend tests, and
   dynamic loopback/HTTP probes.

The executable procedure is defined in
`docs/UPSTREAM_UPGRADE_SECURITY_OVERLAY.md` and `scripts/upgrade-sub2api.ps1`.

## 9. Automated Acceptance

Run from the repository root:

```powershell
pnpm install --frozen-lockfile
pnpm security:audit
pnpm --filter @mexion/web typecheck
pnpm --filter @mexion/web test
pnpm --filter @mexion/web build
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/upgrade-sub2api.ps1
```

The last command is dry-run by default. Applying an upgrade requires an explicit
`-Apply` switch.

## 10. Completion Criteria

- [x] No deterministic audit finding remains.
- [x] No protected local secret appears outside the private settings file.
- [x] Manifest and lockfile are frozen-install compatible.
- [x] All known HTML/Preview boundaries have tests and machine contracts.
- [x] Runtime ports pass loopback-only assertions after a real cold start.
- [x] The unique active administrator is user ID `1`.
- [x] Upstream patch, baseline, documents, and their hashes agree.
- [ ] Connected CI provides standard scanner evidence.
- [x] Failures are fixed and the complete audit is rerun from the beginning.

### Local closeout evidence (2026-07-28)

- `pnpm security:audit`: 11/11 checks pass, including four loopback listeners
  and the active administrator set `[1]`.
- Frozen install, production dependency audit, root lint, Web typecheck, full
  Vitest, and the production build pass.
- Backend config, security middleware, handler, WebSearch, migrations, and
  migration checksum tests pass; `go vet` passes and `govulncheck` reports no
  reachable vulnerability.
- Upgrade dry-run passes with an unchanged HEAD/status/manifest/patch
  fingerprint for seven patches and sixteen external paths.
- Real-browser Preview verification passes 5/5 routes. Dynamic login, cookie
  refresh, logout, hostile Host/Origin rejection, security headers, and user ID
  `1` checks pass without exposing credentials or session values.
