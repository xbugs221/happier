# Project Context

## Purpose
`happy` 是一个 monorepo 项目，目标是让开发者可以在手机、网页和桌面端远程查看并控制 AI coding agent（Claude Code、Codex、Gemini）会话。

核心目标：
- 为 AI coding 会话提供跨设备实时同步和远程接管能力
- 在同步过程中保持端到端加密（E2EE）和最小数据暴露
- 提供开源、可自托管的服务端与可发布的 CLI/App 客户端

## Tech Stack
- Monorepo: Yarn Workspaces (Yarn 1.22), Node.js >= 20
- Language: TypeScript (all core packages use `strict` mode)
- `packages/happy-app`: React Native 0.81 + Expo 54 + Expo Router 6, Unistyles, Zustand, libsodium, Socket.IO client, LiveKit, Tauri (desktop variant)
- `packages/happy-cli`: TypeScript CLI (`happy`), Ink, Fastify, Zod, Socket.IO client, TweetNaCl, MCP/ACP SDK, pkgroll build
- `packages/happy-server`: Fastify 5 + Zod, Prisma 6, PostgreSQL, Redis (ioredis), Socket.IO, MinIO/S3, Prometheus metrics (`prom-client`)
- Testing: Vitest (app/cli/server), GitHub Actions CI (typecheck + CLI smoke tests)

## Project Conventions

### Code Style
- 优先使用 TypeScript 严格类型；新增逻辑应保持明确输入/输出类型
- 主要包使用路径别名 `@/*`（分别映射到 `src` 或 `sources`）
- Import 放在文件顶部，避免中途动态插入 import（除确有必要的按需加载）
- 以现有文件风格为准（仓库没有统一的根级 Prettier/ESLint 规则）
- `happy-app` 的用户可见文案优先走 i18n（`t(...)`）并同步多语言词条
- 包管理与 workspace 命令统一使用 Yarn（例如 `yarn workspace happy-coder build`）

### Architecture Patterns
- 三包分层架构：
- `happy-app`: 多端 UI（iOS/Android/Web/macOS）与本地会话展示/控制
- `happy-cli`: 本地代理与会话执行入口，负责启动 agent、daemon、认证与设备协同
- `happy-server`: 同步与控制后端，提供 API/WebSocket、账号/设备/会话持久化
- 端到端加密优先：敏感会话数据在客户端加密后再上传，服务端只处理密文和同步元数据
- 实时通信优先使用 WebSocket/Socket.IO，实现会话状态、权限请求、通知的跨端同步
- `happy-app` 采用 dev/preview/production 多变体发布；CLI 采用 stable/dev 数据目录隔离

### Testing Strategy
- 单元/集成测试使用 Vitest：
- `happy-app`: `sources/**/*.{spec,test}.ts`（Node 环境，含 coverage 配置）
- `happy-cli`: `src/**/*.test.ts`，测试前先 build，并加载 `.env.integration-test`
- `happy-server`: `**/*.test.ts` / `**/*.spec.ts`
- CI 当前重点：
- `happy-app` 在 PR/Push（main）执行 TypeScript typecheck
- `happy-cli` 在 PR/Push（main）执行跨平台 smoke test（Linux/Windows，Node 20/24）
- 不允许通过删除/弱化测试来规避问题；应修复实现或诚实记录失败原因

### Git Workflow
- 默认分支为 `main`
- 推荐流程：功能分支开发 -> 提交 PR -> 通过 CI 后合并到 `main`
- 提交信息通常使用前缀风格（如 `feat:`, `fix:`, `chore:`, `ref:`），但当前仓库未强制严格 Conventional Commits
- 修改尽量按包范围收敛（app/cli/server 分别变更），减少跨包耦合改动

## Domain Context
这是一个“AI coding agent remote control”领域项目，不是通用聊天应用。

关键业务对象：
- Account / Machine / Session：用户、设备、会话的跨端绑定与同步
- CLI Daemon：本地常驻进程，负责远程拉起/管理会话和状态回传
- Auth + Key Material：通过密钥机制做认证与签名，而非传统用户名密码
- Push + Presence：用于远程提醒（如需要权限）和设备在线状态同步

关键业务特性：
- 需要兼容 Claude Code、Codex、Gemini 等不同 agent/供应商接入
- 用户价值是“离开电脑也能安全接管 coding session”
- 隐私承诺较强：不开启遥测追踪，强调可审计与自托管可能性

## Important Constraints
- 安全约束：会话内容必须遵守端到端加密设计，避免在服务端明文持久化敏感内容
- 运行时约束：核心 Node 版本基线为 20+；CI 还会覆盖 Node 24
- 服务依赖约束：`happy-server` 本地开发需要 PostgreSQL + Redis，文件/对象存储依赖 S3 兼容接口（本地可用 MinIO）
- 发布约束：
- `happy-app` 有 dev/preview/production 多 bundle ID 约束
- `happy-cli` 有 stable/dev 数据目录隔离（`~/.happy` vs `~/.happy-dev`）
- 仓库约束：Yarn workspaces + React Native 相关 `nohoist` 规则，避免随意改动包管理结构

## External Dependencies
- AI 生态：
- Claude CLI（`claude` 命令）
- Codex 接入（`happy codex`）
- Gemini CLI + Google 认证（`happy connect gemini`）
- Happy cloud endpoints（可环境变量覆盖）：
- Server URL 默认 `https://api.cluster-fluster.com`
- WebApp URL 默认 `https://app.happy.engineering`
- 基础设施：
- PostgreSQL（Prisma）
- Redis（事件/状态）
- MinIO/S3（对象存储）
- Expo EAS（移动端构建与 OTA）
- GitHub Actions（CI）
