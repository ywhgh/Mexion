# Mexion Agent Rules

For every Sub2API upgrade or backend baseline change:

1. Read `docs/SECURITY_OPTIMIZATION_PLAN.md` and
   `docs/UPSTREAM_UPGRADE_SECURITY_OVERLAY.md` before editing the external tree.
2. Treat `overlays/sub2api/upstream-baseline.json` as the machine authority for
   the pinned commit, migration inventory, ordered patches, and document hashes.
3. Run `pnpm security:audit -- --mode pre-upgrade` before mutation and
   `pnpm security:audit -- --mode post-upgrade` after patch replay/build.
4. Use `scripts/upgrade-sub2api.ps1`; it is dry-run unless `-Apply` is explicit.
5. Never commit local settings, database dumps, config secrets, tokens, cookies,
   or generated session data.
6. Never resolve a patch conflict by silently dropping the Mexion invariant.
