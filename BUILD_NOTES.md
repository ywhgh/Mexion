# Build Notes

## Relay Implementation Status

Completed on 2026-07-02 for `D:\Mexion`.

### Milestones

- M1 `feat(security): ssrf protection, log redaction, body limits, secret encryption`: completed.
- M2 `feat(db): extend schema for users channels groups billing relay`: completed.
- M3 `feat(auth): multi-user registration login session checkin`: completed.
- M4 `feat(auth): user api key management`: completed.
- M5 `feat(channels): groups channels model aliases status api`: completed.
- M6 `feat(billing): precharge settle rollback billing with subscription quota`: completed.
- M7 `feat(gateway): ai relay with precharge settle multi-provider`: completed.
- M8 `feat(web): connect frontend to real api remove mock runtime`: completed.

### Environment Variables

- `MEXION_SECRET_KEY`: 32-byte hex key for AES-256-GCM channel secret encryption.
- `MEXION_JWT_SECRET`: JWT signing secret for administrator sessions.
- `MEXION_DB_PATH`: optional SQLite path, default `data/mexion.db`.
- `PORT`: optional server port, default `8787`.
- `HOST`: optional bind host, default `127.0.0.1`.

### Verification 2026-07-02

```text
pnpm install: passed, lockfile up to date
pnpm typecheck: passed across apps/web, apps/api, packages/shared
pnpm lint: passed with --max-warnings=0
pnpm test: passed, 17 files / 50 tests
coverage: Statements 70.66%, Lines 76.82%, Functions 65.57%, Branches 56.11%
pnpm build: passed, produced apps/web/dist and apps/api/dist
pnpm audit --json: 0 critical, 0 high, 0 moderate, 0 low
```

### Security Notes

- All generic relay egress uses `safeFetch` with scheme validation, DNS/IP checks and redirect revalidation.
- Loopback, RFC1918, link-local and metadata IP ranges are blocked.
- Channel secrets are stored in `channel_secrets.encrypted_value` via AES-256-GCM.
- Request logs store metadata only; Authorization, API keys and request/response bodies are not persisted.
- Query-string API keys are rejected by the gateway.

### Known Limits

- Demo subscription activation does not integrate a payment provider.
- Gateway currently aggregates upstream responses before returning; protocol routes are compatible, but token-level streaming metrics can be enhanced later.
