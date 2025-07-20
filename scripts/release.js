#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { execSync } = require('child_process')
const fs = require('fs')

/**
 * Enhanced Release Script
 * Provides interactive release management with better automation
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: msg =>
    console.log(`\n${colors.cyan}${colors.bright}🚀 ${msg}${colors.reset}\n`),
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    })
    return result
  } catch (error) {
    log.error(`Command failed: ${command}`)
    throw error
  }
}

function checkGitStatus() {
  log.info('Checking git status...')

  try {
    const status = runCommand('git status --porcelain', { silent: true })
    if (status.trim()) {
      log.error(
        'Working directory is not clean. Please commit or stash your changes first.'
      )
      process.exit(1)
    }
    log.success('Working directory is clean')
  } catch {
    log.error('Failed to check git status')
    process.exit(1)
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return packageJson.version
}

function preReleaseChecks() {
  log.title('Pre-release Checks')

  // Check git status
  checkGitStatus()

  // Run tests
  log.info('Running tests...')
  runCommand('bun test')
  log.success('Tests passed')

  // Run linting
  log.info('Running linter...')
  runCommand('bun run lint')
  log.success('Linting passed')

  // Check build
  log.info('Checking build...')
  runCommand('bun run build')
  log.success('Build successful')

  log.success('All pre-release checks passed!')
}

function performRelease(releaseType, options = {}) {
  const { dryRun = false, prerelease = false } = options

  log.title(`${dryRun ? 'DRY RUN: ' : ''}Performing ${releaseType} Release`)

  if (!dryRun) {
    preReleaseChecks()
  }

  const currentVersion = getCurrentVersion()
  log.info(`Current version: ${currentVersion}`)

  // Prepare standard-version command
  let releaseCommand = 'standard-version'

  if (releaseType === 'patch') {
    releaseCommand += ' --release-as patch'
  } else if (releaseType === 'minor') {
    releaseCommand += ' --release-as minor'
  } else if (releaseType === 'major') {
    releaseCommand += ' --release-as major'
  }

  if (prerelease) {
    releaseCommand += ' --prerelease'
  }

  if (dryRun) {
    releaseCommand += ' --dry-run'
  }

  // Run the release
  runCommand(releaseCommand)

  if (!dryRun) {
    const newVersion = getCurrentVersion()
    log.success(`Release completed! Version: ${currentVersion} → ${newVersion}`)

    log.info('Pushing to remote repository...')
    runCommand('git push --follow-tags origin main')
    log.success('Changes pushed to remote repository')

    log.title('Release Summary')
    console.log(`🎉 Successfully released version ${newVersion}`)
    console.log(`📝 Changelog has been updated`)
    console.log(`🏷️ Git tag created: v${newVersion}`)
    console.log(`🚀 Changes pushed to repository`)
  }
}

function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}🚀 Enhanced Release Script${colors.reset}

Usage: node scripts/release.js [command] [options]

Commands:
  patch       Create a patch release (0.0.1)
  minor       Create a minor release (0.1.0)
  major       Create a major release (1.0.0)
  prerelease  Create a prerelease (0.0.1-alpha.0)
  dry-run     Run release in dry-run mode
  check       Run pre-release checks only
  help        Show this help message

Options:
  --dry-run   Perform a dry run without making changes
  --alpha     Create an alpha prerelease
  --beta      Create a beta prerelease
  --rc        Create a release candidate

Examples:
  node scripts/release.js patch
  node scripts/release.js minor --dry-run
  node scripts/release.js prerelease --alpha
  node scripts/release.js check
`)
}

// Main execution
const args = process.argv.slice(2)
const command = args[0]
const isDryRun = args.includes('--dry-run')
const isBeta = args.includes('--beta')
const isRC = args.includes('--rc')

switch (command) {
  case 'patch':
  case 'minor':
  case 'major':
    performRelease(command, { dryRun: isDryRun })
    break

  case 'prerelease':
    let prereleaseType = 'alpha'
    if (isBeta) prereleaseType = 'beta'
    if (isRC) prereleaseType = 'rc'
    performRelease('prerelease', {
      dryRun: isDryRun,
      prerelease: prereleaseType,
    })
    break

  case 'dry-run':
    performRelease('patch', { dryRun: true })
    break

  case 'check':
    preReleaseChecks()
    break

  case 'help':
  case undefined:
    showHelp()
    break

  default:
    log.error(`Unknown command: ${command}`)
    showHelp()
    process.exit(1)
}
