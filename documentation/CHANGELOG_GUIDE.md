# 📝 Changelog & Release System Guide

This guide explains how to use the enhanced changelog and release system that includes automated workflows, beautiful UI components, and powerful management tools.

## 🎯 Overview

Our enhanced changelog system provides:

- **Automated changelog generation** from conventional commits
- **Beautiful web interface** for viewing changelogs
- **Enhanced release scripts** with multiple release types
- **GitHub Actions workflows** for CI/CD
- **Release notes generator** with smart categorization
- **Changelog utilities** for validation and management

## 🚀 Quick Start

### Making a Release

```bash
# Patch release (0.1.0 → 0.1.1)
bun run release:patch

# Minor release (0.1.0 → 0.2.0)
bun run release:minor

# Major release (0.1.0 → 1.0.0)
bun run release:major

# Prerelease
bun run release:alpha  # 0.1.0 → 0.1.1-alpha.0
bun run release:beta   # 0.1.0 → 0.1.1-beta.0
bun run release:rc     # 0.1.0 → 0.1.1-rc.0

# Dry run (preview changes)
bun run release:dry-run

# Pre-release checks only
bun run release:check
```

### Managing Changelog

```bash
# Validate changelog format
bun run changelog:validate

# Format changelog for consistency
bun run changelog:format

# Create backup
bun run changelog:backup

# Show statistics
bun run changelog:stats

# Generate release notes
bun run release:notes
bun run release:notes:save  # Save to file
```

## 📋 Release Process

### 1. Development Workflow

1. **Make changes** using conventional commits:

   ```bash
   git commit -m "feat: add user authentication"
   git commit -m "fix: resolve login redirect issue"
   git commit -m "docs: update API documentation"
   ```

2. **Test your changes**:

   ```bash
   bun run release:check  # Runs tests, linting, and build
   ```

3. **Preview release**:

   ```bash
   bun run release:dry-run  # See what would be released
   ```

4. **Create release**:
   ```bash
   bun run release:minor  # Or appropriate version bump
   ```

### 2. Automated Workflow (GitHub Actions)

When you push to `main` with releasable commits:

1. **CI checks** run automatically (tests, linting, build)
2. **Release detection** analyzes commits for release-worthy changes
3. **Automatic versioning** based on commit types:
   - `feat:` → minor version bump
   - `fix:` → patch version bump
   - `feat!:` or `BREAKING CHANGE:` → major version bump
4. **Changelog update** with categorized changes
5. **Git tag creation** and push to repository
6. **GitHub Release** with detailed release notes

### 3. Manual Workflow

You can also trigger releases manually:

1. **Go to GitHub Actions** in your repository
2. **Run the "🚀 Release" workflow**
3. **Choose release type**: patch, minor, major, or prerelease
4. **Workflow handles** the rest automatically

## 📝 Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) with emoji support:

### Commit Types

| Type       | Description              | Version Bump | Emoji |
| ---------- | ------------------------ | ------------ | ----- |
| `feat`     | New features             | Minor        | ✨    |
| `fix`      | Bug fixes                | Patch        | 🐛    |
| `perf`     | Performance improvements | Patch        | ⚡    |
| `docs`     | Documentation            | None         | 📚    |
| `style`    | Code style changes       | None         | 💄    |
| `refactor` | Code refactoring         | None         | ♻️    |
| `test`     | Tests                    | None         | 🧪    |
| `build`    | Build system             | None         | 🔧    |
| `ci`       | CI configuration         | None         | 👷    |
| `chore`    | Maintenance              | None         | 🏠    |
| `revert`   | Reverts                  | None         | ⏪    |

### Examples

```bash
# Features
git commit -m "feat: add dark mode toggle"
git commit -m "feat(auth): implement OAuth login"

# Fixes
git commit -m "fix: resolve memory leak in dashboard"
git commit -m "fix(api): handle timeout errors"

# Breaking changes
git commit -m "feat!: redesign user settings API"
git commit -m "feat: change API response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case"
```

## 🎨 Changelog Viewer

Access the beautiful changelog interface at `/changelog` in your application.

### Features

- **🔍 Search functionality** - Find specific changes
- **📂 Collapsible sections** - Expand/collapse versions
- **🏷️ Color-coded categories** - Visual change classification
- **🔗 Commit links** - Direct links to commits
- **📱 Responsive design** - Works on all devices

### Integration

```tsx
import { ChangelogViewer } from '@/components/changelog'

export default function ChangelogPage() {
  return (
    <div className="container mx-auto py-8">
      <ChangelogViewer className="mx-auto max-w-4xl" />
    </div>
  )
}
```

