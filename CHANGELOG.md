# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Features

- Add automatic changelog generation ([32166bf](https://github.com/tanawat011/my-next-tools/commit/32166bf0c45e77d41160856c6d8e73103591240a))
  - Added conventional-changelog-cli for automatic changelog generation
  - Added standard-version for automated versioning and releases
  - Created .versionrc.json for emoji-friendly changelog sections
  - Updated README.md with changelog and commit instructions
  - Created initial CHANGELOG.md with proper formatting

### 🔧 Build System

- Emoji support for commit messages via `cz-emoji`
- Automated versioning with `standard-version`

## [0.1.0] - 2025-07-16

### ✨ Features

- **component:** authentication system ([3796428](https://github.com/tanawat011/my-next-tools/commit/3796428d716c6b45a0242d464f1c2247ae68c034))

### 🔧 Build System

- Initial project setup with Next.js 15, TypeScript, and Tailwind CSS
- Configured ESLint, Prettier, and Husky for code quality
- Added Commitizen for standardized commit messages
- Set up testing with Vitest and React Testing Library
