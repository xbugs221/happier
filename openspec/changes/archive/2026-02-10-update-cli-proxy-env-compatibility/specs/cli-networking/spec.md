## ADDED Requirements

### Requirement: CLI Startup Must Tolerate Ambient Proxy Environment Variables
The Happy CLI SHALL complete startup bootstrap without failing solely because any standard proxy environment variable is set (`http_proxy`, `https_proxy`, `all_proxy`, `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`).

#### Scenario: Proxy variables are present during startup
- **GIVEN** a user shell has non-empty proxy environment variables
- **AND** Happy server is otherwise reachable from the host
- **WHEN** the user runs `happy` (or `happy codex` / `happy gemini`)
- **THEN** machine and session bootstrap SHALL not fail with HTTP 400 caused by ambient proxy settings

### Requirement: Happy Control-Plane REST Calls Use Deterministic Proxy Behavior
The Happy CLI SHALL use a centralized HTTP client policy for control-plane REST calls that does not implicitly inherit ambient proxy environment variables.

#### Scenario: Ambient proxy is misconfigured for Happy server
- **GIVEN** `ALL_PROXY` or `HTTP_PROXY` points to a proxy endpoint that returns HTTP 400 for Happy bootstrap requests
- **WHEN** Happy CLI performs control-plane requests (machine/session bootstrap, connect, push-token fetch, health checks)
- **THEN** those requests SHALL follow the centralized control-plane policy and SHALL not be redirected by ambient proxy env vars

### Requirement: Spawned Agent Processes Preserve Proxy Environment Variables
The Happy CLI SHALL preserve ambient proxy environment variables for spawned AI agent subprocesses unless explicitly overridden by existing CLI options.

#### Scenario: User relies on proxy env vars for upstream agent connectivity
- **GIVEN** proxy environment variables are set in the shell
- **WHEN** Happy spawns Claude/Codex/Gemini subprocesses
- **THEN** the subprocess environment SHALL still include those proxy variables
- **AND** this SHALL not be removed as part of Happy control-plane proxy hardening
