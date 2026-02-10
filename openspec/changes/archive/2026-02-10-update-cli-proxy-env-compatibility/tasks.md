## 1. Implementation
- [x] 1.1 Add a shared Happy control-plane HTTP client configuration that enforces deterministic proxy behavior for CLI↔Happy-server REST calls.
- [x] 1.2 Migrate bootstrap and reconnection health-check call sites to that shared configuration (`getOrCreateMachine`, `getOrCreateSession`, vendor token endpoints, push-token endpoints, offline health checks).
- [x] 1.3 Ensure agent subprocess execution (`claude`/`codex`/`gemini`) continues inheriting ambient proxy variables unless explicitly overridden by existing options.
- [x] 1.4 Add/extend tests that reproduce proxy env presence (`http_proxy`, `https_proxy`, `all_proxy` and uppercase forms) and verify startup no longer fails with HTTP 400 due to ambient proxy settings.
- [x] 1.5 Add concise user-facing troubleshooting note (CLI docs/help) clarifying control-plane vs spawned-agent proxy behavior.

## 2. Validation
- [x] 2.1 Run `yarn workspace happy-coder test`.
- [x] 2.2 Run targeted tests for API/bootstrap + reconnection paths under proxy env fixtures.
- [x] 2.3 Manually smoke test: start `happy` with non-empty proxy env vars and verify machine/session bootstrap succeeds when server is reachable.
