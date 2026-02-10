# Design: Yarn to pnpm Migration Strategy

## Context

The Happy project is a monorepo with three distinct packages:
- **happy-app**: React Native 0.81 + Expo 54 application (iOS/Android/Web/macOS)
- **happy-cli**: Node.js CLI tool built with TypeScript and pkgroll
- **happy-server**: Fastify server with Prisma ORM

Current pain points:
- Yarn 1.22.22 is in maintenance mode (no new features)
- Large node_modules footprint (3+ packages × many dependencies)
- Slower install times compared to modern package managers
- Complex nohoist configuration needed for React Native

## Goals / Non-Goals

**Goals:**
- Reduce node_modules disk usage by 50-70% through pnpm's hard-linking
- Speed up `install` operations by 2-3x
- Maintain full compatibility with React Native/Expo build tooling
- Preserve workspace structure and cross-package dependencies
- Zero changes to application runtime behavior
- Improve CI/CD cache efficiency

**Non-Goals:**
- Changing package structure or architecture
- Upgrading major dependencies (React Native, Expo, etc.)
- Modifying build outputs or distribution formats
- Switching from npm registry

## Decisions

### Decision 1: Use pnpm over Bun

**Rationale:**
- pnpm has proven React Native compatibility (Expo officially supports it)
- Mature ecosystem with 7+ years of production use
- Better handling of hoisting scenarios needed by React Native
- More conservative choice with lower migration risk
- Bun is fast but ecosystem is younger, less proven with RN/Expo edge cases

**Alternatives considered:**
- Bun: Faster but higher risk for RN compatibility
- Yarn 3+ (Berry): Requires PnP mode which breaks many RN tools
- Keep Yarn 1: No improvement to current pain points

### Decision 2: Use public-hoist-pattern for React Native

React Native and Expo require certain packages to be hoisted to avoid Metro bundler issues. Yarn 1's `nohoist` is an inversion (what NOT to hoist), while pnpm's `public-hoist-pattern` specifies what TO hoist.

**Mapping strategy:**
```
Yarn nohoist:               pnpm equivalent:
**/react-native         →   public-hoist-pattern: ["*react-native*"]
**/react-native/**      →   (covered by wildcard)
**/react                →   public-hoist-pattern: ["react", "react-dom"]
**/zod                  →   (likely not needed - test first)
```

**Configuration in `.npmrc`:**
```
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*expo*
public-hoist-pattern[]=@react-native*
public-hoist-pattern[]=@react-navigation*
```

### Decision 3: Workspace Protocol Format

Convert resolutions to overrides:

**Before (Yarn):**
```json
"resolutions": {
  "packages/happy-cli/react": "19.1.0"
}
```

**After (pnpm):**
```json
"pnpm": {
  "overrides": {
    "react": "19.1.0"
  }
}
```

Note: pnpm overrides are global, not package-scoped like Yarn resolutions. This is acceptable here since all packages should align on React 19.1.0.

### Decision 4: Preserve $npm_execpath in Scripts

Scripts using `$npm_execpath` (e.g., in happy-cli) work with pnpm without modification. This env var points to the package manager executable, and pnpm sets it correctly.

### Decision 5: Use pnpm 9.x (latest stable)

- Version 9 is current stable release
- Includes all necessary workspace features
- Better performance than v8
- Specify in `packageManager` field: `"packageManager": "pnpm@9.17.1"`

## Technical Approach

### Phase 1: Configuration

1. Create `.npmrc` at root:
```
node-linker=isolated
shamefully-hoist=false
public-hoist-pattern[]=*react*
public-hoist-pattern[]=*expo*
public-hoist-pattern[]=@react-native*
public-hoist-pattern[]=@react-navigation*
public-hoist-pattern[]=*livekit*
```

2. Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/happy-app'
  - 'packages/happy-cli'
  - 'packages/happy-server'
