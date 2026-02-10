# Implementation Tasks

## 1. Preparation and Research
- [ ] 1.1 Document current Yarn workspace structure and nohoist configuration
- [ ] 1.2 Research pnpm equivalents for all Yarn 1 features used
- [ ] 1.3 Identify all scripts and tools that reference Yarn
- [ ] 1.4 Create backup of current working state

## 2. Core Configuration Migration
- [ ] 2.1 Install pnpm globally on development machine
- [ ] 2.2 Create `.npmrc` with pnpm configuration (public-hoist-pattern for React Native)
- [ ] 2.3 Update root `package.json`: remove Yarn workspace config, add pnpm workspace
- [ ] 2.4 Create `pnpm-workspace.yaml` file
- [ ] 2.5 Convert `resolutions` to pnpm `overrides` format
- [ ] 2.6 Update `packageManager` field in all package.json files to pnpm

## 3. Dependency Installation and Lockfile Migration
- [ ] 3.1 Remove `yarn.lock` and all `node_modules` directories
- [ ] 3.2 Run `pnpm install` to generate `pnpm-lock.yaml`
- [ ] 3.3 Verify no installation errors or warnings
- [ ] 3.4 Commit the new lockfile

## 4. Build Verification - happy-app
- [ ] 4.1 Test `pnpm --filter happy-app start` (Expo dev server)
- [ ] 4.2 Test `pnpm --filter happy-app typecheck`
- [ ] 4.3 Test `pnpm --filter happy-app test` (Vitest)
- [ ] 4.4 Test `pnpm --filter happy-app prebuild` (native directories generation)
- [ ] 4.5 Test iOS build on simulator
- [ ] 4.6 Test Android build on emulator
- [ ] 4.7 Test Web build

## 5. Build Verification - happy-cli
- [ ] 5.1 Test `pnpm --filter happy-coder build` (pkgroll)
- [ ] 5.2 Test `pnpm --filter happy-coder test`
- [ ] 5.3 Test `pnpm --filter happy-coder typecheck`
- [ ] 5.4 Test binary execution with `node ./bin/happy.mjs --help`
- [ ] 5.5 Test daemon commands (start, stop, status)

## 6. Build Verification - happy-server
- [ ] 6.1 Test `pnpm --filter happy-server build` (TypeScript compilation)
- [ ] 6.2 Test `pnpm --filter happy-server generate` (Prisma client)
- [ ] 6.3 Test `pnpm --filter happy-server start` (server startup)
- [ ] 6.4 Test `pnpm --filter happy-server test` (Vitest)

## 7. CI/CD Pipeline Updates
- [ ] 7.1 Update `.github/workflows/typecheck.yml` to use pnpm
- [ ] 7.2 Add pnpm installation step with pnpm/action-setup@v2
- [ ] 7.3 Update cache configuration to use pnpm cache
- [ ] 7.4 Update `.github/workflows/cli-smoke-test.yml` for pnpm
- [ ] 7.5 Replace `yarn install --frozen-lockfile` with `pnpm install --frozen-lockfile`
- [ ] 7.6 Replace `yarn workspace` commands with `pnpm --filter`
- [ ] 7.7 Test CI workflows on feature branch

## 8. Documentation Updates
- [ ] 8.1 Update `packages/happy-app/CLAUDE.md`: replace all yarn commands with pnpm equivalents
- [ ] 8.2 Update `packages/happy-cli/CLAUDE.md`: replace yarn with pnpm
- [ ] 8.3 Update `packages/happy-server/CLAUDE.md`: replace yarn with pnpm
- [ ] 8.4 Update `packages/happy-cli/CONTRIBUTING.md`: migration guide for contributors
- [ ] 8.5 Update `openspec/project.md`: tech stack and conventions
- [ ] 8.6 Update `docs/deployment.md` if it contains installation instructions
- [ ] 8.7 Update `docs/zh-cn-local-global-install.md`: Chinese documentation
- [ ] 8.8 Search for any other markdown files with yarn references and update

## 9. Script Updates
- [ ] 9.1 Review all package.json scripts for yarn-specific syntax
- [ ] 9.2 Update `$npm_execpath` usage if needed (pnpm compatible)
- [ ] 9.3 Update any shell scripts in `scripts/` or `tools/` directories
- [ ] 9.4 Test all npm scripts in all three packages

## 10. Final Validation
- [ ] 10.1 Clean install from scratch: delete node_modules and pnpm-lock, reinstall
- [ ] 10.2 Full build of all three packages
- [ ] 10.3 Run all test suites
- [ ] 10.4 Manual testing of CLI in dev mode
- [ ] 10.5 Manual testing of app in dev mode (at least one platform)
- [ ] 10.6 Review disk space savings (compare with Yarn setup)
- [ ] 10.7 Measure installation time improvement

## 11. Deployment Preparation
- [ ] 11.1 Create migration guide for team members
- [ ] 11.2 Document required pnpm version
- [ ] 11.3 Add pnpm installation instructions to README
- [ ] 11.4 Test production build workflows
- [ ] 11.5 Verify EAS builds still work (for happy-app)
