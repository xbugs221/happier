# machine-proxy-config Specification

## Purpose
TBD - created by archiving change add-machine-proxy-config. Update Purpose after archive.
## Requirements
### Requirement: Machine Metadata SHALL Support Proxy Configuration
机器元数据 SHALL 支持可选的代理配置字段，包含代理启用状态和各类代理服务器地址。

#### Scenario: User configures HTTP proxy for a machine
- **GIVEN** a user has a machine connected to Happy app
- **AND** the user needs to access AI services through a corporate HTTP proxy
- **WHEN** the user configures the machine's proxy settings with `httpProxy = "http://proxy.corp.com:8080"`
- **THEN** the machine metadata SHALL store the proxy configuration in encrypted form
- **AND** the `proxyConfig.enabled` flag SHALL be set to `true`
- **AND** the proxy configuration SHALL persist across app restarts

#### Scenario: User configures authenticated proxy with credentials
- **GIVEN** a user's proxy requires authentication
- **WHEN** the user configures `httpProxy = "http://user:password@proxy.corp.com:8080"`
- **THEN** the machine metadata SHALL accept and store the full proxy URL including credentials
- **AND** the credentials SHALL be encrypted as part of machine metadata
- **AND** the credentials SHALL NOT be logged or exposed in plaintext

#### Scenario: User configures SOCKS proxy via allProxy
- **GIVEN** a user prefers SOCKS5 proxy for all traffic
- **WHEN** the user configures `allProxy = "socks5://127.0.0.1:1080"`
- **THEN** the machine metadata SHALL store the SOCKS proxy configuration
- **AND** sessions spawned on this machine SHALL receive `all_proxy` and `ALL_PROXY` environment variables

### Requirement: Happy App SHALL Provide Proxy Configuration UI
Happy app SHALL 提供用户界面让用户为机器配置代理设置。

#### Scenario: User accesses proxy configuration from machine detail page
- **GIVEN** a user views a machine detail page in Happy app
- **WHEN** the user navigates to the proxy configuration section
- **THEN** the app SHALL display a proxy configuration form with the following fields:
  - Enable/disable toggle
  - HTTP Proxy input (with placeholder showing format: `http://host:port`)
  - HTTPS Proxy input (optional, with note: "Leave empty to use HTTP Proxy")
  - All Proxy input (optional, with placeholder: `socks5://host:port`)
  - No Proxy input (optional, with placeholder: `localhost,127.0.0.1,.local`)
- **AND** the form SHALL show current configuration values if already set
- **AND** the form SHALL validate input formats before allowing save

#### Scenario: User enables proxy configuration
- **GIVEN** a user has filled in proxy configuration fields
- **WHEN** the user toggles the "Enable proxy" switch to ON
- **AND** the user saves the configuration
- **THEN** the app SHALL call `machineUpdateMetadata` to persist the configuration
- **AND** the app SHALL show a success message upon successful save
- **AND** subsequent session spawns SHALL use the configured proxy

#### Scenario: User disables proxy configuration without deleting values
- **GIVEN** a machine has proxy configuration with `enabled = true`
- **WHEN** the user toggles the "Enable proxy" switch to OFF
- **AND** the user saves the configuration
- **THEN** the proxy configuration values SHALL remain in metadata
- **BUT** sessions spawned SHALL NOT receive proxy environment variables
- **AND** the user SHALL be able to re-enable the proxy without re-entering values

### Requirement: Session Spawn SHALL Apply Machine Proxy Configuration
当从 Happy app 启动会话时，SHALL 自动将机器的代理配置转换为环境变量并传递给会话进程。

#### Scenario: Spawn session with machine-level proxy enabled
- **GIVEN** a machine has `proxyConfig.enabled = true`
- **AND** `proxyConfig.httpProxy = "http://proxy.example.com:8080"`
- **WHEN** a user spawns a new session on this machine
- **THEN** the session spawn request SHALL include the following environment variables:
  - `http_proxy = "http://proxy.example.com:8080"`
  - `HTTP_PROXY = "http://proxy.example.com:8080"`
  - `https_proxy = "http://proxy.example.com:8080"` (same as httpProxy if httpsProxy is empty)
  - `HTTPS_PROXY = "http://proxy.example.com:8080"`
- **AND** the spawned agent process SHALL inherit these environment variables
- **AND** the agent's network requests SHALL go through the configured proxy

