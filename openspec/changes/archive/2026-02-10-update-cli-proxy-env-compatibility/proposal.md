# Change: Make CLI startup resilient to proxy environment variables

## Why
Users who set standard proxy environment variables (`http_proxy`, `https_proxy`, `all_proxy`, and uppercase variants) can hit an HTTP 400 during Happy bootstrap, which prevents `happy` from starting. This breaks a common shell/network setup and blocks core product usage.

## What Changes
- Define explicit proxy-handling behavior for Happy CLI control-plane networking (machine/session bootstrap and health checks).
- Ensure ambient proxy environment variables do not cause startup failure for Happy control-plane requests.
- Keep proxy environment variables available to spawned AI agent processes (Claude/Codex/Gemini) so user proxy workflows still work for downstream tools.
- Add validation tests for proxy-variable startup compatibility and regression coverage for bootstrap API calls.

## Impact
- Affected specs: `cli-networking`
- Affected code:
  - `packages/happy-cli/src/api/api.ts`
  - `packages/happy-cli/src/utils/serverConnectionErrors.ts`
  - `packages/happy-cli/src/api/pushNotifications.ts`
  - `packages/happy-cli/src/claude/sdk/query.ts` (behavior verification only; no proxy stripping for agent process env)
  - `packages/happy-cli/src/index.ts` / startup flow tests
