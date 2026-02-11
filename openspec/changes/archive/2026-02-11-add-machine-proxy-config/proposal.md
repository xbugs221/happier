# Change: Add machine-level proxy configuration

## Why
用户希望在手机端的 Happy app 上为机器配置代理设置，以便从手机启动的所有会话都能通过指定的代理服务器访问网络。这对于需要通过代理访问 AI 服务的用户（如企业环境、特定网络环境）非常重要。

当前虽然支持在启动会话时传递环境变量，但每次都需要手动输入代理配置很不方便。用户需要一个机器级别的持久化配置，让所有从该机器启动的会话自动继承代理设置。

## What Changes
- 在 Machine 元数据中增加可选的 `proxyConfig` 字段，用于存储代理配置
- 在 Happy app 的机器详情页面增加代理配置 UI，支持配置 `http_proxy` 和 `all_proxy` 等环境变量
- 在启动会话时，自动将机器级别的代理配置合并到会话的环境变量中
- 提供启用/禁用代理的开关，让用户可以灵活控制是否使用代理
- 确保配置通过端到端加密保存在服务端

## Impact
- Affected specs: 新增 `machine-proxy-config` spec
- Affected code:
  - `packages/happy-app/sources/sync/storageTypes.ts`: 扩展 `MachineMetadata` schema 增加 `proxyConfig` 字段
  - `packages/happy-app/sources/app/(app)/machine/[id].tsx`: 增加代理配置 UI
  - `packages/happy-app/sources/components/` (new): 增加代理配置编辑组件
  - `packages/happy-app/sources/sync/ops.ts`: 在 `machineSpawnNewSession` 中合并代理环境变量
  - `packages/happy-app/sources/text/translations/*.ts`: 增加 i18n 文案
- Migration: 这是向后兼容的增量功能，现有机器的 `proxyConfig` 为 `undefined` 表示未配置代理
- Security: 代理配置作为机器元数据的一部分，会通过现有的端到端加密机制保护

## Risks
- **低风险**: 纯增量功能，不影响现有会话启动流程
- **低风险**: 代理配置错误可能导致会话无法访问网络，但用户可以随时禁用或修改配置
- **安全考虑**: 代理地址和凭证会被加密存储，但需要在 UI 上明确提示用户不要在不信任的设备上配置敏感代理凭证
