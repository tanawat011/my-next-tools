#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs')
const path = require('path')

/**
 * Changelog Utilities
 * Tools for managing and validating changelog files
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
    console.log(`\n${colors.cyan}${colors.bright}📝 ${msg}${colors.reset}\n`),
}

const CHANGELOG_PATH = path.join(process.cwd(), 'CHANGELOG.md')
const BACKUP_DIR = path.join(process.cwd(), '.changelog-backups')

/**
 * Validate changelog format and structure
 */
function validateChangelog() {
  log.title('Validating Changelog')

  if (!fs.existsSync(CHANGELOG_PATH)) {
    log.error('CHANGELOG.md not found')
    return false
  }

  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8')
  const lines = content.split('\n')
  let isValid = true
  const issues = []

  // Check header
  if (!lines[0].startsWith('# Changelog')) {
    issues.push(
      'Missing or incorrect main heading (should start with "# Changelog")'
    )
    isValid = false
  }

  // Check for Keep a Changelog reference
  const hasKeepChangelogRef = content.includes('keepachangelog.com')
  if (!hasKeepChangelogRef) {
    issues.push('Missing Keep a Changelog reference')
  }

  // Check for semantic versioning reference
  const hasSemverRef = content.includes('semver.org')
  if (!hasSemverRef) {
    issues.push('Missing Semantic Versioning reference')
  }

  // Check version format
  const versionRegex = /^##\s+\[([^\]]+)\](?:\s+-\s+(.+))?$/
  let versionCount = 0
  let lineNumber = 0

  for (const line of lines) {
    lineNumber++

    if (line.match(versionRegex)) {
      versionCount++
      const match = line.match(versionRegex)
      const version = match[1]
      const date = match[2]

      // Check version format
      if (version !== 'Unreleased' && !version.match(/^\d+\.\d+\.\d+/)) {
        issues.push(
          `Line ${lineNumber}: Invalid version format "${version}" (should be semantic versioning)`
        )
        isValid = false
      }

      // Check date format for released versions
      if (
        version !== 'Unreleased' &&
        date &&
        !date.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        issues.push(
          `Line ${lineNumber}: Invalid date format "${date}" (should be YYYY-MM-DD)`
        )
        isValid = false
      }
    }

    // Check section headers (### ✨ Features)
    if (line.match(/^###\s+/)) {
      const validSections = [
        'Features',
        'Bug Fixes',
        'Performance Improvements',
        'Documentation',
        'Styles',
        'Code Refactoring',
        'Tests',
        'Build System',
        'CI',
        'Chores',
        'Reverts',
      ]

      const sectionText = line.replace(/^###\s+[^\w\s]*\s*/, '')
      if (!validSections.includes(sectionText)) {
        log.warning(`Line ${lineNumber}: Unusual section "${sectionText}"`)
      }
    }
  }

  if (versionCount === 0) {
    issues.push('No version sections found')
    isValid = false
  }

  // Report validation results
  if (isValid) {
    log.success('Changelog validation passed!')
    log.info(`Found ${versionCount} version sections`)
  } else {
    log.error('Changelog validation failed!')
    issues.forEach(issue => log.error(`  - ${issue}`))
  }

  if (issues.length > 0 && isValid) {
    log.warning('Validation warnings:')
    issues.forEach(issue => log.warning(`  - ${issue}`))
  }

  return isValid
}

/**
 * Format changelog for consistency
 */
function formatChangelog() {
  log.title('Formatting Changelog')

  if (!fs.existsSync(CHANGELOG_PATH)) {
    log.error('CHANGELOG.md not found')
    return false
  }

  // Create backup
  createBackup()

  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8')
  const lines = content.split('\n')
  const formattedLines = []

  let inCodeBlock = false
  let lastLineEmpty = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Track code blocks
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock
    }

    // Skip formatting inside code blocks
    if (inCodeBlock) {
      formattedLines.push(line)
      continue
    }

    // Skip multiple empty lines
    if (trimmed === '') {
      if (!lastLineEmpty) {
        formattedLines.push('')
        lastLineEmpty = true
      }
      continue
    }

    lastLineEmpty = false

    // Format headers with proper spacing
    if (trimmed.startsWith('#')) {
      if (
        formattedLines.length > 0 &&
        formattedLines[formattedLines.length - 1] !== ''
      ) {
        formattedLines.push('')
      }
      formattedLines.push(trimmed)
      continue
    }

    // Format list items
    if (trimmed.startsWith('- ')) {
      formattedLines.push(trimmed)
      continue
    }

    // Regular lines
    formattedLines.push(trimmed)
  }

  // Remove trailing empty lines
  while (
    formattedLines.length > 0 &&
    formattedLines[formattedLines.length - 1] === ''
  ) {
    formattedLines.pop()
  }

  // Add single trailing newline
  formattedLines.push('')

  const formattedContent = formattedLines.join('\n')
  fs.writeFileSync(CHANGELOG_PATH, formattedContent, 'utf8')

  log.success('Changelog formatted successfully!')
  return true
}

/**
 * Create a backup of the current changelog
 */
