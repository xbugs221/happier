## Context
`happy` startup performs control-plane bootstrap calls to Happy server (`/v1/machines`, `/v1/sessions`, connect/push endpoints, and health checks). Today these calls rely on default axios behavior and can be affected by ambient proxy environment variables. In some user environments, this yields HTTP 400 responses before session startup, making the CLI unusable.

At the same time, users may intentionally rely on proxy env vars for spawned AI tools (Claude/Codex/Gemini). We must avoid breaking that downstream behavior.

## Goals / Non-Goals
- Goals:
- Make Happy CLI startup robust when standard proxy env vars are present.
- Apply one consistent rule for Happy control-plane HTTP calls.
- Preserve proxy env visibility for spawned AI subprocesses.
- Add regression tests for this startup path.

- Non-Goals:
- Implement full enterprise proxy auth feature set (NTLM/PAC/etc.).
- Redesign WebSocket transport stack.
- Introduce broad new CLI surface unless required to satisfy compatibility.

## Decisions
- Decision: Isolate Happy control-plane REST traffic from ambient proxy env vars.
- Rationale: Startup reliability is the primary requirement. Ambient proxy values are user-shell-global and may be valid for other tools but invalid for Happy server bootstrap. Deterministic direct behavior prevents false 400 startup failures.

- Decision: Keep subprocess environment inheritance unchanged for AI agent execution.
- Rationale: Users often depend on proxy env vars for upstream agent connectivity; stripping them from subprocesses would break existing workflows.

- Decision: Centralize HTTP client construction for Happy control-plane requests.
- Rationale: Avoid per-call drift and ensure future endpoints inherit the same proxy policy and timeout behavior.

## Alternatives considered
- Respect ambient proxy env vars everywhere:
  - Rejected because this is current failure mode and causes startup regressions in mixed-network shells.

- Add only ad-hoc fixes on specific API calls:
  - Rejected because this is error-prone and likely to regress as new endpoints are added.

## Risks / Trade-offs
- Risk: Some users may expect Happy control-plane traffic to also route through corporate proxies.
- Mitigation: Document behavior clearly and leave room for a future explicit Happy-specific proxy option.

- Risk: Partial migration leaves hidden call sites using old behavior.
- Mitigation: Centralize client usage and add tests that exercise all startup-critical endpoints.

## Migration Plan
1. Add shared control-plane HTTP client configuration.
2. Switch bootstrap/reconnection/push/connect endpoints to shared client.
3. Add tests for proxy env presence and startup success path.
4. Update concise docs/help note.

## Open Questions
- Do we need a future explicit env var (for example `HAPPY_SERVER_PROXY`) to opt-in proxying for Happy control-plane traffic in locked-down enterprise networks?
