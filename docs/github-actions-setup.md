# GitHub Actions Setup

This document describes the CI/CD workflows configured for the Symbi app.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**

- **Lint**: Runs ESLint and Prettier formatting checks
- **TypeCheck**: Validates TypeScript types
- **Test**: Runs Jest tests with coverage reporting
- **Build iOS**: Validates iOS build configuration
- **Build Android**: Validates Android build configuration
- **Pre-submit**: Runs comprehensive pre-submission checks

**Required Secrets:**

- `EXPO_TOKEN`: Expo authentication token (optional for basic builds)

### 2. Release Workflow (`.github/workflows/release.yml`)

Triggers on version tags (e.g., `v1.0.0`).

**Jobs:**

- Builds iOS and Android apps using EAS Build
- Creates GitHub release with build artifacts

**Required Secrets:**

- `EXPO_TOKEN`: Expo authentication token (required)
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### 3. Dependency Review (`.github/workflows/dependency-review.yml`)

Runs on pull requests to `main` branch.

**Features:**

- Reviews dependency changes for security vulnerabilities
- Fails on moderate or higher severity issues
- Blocks GPL-3.0 and AGPL-3.0 licenses

### 4. CodeQL Security Analysis (`.github/workflows/codeql.yml`)

Runs on push, pull requests, and weekly schedule.

**Features:**

- Static code analysis for security vulnerabilities
- Scans JavaScript/TypeScript code
- Reports findings to GitHub Security tab

### 5. Performance Monitoring (`.github/workflows/performance.yml`)

Runs on pull requests and pushes to `main`.

**Features:**

- Bundle size analysis
- Performance test execution
- Reports results in PR summary

## Dependabot Configuration

Automated dependency updates configured in `.github/dependabot.yml`:

- **NPM packages**: Weekly updates on Mondays at 9 AM
- **GitHub Actions**: Weekly updates on Mondays at 9 AM
- Ignores major version updates for React Native, Expo, and React
- Auto-labels PRs with `dependencies` and appropriate tags

## Setup Instructions

### 1. Configure Repository Secrets

Navigate to **Settings → Secrets and variables → Actions** and add:

```
EXPO_TOKEN: Your Expo access token
```

To get your Expo token:

```bash
npx expo login
npx expo whoami
# Copy the token from ~/.expo/state.json
```

### 2. Enable GitHub Actions

1. Go to **Settings → Actions → General**
2. Set **Actions permissions** to "Allow all actions and reusable workflows"
3. Enable **Read and write permissions** for workflows

### 3. Enable Dependabot

Dependabot is automatically enabled with the configuration file. To customize:

1. Go to **Settings → Code security and analysis**
2. Enable **Dependabot alerts** and **Dependabot security updates**

### 4. Enable CodeQL

CodeQL is automatically configured. To view results:

1. Go to **Security → Code scanning alerts**
2. Review any findings and remediate as needed

## Branch Protection Rules

Recommended branch protection for `main`:

1. Go to **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Enable:
   - Require a pull request before merging
   - Require status checks to pass before merging
     - `lint`
     - `typecheck`
     - `test`
     - `pre-submit`
   - Require conversation resolution before merging
   - Do not allow bypassing the above settings

## Local Testing

Before pushing, run the same checks locally:

```bash
# Run all pre-submission checks
npm run pre-submit

# Individual checks
npm run lint
npm run format -- --check
npx tsc --noEmit
npm test
```

## Troubleshooting

### Build Failures

**iOS build fails:**

- Ensure Xcode version is compatible with React Native 0.81.5
- Check that HealthKit entitlements are properly configured
- Verify CocoaPods dependencies are up to date

**Android build fails:**

- Ensure Java 17 is being used
- Check Gradle configuration in `android/build.gradle`
- Verify Google Fit permissions are properly declared

### Test Failures

**Tests timeout:**

- Increase Jest timeout in `jest.config.js`
- Use `--maxWorkers=2` flag to limit parallelism

**Mock issues:**

- Ensure `__mocks__/react-native.js` is up to date
- Check that all native modules are properly mocked

### Dependency Issues

**Dependabot PRs fail:**

- Review breaking changes in dependency changelogs
- Update mocks and tests as needed
- Consider pinning problematic dependencies

## Performance Targets

CI workflows should complete within:

- Lint: < 2 minutes
- TypeCheck: < 3 minutes
- Test: < 5 minutes
- Build validation: < 10 minutes
- Total CI time: < 15 minutes

## Cost Optimization

GitHub Actions minutes are free for public repositories. For private repositories:

- Use `ubuntu-latest` runners (cheapest)
- Use `macos-latest` only when necessary (10x cost)
- Cache dependencies aggressively
- Limit concurrent jobs with `concurrency` groups

## Security Best Practices

1. Never commit secrets or API keys
2. Use repository secrets for sensitive data
3. Enable secret scanning in repository settings
4. Review Dependabot alerts promptly
5. Keep GitHub Actions up to date
6. Use pinned versions for critical actions

## Monitoring

Monitor workflow runs:

- **Actions tab**: View all workflow runs
- **Insights → Dependency graph**: View dependencies
- **Security tab**: View security alerts
- **Pull requests**: View status checks

## Future Enhancements

Potential improvements:

- Add E2E testing with Detox or Maestro
- Implement automatic version bumping
- Add Slack/Discord notifications for failures
- Create staging deployment workflow
- Add visual regression testing
- Implement automatic changelog generation
