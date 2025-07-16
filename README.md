# My Next Tools

A Next.js 15 project with modern tooling and best practices.

## Development

### Getting Started

```bash
bun install
bun dev
```

### Commit Messages & Changelog

This project uses conventional commits with emoji support for better commit messages and automatic changelog generation.

#### Making Commits

Use the following command to create properly formatted commits:

```bash
bun run commit
```

This will guide you through creating conventional commits with appropriate emojis:

- 🎨 **style** - Improving structure/format of code
- ⚡️ **perf** - Improving performance
- 🔥 **prune** - Removing code or files
- 🐛 **fix** - Fixing a bug
- 🚑 **quickfix** - Critical hotfix
- ✨ **feature** - Introducing new features
- 📝 **docs** - Writing docs
- And many more!

#### Changelog Management

- **Generate initial changelog**: `bun run changelog:generate`
- **Update changelog with new commits**: `bun run changelog:update`
- **Create a new release**: `bun run release`
- **Preview release changes**: `bun run release:dry-run`

The changelog is automatically generated from your commit messages following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

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
