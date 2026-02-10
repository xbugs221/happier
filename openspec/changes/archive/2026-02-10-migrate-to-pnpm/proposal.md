# Change: Migrate from Yarn 1 to pnpm for Package Management

## Why

The project currently uses Yarn 1.22.22 for package management in a monorepo setup with three packages (happy-app, happy-cli, happy-server). This causes:

1. **Disk space inefficiency**: Multiple node_modules folders with duplicate dependencies
2. **Slow installation**: Yarn 1 lacks the performance optimizations of modern package managers
3. **Limited features**: Missing modern workspace features and improved dependency resolution

pnpm addresses these issues through:
- Content-addressable storage with hard links (saves 2-3GB+ disk space)
- 2-3x faster installation compared to Yarn 1
- Better monorepo support with workspace protocol
- Strict dependency resolution prevents phantom dependencies

## What Changes

- Replace Yarn 1.22.22 with pnpm (latest stable, currently v9.x)
- Convert `package.json` workspace configuration to pnpm format
- Migrate `nohoist` configuration to pnpm's equivalents (public-hoist-pattern)
- Update all documentation references from `yarn` to `pnpm`
- Update CI/CD workflows (.github/workflows) to use pnpm
- Convert `yarn.lock` to `pnpm-lock.yaml`
- Add `.npmrc` configuration file for pnpm settings
- Update `packageManager` field in all package.json files
- Migrate resolution overrides to pnpm's overrides format
- **BREAKING**: CLI commands change from `yarn <cmd>` to `pnpm <cmd>`

## Impact

**Affected specs:**
- tooling/build-system (new capability - needs to be created)

**Affected code:**
- Root `package.json` - workspace config, packageManager field
- All three package `package.json` files in packages/
- `.github/workflows/typecheck.yml` - CI dependency installation
- `.github/workflows/cli-smoke-test.yml` - CI dependency installation
- `packages/happy-app/CLAUDE.md` - documentation updates
- `packages/happy-cli/CLAUDE.md` - documentation updates
- `packages/happy-server/CLAUDE.md` - documentation updates
- `packages/happy-cli/CONTRIBUTING.md` - documentation updates
- `openspec/project.md` - project conventions updates
- `docs/` - deployment and setup documentation

**Risks:**
1. React Native nohoist requirements may not translate perfectly to pnpm
2. Expo tooling compatibility (known to work but needs validation)
3. Developer onboarding friction (new commands to learn)
4. CI cache invalidation (need to rebuild caches)

**Migration strategy:**
- Test on a feature branch first
- Validate all build commands across packages
- Test iOS/Android/Web builds for happy-app
- Test CLI binary generation for happy-cli
- Verify Prisma generation for happy-server
- Full CI/CD test run before merging
