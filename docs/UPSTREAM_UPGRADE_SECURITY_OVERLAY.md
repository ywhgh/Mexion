# Mexion Upstream Upgrade Security Overlay

> Machine marker: `MEXION-UPGRADE-OVERLAY:1`
>
> Mandatory read: the upgrade entrypoint must load this complete file and reject
> execution when its SHA-256 does not match the baseline manifest.

## 1. Authority and Scope

Mexion keeps the Sub2API application/API implementation upstream-owned. Local
changes are maintained as an explicit overlay, not as undocumented edits in the
external worktree.

The authoritative current commit, release tag, migration inventory, ordered
patch list, and document hashes are in:

`overlays/sub2api/upstream-baseline.json`

Do not copy those values into startup scripts. Read the manifest.

## 2. Ownership Boundary

| Area                                                    | Owner             | Upgrade rule                     |
| ------------------------------------------------------- | ----------------- | -------------------------------- |
| Sub2API API, routes, models, migrations, permissions    | upstream          | sync from pinned upstream commit |
| `websearch_config.go` missing optional setting behavior | Mexion patch      | replay and test after every sync |
| secure config defaults and explicit database password   | Mexion patch      | replay until upstream equivalent |
| fail-closed CSP and baseline HTTP security headers      | Mexion patch      | replay until upstream equivalent |
| UI refresh token HttpOnly cookie boundary               | Mexion patch      | replay with frontend auth contract |
| Mexion skin, tokens, layout, motion                     | Mexion repository | preserve during frontend merge   |
| local settings, database, logs, backup                  | local runtime     | never commit or overwrite        |
| startup/security audit/upgrade tooling                  | Mexion repository | must pass before and after sync  |

## 3. Required Preflight

The upgrade script must fail before mutation unless all checks pass:

1. Both security documents exist, contain their machine markers, and match the
   SHA-256 values in the manifest.
2. Every patch exists and matches its SHA-256.
3. The external Git remote matches the expected upstream repository.
4. `HEAD` matches the manifest baseline commit.
5. Dirty paths are exactly the declared overlay paths.
6. Every declared patch can be reverse-applied from the current tree.
7. `pnpm security:audit -- --mode pre-upgrade` passes.
8. Required local settings and backup tools are available for apply mode.

## 4. Dry Run

Dry-run is the default and must not checkout, reset, apply patches, replace
binaries, or start migrations.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/upgrade-sub2api.ps1
```

Use `-TargetRef` to inspect a specific release/ref. Network fetch and mutation
occur only with explicit `-Apply`.

## 5. Apply Transaction

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/upgrade-sub2api.ps1 `
  -TargetRef TARGET_REF `
  -Apply
```

`-Apply` updates the governed source, patches, manifest, tests, and candidate
binary. Runtime activation is a separate explicit `-Activate` switch. This
keeps source upgrade verification ahead of migration-capable deployment.

Apply mode performs these ordered operations:

1. Repeat preflight and create `backups/upstream-upgrade-TIMESTAMP/`.
2. Save the current Git diff, manifest, patch files, backend config, active
   binary, migration inventory, and PostgreSQL dump.
3. Reverse patches in descending order and require a clean upstream tree.
4. Fetch tags and resolve `TARGET_REF` to an immutable commit.
5. Detach at that commit and verify no baseline migration file disappeared.
6. Check and replay patches in ascending order. Any context conflict stops for
   manual review; the script does not auto-merge a security invariant.
7. Run focused Go tests for service and migration/checksum behavior.
8. Build `backend/bin/server.next` with the resolved release version.
9. Refresh the exported patch and machine manifest.
10. Run the full post-upgrade security audit before optional `-Activate` binary replacement.

The database dump is mandatory by default because starting a newer backend may
apply irreversible migrations. Skipping it requires an explicit switch and must
be recorded in the upgrade report.

To apply and activate in one explicitly requested transaction:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/upgrade-sub2api.ps1 `
  -TargetRef TARGET_REF `
  -Apply `
  -Activate
```

## 6. Patch Replay Contract

Patches are applied in the numeric `order` field from the baseline manifest.
Each patch entry declares:

- path and SHA-256
- expected dirty paths
- purpose and required verification

A context conflict is not auto-resolved. Stop, inspect upstream behavior, update
the patch deliberately, and rerun preflight. Do not drop a failed patch merely
to make the build pass.

## 7. Migration Parity

Sub2API legitimately contains multiple migration files with the same numeric
prefix, so filename-prefix uniqueness is not a valid gate. The upgrade gate is:

- no file from the previous migration inventory may disappear without an
  explicit reviewed exception
- upstream migration runner/checksum tests must pass
- a database backup must exist before migration-capable startup

## 8. Build and Runtime Gate

The candidate backend is built with:

- `CGO_ENABLED=0`
- build tag `timetzdata`
- `-trimpath`
- explicit `main.Version` derived from a release tag/ref

After binary activation, verify:

- PostgreSQL, Redis, backend, and Vite are loopback-only
- backend `/health` is 200
- normal `/login` is 200 and has the required security headers
- Preview rejects GET, missing header, hostile Host, and hostile Origin
- a trusted Preview session reports user ID `1` without logging its tokens

## 9. Rollback

Before backend activation, rollback is source-only: restore the saved commit and
reapply the saved patches. After activation or migration, stop services, restore
the saved binary/config, and restore the PostgreSQL dump before restarting the
old backend. Never run an old binary against a partially upgraded schema.

## 10. Completion Evidence

An upgrade is complete only when the repository contains:

- refreshed `overlays/sub2api/upstream-baseline.json`
- refreshed exported patch(es)
- machine-readable `logs/security-audit-latest.json`
- passing frozen install, typecheck, tests, build, Go tests, and dynamic probes
- a short report recording target commit, release, backup path, and residual risk
