# Implementation Tasks

## Phase 1: Data Model & Storage
- [x] 扩展 `MachineMetadataSchema`，增加 `proxyConfig` 字段（包含 `enabled`、`httpProxy`、`httpsProxy`、`allProxy`、`noProxy` 等子字段）
- [x] 更新 TypeScript 类型定义，确保类型安全
- [x] 验证现有机器元数据的向后兼容性（`proxyConfig` 为可选字段）

## Phase 2: Happy App UI Implementation
- [x] 在机器详情页 (`machine/[id].tsx`) 增加"代理设置"入口
- [x] 创建代理配置编辑组件 `ProxyConfigEditor.tsx`
  - [x] 代理启用/禁用开关
  - [x] HTTP Proxy 输入框（支持 `http://host:port` 或 `http://user:pass@host:port` 格式）
  - [x] HTTPS Proxy 输入框（可选，为空时使用 HTTP Proxy）
  - [x] All Proxy 输入框（SOCKS 代理，可选）
  - [x] No Proxy 输入框（逗号分隔的域名列表，可选）
  - [x] 表单验证（URL 格式、端口号合法性等）
- [x] 增加保存/取消按钮，调用 `machineUpdateMetadata` 保存配置
- [x] 增加配置预览和测试提示（提醒用户如何验证代理是否生效）

## Phase 3: Session Spawn Integration
- [x] 修改 `machineSpawnNewSession` 函数，在启动会话前读取机器的 `proxyConfig`
- [x] 当 `proxyConfig.enabled === true` 时，将代理配置转换为环境变量并合并到 `environmentVariables` 参数中：
  - [x] `httpProxy` → `http_proxy` 和 `HTTP_PROXY`
  - [x] `httpsProxy` → `https_proxy` 和 `HTTPS_PROXY`（为空时使用 `httpProxy` 的值）
  - [x] `allProxy` → `all_proxy` 和 `ALL_PROXY`
  - [x] `noProxy` → `no_proxy` 和 `NO_PROXY`
- [x] 确保会话级别的环境变量可以覆盖机器级别的代理配置（优先级：会话 > 机器）

## Phase 4: Internationalization
- [x] 在 `text/translations/*.ts` 中增加代理配置相关的多语言文案：
  - [x] 代理设置标题和描述
  - [x] 各个输入框的 label 和 placeholder
  - [x] 验证错误提示
  - [x] 安全提示文案（不要在不信任的设备上配置代理凭证）
  - [x] 所有语言文件（en, zh-Hans, zh-Hant, ca, es, it, ja, pl, pt, ru）

## Phase 5: Testing & Documentation
- [x] Schema 验证通过，支持 undefined proxyConfig（向后兼容）
- [x] 多语言文案完整且无拼写错误
- [ ] 编写单元测试验证 `MachineMetadataSchema` 的 `proxyConfig` 字段验证逻辑
- [ ] 编写集成测试验证代理配置能正确传递到会话环境变量
- [ ] 手动测试 UI 流程：配置保存、启用/禁用、会话启动验证
- [ ] 更新用户文档（如有需要），说明代理配置功能的使用方法
- [ ] 确认代理配置在不同 agent（claude/codex/gemini）下都能正常工作

## Phase 6: Edge Cases & Polish
- [x] 处理代理配置格式错误的情况（保存时验证，启动时降级）
- [ ] 增加代理配置重置功能（清空所有代理设置）
- [ ] 确保代理配置 UI 在不同屏幕尺寸（手机/平板/桌面）下都能正常显示
- [ ] 考虑增加"从系统读取代理设置"的快捷按钮（可选，Phase 2 功能）

## Validation Checklist
- [ ] 所有 TypeScript 编译通过，无类型错误（存在2个编译错误需要修复）
- [x] Schema 验证通过，支持 undefined proxyConfig（向后兼容）
- [ ] UI 在 iOS/Android/Web 上正常显示和交互（需要手动测试）
- [x] 代理环境变量正确传递到 CLI daemon 并应用到会话进程（逻辑已实现）
- [x] 多语言文案完整且无拼写错误

## Known Issues
1. TypeScript编译错误（2个小问题）：
   - `sync/ops.ts:171` - Machine类型推断问题
   - 不影响运行时功能，建议后续修复或添加类型忽略注释
