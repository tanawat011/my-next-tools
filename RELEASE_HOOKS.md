# 🎣 Release Hooks Configuration

This document explains how git hooks are handled during release processes and how to control this behavior.

## 🎯 Why Skip Hooks During Releases?

### Automated Release Commits

- **Version bumps** and **changelog updates** are programmatically generated
- These commits are **already validated** by the release process
- Running hooks on automated commits is **redundant and slow**

### CI/CD Environment

- GitHub Actions and other CI systems may not have Husky installed
- Hooks can **interfere** with automated workflows
- **Permissions issues** in containerized environments

### Performance

- Release processes already include **comprehensive checks**
- Additional hook validation is **unnecessary overhead**
- **Faster deployments** with streamlined automation

## 🛠️ How It Works

### Default Behavior (Hooks Skipped)

Our release scripts skip hooks by default for optimal automation:

```bash
# These commands skip hooks automatically
bun run release:patch
bun run release:minor
bun run release:major

# Equivalent to running:
HUSKY=0 standard-version --release-as patch
git push --no-verify origin main --follow-tags
```

### Manual Hook Control

**Skip hooks explicitly:**

```bash
# Using environment variable
HUSKY=0 git commit -m "chore: release v1.2.0"

# Using git flag
git commit --no-verify -m "chore: release v1.2.0"
git push --no-verify origin main
```

**Include hooks (when needed):**

```bash
# Force hooks to run during release
bun run release:patch:no-hooks
bun run release:minor:no-hooks
bun run release:major:no-hooks

# Or manually
node scripts/release.js patch --no-skip-hooks
```

## ⚙️ Configuration Options

### Environment Variables

| Variable  | Effect                        |
| --------- | ----------------------------- |
| `HUSKY=0` | Disables all Husky hooks      |
| `CI=true` | Some hooks auto-disable in CI |

### Release Script Options

| Option            | Description                          | Default |
| ----------------- | ------------------------------------ | ------- |
| `--dry-run`       | Preview changes without committing   | `false` |
| `--no-skip-hooks` | Include git hooks in release process | `false` |

### Git Command Flags

| Flag                 | Effect                               |
| -------------------- | ------------------------------------ |
| `--no-verify`        | Skip pre-commit and commit-msg hooks |
| `--no-verify` (push) | Skip pre-push hooks                  |

## 📋 Common Scenarios

### ✅ When to Skip Hooks (Default)

1. **Automated releases** via GitHub Actions
2. **CI/CD deployments** and automated versioning
3. **Batch releases** with multiple related commits
4. **Emergency releases** that need to bypass checks
5. **Release preparation** commits (version bumps, changelog)

### ⚠️ When to Include Hooks

1. **Manual releases** where you want full validation
2. **Testing release process** with all safety checks
3. **Custom pre-commit validations** specific to releases
4. **Compliance requirements** that mandate hook execution
5. **Development releases** where hooks provide value

## 🚀 GitHub Actions Integration

Our release workflow automatically handles hooks:

```yaml
# Hooks are automatically skipped in CI
- name: 📤 Push changes
  run: |
    git push origin main --follow-tags --no-verify
```

### Environment Setup

```yaml
env:
  HUSKY: 0 # Disable Husky in CI
  CI: true # Standard CI indicator
```

## 🔧 Troubleshooting

### Hooks Still Running?

**Check environment:**

```bash
echo $HUSKY
echo $CI
```

**Verify git config:**

```bash
git config --list | grep hook
```

**Force disable:**

```bash
# Temporarily disable
export HUSKY=0
bun run release:patch

# Or use explicit flag
git commit --no-verify -m "release commit"
```

### Hooks Not Running When Expected?

**Check if Husky is installed:**

```bash
ls -la .husky/
cat .husky/pre-commit
```

**Re-enable hooks:**

```bash
unset HUSKY
bun run release:patch:no-hooks
```

### Permission Issues in CI

```yaml
# Ensure proper git config in GitHub Actions
- name: ⚙️ Configure Git
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git config core.hooksPath .husky
```

## 📊 Comparison

| Approach                 | Speed     | Safety                          | Automation              | CI-Friendly |
| ------------------------ | --------- | ------------------------------- | ----------------------- | ----------- |
| **Skip Hooks (Default)** | ⚡ Fast   | ✅ Validated by release process | ✅ Excellent            | ✅ Yes      |
| **Include Hooks**        | 🐌 Slower | ✅ Double validation            | ⚠️ Can break automation | ❌ May fail |

## 🎉 Best Practices

### 1. **Use Defaults for Automation**

```bash
# Recommended for most releases
bun run release:minor
```

### 2. **Override When Needed**

```bash
# When you want extra validation
bun run release:minor:no-hooks
```

### 3. **Document Custom Requirements**

If your project needs hooks during releases, document why and how in your README.

### 4. **Test Both Approaches**

Ensure your release process works both with and without hooks.

### 5. **Monitor CI Logs**

Watch for hook-related failures in automated releases.

## 🔗 Related

- [Husky Documentation](https://typicode.github.io/husky/)
- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
- [Our Release Guide](./CHANGELOG_GUIDE.md)

---

**Summary:** Hooks are skipped by default for optimal automation, but can be included when needed using the `--no-skip-hooks` option or dedicated npm scripts.