```

3. Update root `package.json`:
```json
{
  "name": "monorepo",
  "private": true,
  "packageManager": "pnpm@9.17.1",
  "pnpm": {
    "overrides": {
      "react": "19.1.0",
      "whatwg-url": "14.2.0",
      "parse-path": "7.0.3"
    }
  }
}
```

### Phase 2: Migration Steps

1. Clean slate:
   ```bash
   rm -rf node_modules packages/*/node_modules yarn.lock
   ```

2. Install pnpm:
   ```bash
   npm install -g pnpm@latest
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Verify structure:
   ```bash
   ls -la node_modules/.pnpm  # Should show content-addressable store
   ```

### Phase 3: CI/CD Integration

GitHub Actions setup:
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 9

- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Build package
  run: pnpm --filter happy-coder build
```

### Phase 4: Command Translation

Common command mappings:
```bash
# Installation
yarn install                    → pnpm install
yarn install --frozen-lockfile  → pnpm install --frozen-lockfile

# Workspaces
yarn workspace happy-app build  → pnpm --filter happy-app build
yarn workspaces run test        → pnpm -r run test

# Adding dependencies
yarn add pkg                    → pnpm add pkg
yarn workspace happy-app add pkg → pnpm --filter happy-app add pkg

# Scripts
yarn start                      → pnpm start
yarn build                      → pnpm build
```

## Risks / Trade-offs

### Risk 1: React Native Metro Bundler Compatibility

**Mitigation:**
- Extensively test with `public-hoist-pattern` before committing
- Keep reference to Yarn 1 setup in git history for rollback
- Test all platforms (iOS, Android, Web) after migration
- Use Expo's recommended pnpm configuration as baseline

**Fallback:**
If hoisting issues occur, can enable `shamefully-hoist=true` as temporary workaround (loses some pnpm benefits but still faster than Yarn 1).

### Risk 2: Phantom Dependencies Exposed

pnpm strictly enforces declared dependencies. Code may fail if it imports packages not listed in `package.json`.

**Mitigation:**
- Run full test suite after migration
- Check for runtime errors in dev mode
- If needed, add missing deps to package.json

**Trade-off:**
This is actually a benefit long-term (prevents dependency bugs), but may require adding previously phantom deps.

### Risk 3: Developer Friction

Team members must learn new commands.

**Mitigation:**
- Create cheatsheet document mapping yarn → pnpm commands
- Add global aliases in documentation:
  ```bash
  alias y=pnpm
  ```
- Update all docs preemptively

### Risk 4: CI Cache Invalidation

GitHub Actions caches will miss after switch, causing one-time slowdown.

**Mitigation:**
- Update cache keys to include pnpm identifier
- Pre-warm caches by running CI on feature branch before merge
- Document expected one-time slowdown for team

### Risk 5: Expo EAS Build Compatibility

EAS (Expo Application Services) must support pnpm for cloud builds.

**Mitigation:**
- Expo officially supports pnpm as of SDK 49+
- Project uses Expo 54, so fully compatible
- Test `eas build` on feature branch before merge

## Migration Plan

### Step 1: Feature Branch Setup
```bash
git checkout -b migrate-to-pnpm
```

### Step 2: Local Testing (2-3 hours)
1. Configure pnpm
2. Install dependencies
3. Test all build commands
4. Manual testing on one platform

### Step 3: Comprehensive Validation (4-6 hours)
1. Test iOS build
2. Test Android build
3. Test Web build
4. Test CLI binary generation
5. Test server with Prisma
6. Run all test suites

### Step 4: CI Validation (1 hour)
1. Push to feature branch
2. Watch CI runs
3. Fix any issues

### Step 5: Documentation Sprint (2 hours)
1. Update all CLAUDE.md files
2. Update project.md
3. Update deployment docs
4. Create migration guide for team

### Step 6: Review & Merge (1 hour)
1. Self-review all changes
2. Create PR with detailed description
3. Post-merge: monitor for issues

**Total estimated time:** 10-13 hours

### Rollback Plan

If critical issues found after merge:
```bash
git revert <merge-commit-sha>
git push
```

Team reverts to Yarn 1:
```bash
git checkout main^  # Before merge commit
yarn install
```

## Open Questions

1. ✅ Does the project use any Yarn plugins?
   - **Answer:** No, using vanilla Yarn 1.22.22

2. ✅ Are there any custom scripts that parse yarn.lock?
   - **Answer:** No evidence found in codebase

3. ⚠️ Do any deployment scripts assume Yarn?
   - **Needs check:** EAS configuration, deployment docs

4. ⚠️ Is there a .yarnrc file with custom registry config?
   - **Needs check:** Look for .yarnrc or .yarnrc.yml

## Success Metrics

Post-migration validation:
- ✅ All CI jobs pass
- ✅ node_modules size reduced by >50%
- ✅ `pnpm install` time <60% of previous `yarn install` time
- ✅ All platforms build successfully (iOS/Android/Web)
- ✅ CLI binary works in dev and production mode
- ✅ Server starts without Prisma errors
- ✅ Zero runtime behavior changes