## 🛠️ Advanced Usage

### Release Scripts

The enhanced release script (`scripts/release.js`) provides:

```bash
# Different release types
node scripts/release.js patch
node scripts/release.js minor
node scripts/release.js major
node scripts/release.js prerelease --alpha

# Options
node scripts/release.js patch --dry-run  # Preview only
node scripts/release.js check           # Pre-release checks
```

### Release Notes Generator

Generate beautiful release notes (`scripts/release-notes.js`):

```bash
# Generate for current version
node scripts/release-notes.js

# Generate for specific version
node scripts/release-notes.js v1.2.0

# Save to file
node scripts/release-notes.js --save

# Custom options
node scripts/release-notes.js \
  --from v1.0.0 \
  --to v1.1.0 \
  --repo https://github.com/user/repo \
  --save
```

### Changelog Utilities

Maintain your changelog (`scripts/changelog-utils.js`):

```bash
# Validation
node scripts/changelog-utils.js validate

# Formatting
node scripts/changelog-utils.js format

# Backup management
node scripts/changelog-utils.js backup
node scripts/changelog-utils.js restore
node scripts/changelog-utils.js list-backups
node scripts/changelog-utils.js clean 5  # Keep last 5 backups

# Statistics
node scripts/changelog-utils.js stats

# Initialize new changelog
node scripts/changelog-utils.js init
```

## ⚙️ Configuration

### Version Configuration (`.versionrc.json`)

Controls changelog generation:

```json
{
  "types": [
    { "type": "feat", "section": "✨ Features" },
    { "type": "fix", "section": "🐛 Bug Fixes" }
  ],
  "commitUrlFormat": "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}",
  "compareUrlFormat": "{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}"
}
```

### Commit Linting (`commitlint.config.js`)

Enforces commit conventions:

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'ci',
        'build',
        'revert',
      ],
    ],
  },
}
```

## 🔄 GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and PR:

- 🎨 Linting (ESLint, Prettier)
- 🔍 Type checking (TypeScript)
- 🧪 Testing (Vitest)
- 🏗️ Building (Next.js)
- 📝 Commit message validation
- 🔐 Security audit
- 📦 Bundle size analysis

### Release Workflow (`.github/workflows/release.yml`)

Runs on main branch pushes:

- 📋 Change detection (analyzes commits)
- 🧪 Full CI pipeline
- 🚀 Automated versioning
- 📝 Changelog update
- 🏷️ Git tag creation
- 📋 GitHub Release creation
- 📢 Notifications

## 📚 Best Practices

### Commit Messages

1. **Use imperative mood**: "add feature" not "added feature"
2. **Be specific**: "fix login redirect" not "fix bug"
3. **Include scope**: "feat(auth): add OAuth support"
4. **Reference issues**: "fix: resolve #123"

### Release Management

1. **Regular releases**: Don't let changes accumulate too long
2. **Test thoroughly**: Use `release:check` before releasing
3. **Preview changes**: Use `release:dry-run` for safety
4. **Semantic versioning**: Follow SemVer principles
5. **Document breaking changes**: Be explicit about breaking changes

### Changelog Maintenance

1. **Validate regularly**: Use `changelog:validate`
2. **Keep it clean**: Use `changelog:format` for consistency
3. **Create backups**: Before major edits
4. **Review before release**: Ensure accuracy

## 🚨 Troubleshooting

### Common Issues

**Release fails with "working directory not clean"**

```bash
git status  # Check for uncommitted changes
git add . && git commit -m "chore: prepare for release"
```

**Changelog validation fails**

```bash
bun run changelog:validate  # See specific errors
bun run changelog:format    # Auto-fix formatting issues
```

**GitHub Actions workflow not triggering**

- Check branch protection rules
- Ensure conventional commit format
- Verify workflow permissions

**Missing commit links in changelog**

- Update repository URL in `.versionrc.json`
- Ensure commits have proper hash format

### Getting Help

1. **Check the logs**: Scripts provide detailed error messages
2. **Validate your setup**: Use `release:check`
3. **Review configuration**: Check `.versionrc.json` and `commitlint.config.js`
4. **Test in dry-run mode**: Preview changes before applying

## 🎉 Summary

This enhanced changelog and release system provides:

- ✅ **Automated workflows** for consistent releases
- ✅ **Beautiful UI** for viewing changes
- ✅ **Powerful tools** for maintenance
- ✅ **Professional output** with detailed release notes
- ✅ **Developer experience** with helpful scripts

The system is designed to be both powerful for maintainers and beautiful for users, ensuring your project's evolution is well-documented and professionally presented.

---

For more information, see:

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://conventionalcommits.org/)
