# My Next Tools

A Next.js 15 project with modern tooling and best practices.

## Development

### Getting Started

```bash
bun install
bun dev
```

### 📝 Enhanced Changelog & Release System

This project features a comprehensive changelog and release system with automated workflows, beautiful UI components, and powerful management tools.

#### 🚀 Quick Release Commands

```bash
# Create releases (skip git hooks for speed)
bun run release:patch    # 0.1.0 → 0.1.1
bun run release:minor    # 0.1.0 → 0.2.0
bun run release:major    # 0.1.0 → 1.0.0

# Include git hooks (when needed)
bun run release:patch:no-hooks
bun run release:minor:no-hooks
bun run release:major:no-hooks

# Prereleases
bun run release:alpha    # 0.1.0 → 0.1.1-alpha.0
bun run release:beta     # 0.1.0 → 0.1.1-beta.0
bun run release:rc       # 0.1.0 → 0.1.1-rc.0

# Safety checks
bun run release:dry-run  # Preview changes
bun run release:check    # Run all pre-release checks
```

#### 📋 Changelog Management

```bash
# Validation & formatting
bun run changelog:validate  # Check format
bun run changelog:format    # Auto-format
bun run changelog:backup    # Create backup
bun run changelog:stats     # Show statistics

# Release notes
bun run release:notes       # Generate release notes
bun run release:notes:save  # Save to file
```

#### 🎨 Beautiful Changelog Viewer

Access the interactive changelog at `/changelog` with:

- 🔍 Search functionality
- 📂 Collapsible sections
- 🏷️ Color-coded categories
- 🔗 Direct commit links

#### ✨ Automated Workflows

- **GitHub Actions** automatically handle releases on main branch pushes
- **Smart version detection** based on conventional commits
- **Professional release notes** with contributor attribution
- **Comprehensive CI/CD** with testing, linting, and security checks

📖 **Full documentation**:

- [CHANGELOG_GUIDE.md](./CHANGELOG_GUIDE.md) - Complete usage instructions
- [RELEASE_HOOKS.md](./RELEASE_HOOKS.md) - Git hooks configuration and control

#### Making Commits

Use conventional commits for automatic changelog generation:

```bash
bun run commit  # Interactive commit helper
```

**Examples:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login redirect issue"
git commit -m "feat!: redesign API (BREAKING CHANGE)"
```

### Other Scripts

- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run test` - Run tests
- `bun run build` - Build for production

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint, Prettier, Husky
- **Commit Standards**: Commitizen + cz-emoji
- **Changelog**: conventional-changelog-cli + standard-version