#### Scenario: Spawn session with separate HTTP and HTTPS proxies
- **GIVEN** a machine has `proxyConfig.enabled = true`
- **AND** `proxyConfig.httpProxy = "http://proxy-http.example.com:8080"`
- **AND** `proxyConfig.httpsProxy = "https://proxy-https.example.com:8443"`
- **WHEN** a user spawns a new session on this machine
- **THEN** the session SHALL receive:
  - `http_proxy` and `HTTP_PROXY` set to `httpProxy` value
  - `https_proxy` and `HTTPS_PROXY` set to `httpsProxy` value
- **AND** HTTP and HTTPS traffic SHALL use their respective proxies

#### Scenario: Spawn session with noProxy exclusions
- **GIVEN** a machine has proxy enabled with `noProxy = "localhost,127.0.0.1,.local"`
- **WHEN** a user spawns a session
- **THEN** the session SHALL receive `no_proxy` and `NO_PROXY` environment variables
- **AND** requests to excluded hosts SHALL bypass the proxy

#### Scenario: Session-level environment variables override machine proxy
- **GIVEN** a machine has proxy enabled with `httpProxy = "http://machine-proxy:8080"`
- **AND** a user spawns a session with explicit `environmentVariables = { http_proxy: "http://session-proxy:9090" }`
- **WHEN** the session is spawned
- **THEN** the session SHALL use `http://session-proxy:9090` as the HTTP proxy
- **AND** machine-level proxy configuration SHALL NOT override explicit session-level variables
- **AND** this allows per-session proxy customization when needed

### Requirement: Proxy Configuration SHALL Support Standard Environment Variable Format
代理配置 SHALL 遵循标准的 Unix 代理环境变量格式和语义。

#### Scenario: Proxy configuration uses standard URL format
- **GIVEN** standard proxy environment variables expect `scheme://[user:pass@]host:port` format
- **WHEN** a user configures a proxy in Happy app
- **THEN** the input validation SHALL enforce the following rules:
  - HTTP proxy must start with `http://` or `https://`
  - SOCKS proxy must start with `socks4://`, `socks5://`, or `socks://`
  - Port number must be present and valid (1-65535)
  - Hostname must be valid DNS name or IP address
  - Credentials (if present) must be URL-encoded for special characters

#### Scenario: No proxy list uses standard format
- **GIVEN** `noProxy` field expects comma-separated domain patterns
- **WHEN** a user enters `noProxy = "localhost, 127.0.0.1, .local, example.com"`
- **THEN** the value SHALL be stored as-is and passed to `no_proxy` environment variable
- **AND** the spawned agent process SHALL respect standard no_proxy semantics:
  - Exact hostname match (e.g., `localhost`)
  - IP address match (e.g., `127.0.0.1`)
  - Domain suffix match (e.g., `.local` matches `foo.local`)
  - Subdomain match (e.g., `example.com` matches `api.example.com`)

### Requirement: Proxy Configuration SHALL Be Validated Before Saving
Happy app SHALL 验证代理配置的格式和内容后才允许保存。

#### Scenario: Invalid HTTP proxy URL is rejected
- **GIVEN** a user enters an invalid HTTP proxy value `invalid-url`
- **WHEN** the user attempts to save the configuration
- **THEN** the app SHALL display a validation error message
- **AND** the save operation SHALL NOT proceed
- **AND** the error message SHALL indicate the expected format (e.g., "HTTP proxy must be a valid URL starting with http:// or https://")

#### Scenario: Invalid port number is rejected
- **GIVEN** a user enters `httpProxy = "http://proxy.example.com:99999"`
- **WHEN** the user attempts to save
- **THEN** the app SHALL reject the configuration with a validation error
- **AND** the error SHALL indicate that port must be between 1 and 65535

### Requirement: Proxy Configuration SHALL Be Internationalized
代理配置 UI SHALL 支持多语言显示。

#### Scenario: Chinese user views proxy configuration UI
- **GIVEN** a user has set app language to Simplified Chinese
- **WHEN** the user opens proxy configuration UI
- **THEN** all labels, placeholders, and error messages SHALL display in Chinese
- **AND** the UI SHALL provide localized help text explaining proxy configuration

#### Scenario: Error messages are localized
- **GIVEN** a user with app language set to Japanese
- **WHEN** a validation error occurs (e.g., invalid URL format)
- **THEN** the error message SHALL display in Japanese
- **AND** the message SHALL clearly explain what went wrong and how to fix it

