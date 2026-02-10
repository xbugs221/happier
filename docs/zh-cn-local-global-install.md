# 从源码克隆并全局安装 Happy CLI（中文）

本文说明如何从本仓库源码安装 `happy` 命令，并以全局命令方式使用。

## 前置要求

- Git
- Node.js >= 20
- npm（随 Node.js 一起安装）
- pnpm 9.x（本仓库使用 pnpm workspace）

如果你的环境还没有 pnpm，可以用 Corepack 启用：

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
```

或者使用 npm 全局安装：

```bash
npm install -g pnpm@9
```

## 1. 克隆仓库

```bash
git clone https://github.com/slopus/happy.git
cd happy
```

## 2. 安装依赖

```bash
pnpm install
```

## 3. 构建 CLI

```bash
pnpm --filter happy-coder build
```

## 4. 全局安装本地源码版本

在仓库根目录执行：

```bash
npm install -g ./packages/happy-cli
```

安装完成后，`happy` 和 `happy-mcp` 会作为全局命令可用。

## 5. 验证安装与使用

```bash
happy --version
happy
happy codex
```

## 更新本地全局安装

当你拉取了仓库最新代码后，按下面步骤更新全局安装版本：

```bash
git pull
pnpm install
pnpm --filter happy-coder build
npm install -g ./packages/happy-cli
```

## 卸载

```bash
npm uninstall -g happy-coder
```
