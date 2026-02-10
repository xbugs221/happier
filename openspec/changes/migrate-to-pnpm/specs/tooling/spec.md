# Capability: Tooling - Build System and Package Management

## ADDED Requirements

### Requirement: pnpm Package Manager

The monorepo SHALL use pnpm version 9.x as the package manager for all dependency installation and workspace management operations.

#### Scenario: Initial dependency installation
- **WHEN** a developer clones the repository for the first time
- **THEN** running `pnpm install` SHALL install all dependencies for all three packages
- **AND** SHALL create a `pnpm-lock.yaml` lockfile
- **AND** SHALL utilize hard links to minimize disk usage

#### Scenario: Workspace-scoped operations
- **WHEN** a developer needs to run a command for a specific package
- **THEN** using `pnpm --filter <package-name> <command>` SHALL execute the command only in that package's context
- **AND** SHALL resolve dependencies correctly within the workspace

#### Scenario: Hoisted dependencies for React Native
- **WHEN** pnpm installs dependencies for happy-app
- **THEN** packages matching `public-hoist-pattern` in `.npmrc` SHALL be hoisted to the root node_modules
- **AND** Metro bundler SHALL successfully resolve React Native and Expo packages
- **AND** builds SHALL complete without module resolution errors

### Requirement: Workspace Configuration

The monorepo SHALL define workspace packages using `pnpm-workspace.yaml` at the repository root.

#### Scenario: Workspace package discovery
- **WHEN** pnpm reads the workspace configuration
- **THEN** it SHALL recognize `packages/happy-app`, `packages/happy-cli`, and `packages/happy-server` as workspace members
- **AND** SHALL enable cross-package dependency resolution

### Requirement: Dependency Override Management

The root package.json SHALL define pnpm overrides to enforce specific versions of shared dependencies across all packages.

#### Scenario: React version alignment
- **WHEN** pnpm installs dependencies
- **THEN** all packages SHALL use React 19.1.0 as specified in pnpm overrides
- **AND** no conflicting React versions SHALL exist in the node_modules tree

### Requirement: CI/CD Integration

All GitHub Actions workflows SHALL use pnpm for dependency installation and build operations.

#### Scenario: Typecheck workflow execution
- **WHEN** the typecheck workflow runs on a PR
- **THEN** it SHALL install pnpm using pnpm/action-setup@v2
- **AND** SHALL cache pnpm store for faster subsequent runs
- **AND** SHALL install dependencies with `pnpm install --frozen-lockfile`
- **AND** SHALL execute typecheck using `pnpm --filter happy-app typecheck`

#### Scenario: CLI smoke test workflow execution
- **WHEN** the CLI smoke test workflow runs
- **THEN** it SHALL build the CLI package using `pnpm --filter happy-coder build`
- **AND** SHALL pack the package for global installation testing
- **AND** SHALL successfully execute the binary after installation

### Requirement: Documentation Consistency

All developer documentation SHALL reference pnpm commands instead of yarn commands.

#### Scenario: Developer onboarding
- **WHEN** a new developer reads CLAUDE.md files in any package
- **THEN** all command examples SHALL use pnpm syntax
- **AND** workspace commands SHALL use `pnpm --filter` syntax
- **AND** no outdated yarn command references SHALL remain

#### Scenario: Project conventions documentation
- **WHEN** developers read openspec/project.md
- **THEN** the Tech Stack section SHALL list pnpm as the package manager
- **AND** the Project Conventions section SHALL provide pnpm command examples

### Requirement: Package Manager Field Declaration

All package.json files SHALL declare the required package manager and version using the packageManager field.

#### Scenario: Enforcing pnpm usage
- **WHEN** a developer attempts to use npm or yarn
- **THEN** the package manager field SHALL cause a warning or error (depending on tooling)
- **AND** SHALL guide developers to use pnpm@9.x

### Requirement: Migration Compatibility

The pnpm configuration SHALL maintain full compatibility with existing React Native, Expo, and Prisma tooling.

#### Scenario: Expo development server
- **WHEN** a developer runs `pnpm --filter happy-app start`
- **THEN** the Expo development server SHALL start without errors
- **AND** Metro bundler SHALL resolve all modules correctly

#### Scenario: Prisma client generation
- **WHEN** happy-server generates Prisma client with `pnpm --filter happy-server generate`
- **THEN** Prisma SHALL locate the schema file correctly
- **AND** SHALL generate TypeScript types in node_modules/@prisma/client
- **AND** the server SHALL import the generated client without errors

#### Scenario: CLI binary execution
- **WHEN** happy-cli is built with `pnpm --filter happy-coder build`
- **THEN** the generated binary at `bin/happy.mjs` SHALL execute successfully
- **AND** SHALL resolve all internal imports correctly
- **AND** daemon commands SHALL function as expected

### Requirement: .npmrc Configuration

The repository root SHALL contain a `.npmrc` file with pnpm-specific configuration for hoisting and symlink behavior.

#### Scenario: React Native hoisting rules
- **WHEN** pnpm reads `.npmrc` configuration
- **THEN** packages matching `public-hoist-pattern[]=*react*` SHALL be hoisted
- **AND** packages matching `public-hoist-pattern[]=*expo*` SHALL be hoisted
- **AND** packages matching `public-hoist-pattern[]=@react-native*` SHALL be hoisted

### Requirement: Lockfile Management

The repository SHALL maintain a `pnpm-lock.yaml` file that records exact dependency versions and SHALL NOT contain `yarn.lock`.

#### Scenario: Reproducible builds
- **WHEN** CI or a developer runs `pnpm install --frozen-lockfile`
- **THEN** pnpm SHALL install the exact versions specified in pnpm-lock.yaml
- **AND** SHALL fail if the lockfile is out of sync with package.json
- **AND** SHALL ensure consistent dependency trees across all environments