function createBackup() {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    log.error('CHANGELOG.md not found')
    return false
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backupPath = path.join(BACKUP_DIR, `CHANGELOG-${timestamp}.md`)

  fs.copyFileSync(CHANGELOG_PATH, backupPath)
  log.info(`Backup created: ${backupPath}`)

  return backupPath
}

/**
 * Restore changelog from backup
 */
function restoreFromBackup(backupFile = null) {
  if (!fs.existsSync(BACKUP_DIR)) {
    log.error('No backup directory found')
    return false
  }

  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('CHANGELOG-') && file.endsWith('.md'))
    .sort()
    .reverse()

  if (backups.length === 0) {
    log.error('No backups found')
    return false
  }

  const backupToRestore = backupFile || backups[0]
  const backupPath = path.join(BACKUP_DIR, backupToRestore)

  if (!fs.existsSync(backupPath)) {
    log.error(`Backup file not found: ${backupToRestore}`)
    return false
  }

  fs.copyFileSync(backupPath, CHANGELOG_PATH)
  log.success(`Changelog restored from backup: ${backupToRestore}`)

  return true
}

/**
 * List available backups
 */
function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    log.info('No backup directory found')
    return []
  }

  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('CHANGELOG-') && file.endsWith('.md'))
    .sort()
    .reverse()

  if (backups.length === 0) {
    log.info('No backups found')
    return []
  }

  log.info('Available backups:')
  backups.forEach((backup, index) => {
    const stats = fs.statSync(path.join(BACKUP_DIR, backup))
    log.info(`  ${index + 1}. ${backup} (${stats.mtime.toLocaleString()})`)
  })

  return backups
}

/**
 * Clean old backups (keep only last N)
 */
function cleanBackups(keepCount = 10) {
  if (!fs.existsSync(BACKUP_DIR)) {
    log.info('No backup directory found')
    return
  }

  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('CHANGELOG-') && file.endsWith('.md'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime)

  if (backups.length <= keepCount) {
    log.info(
      `No cleanup needed (${backups.length} backups, keeping ${keepCount})`
    )
    return
  }

  const toDelete = backups.slice(keepCount)

  log.info(`Cleaning up ${toDelete.length} old backups...`)
  toDelete.forEach(backup => {
    fs.unlinkSync(backup.path)
    log.info(`  Deleted: ${backup.name}`)
  })

  log.success(`Cleanup complete. Kept ${keepCount} most recent backups.`)
}

/**
 * Initialize a new changelog
 */
function initChangelog() {
  if (fs.existsSync(CHANGELOG_PATH)) {
    log.error('CHANGELOG.md already exists')
    return false
  }

  const template = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Features

### 🐛 Bug Fixes

### 🔧 Build System

## [0.1.0] - ${new Date().toISOString().split('T')[0]}

### ✨ Features

- Initial release
`

  fs.writeFileSync(CHANGELOG_PATH, template, 'utf8')
  log.success('CHANGELOG.md created successfully!')

  return true
}

/**
 * Show changelog statistics
 */
function showStats() {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    log.error('CHANGELOG.md not found')
    return false
  }

  log.title('Changelog Statistics')

  const content = fs.readFileSync(CHANGELOG_PATH, 'utf8')
  const lines = content.split('\n')

  const stats = {
    totalLines: lines.length,
    versions: 0,
    sections: 0,
    entries: 0,
    lastModified: fs.statSync(CHANGELOG_PATH).mtime,
  }

  for (const line of lines) {
    if (line.match(/^##\s+\[/)) stats.versions++
    if (line.match(/^###\s+/)) stats.sections++
    if (line.match(/^-\s+/)) stats.entries++
  }

  log.info(`📄 Total lines: ${stats.totalLines}`)
  log.info(`🏷️ Versions: ${stats.versions}`)
  log.info(`📋 Sections: ${stats.sections}`)
  log.info(`📝 Entries: ${stats.entries}`)
  log.info(`📅 Last modified: ${stats.lastModified.toLocaleString()}`)

  return stats
}

function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}📝 Changelog Utilities${colors.reset}

Usage: node scripts/changelog-utils.js <command> [options]

Commands:
  validate              Validate changelog format and structure
  format                Format changelog for consistency
  backup                Create a backup of the current changelog
  restore [backup]      Restore changelog from backup (latest if not specified)
  list-backups          List available backups
  clean [count]         Clean old backups (keep last N, default: 10)
  init                  Initialize a new changelog
  stats                 Show changelog statistics
  help                  Show this help message

Examples:
  node scripts/changelog-utils.js validate
  node scripts/changelog-utils.js format
  node scripts/changelog-utils.js backup
  node scripts/changelog-utils.js restore
  node scripts/changelog-utils.js clean 5
`)
}

// Main execution
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'validate':
    validateChangelog()
    break

  case 'format':
    formatChangelog()
    break

  case 'backup':
    createBackup()
    break

  case 'restore':
    restoreFromBackup(args[1])
    break

  case 'list-backups':
    listBackups()
    break

  case 'clean':
    const keepCount = args[1] ? parseInt(args[1]) : 10
    cleanBackups(keepCount)
    break

  case 'init':
    initChangelog()
    break

  case 'stats':
    showStats()
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
