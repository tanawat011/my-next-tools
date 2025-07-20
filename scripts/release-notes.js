#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

/**
 * Automated Release Notes Generator
 * Creates beautiful GitHub-style release notes from commit history
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

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    })
    return result.trim()
  } catch (error) {
    if (!options.allowError) {
      log.error(`Command failed: ${command}`)
      throw error
    }
    return ''
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return packageJson.version
}

function getLastTag() {
  return runCommand('git describe --tags --abbrev=0 2>/dev/null || echo ""', {
    silent: true,
    allowError: true,
  })
}

function getCommitsSinceTag(fromTag, toRef = 'HEAD') {
  let command
  if (!fromTag) {
    command = `git log --oneline --pretty=format:"%H|%s|%an|%ad" --date=short ${toRef}`
  } else {
    command = `git log ${fromTag}..${toRef} --oneline --pretty=format:"%H|%s|%an|%ad" --date=short`
  }

  const output = runCommand(command, { silent: true, allowError: true })
  if (!output) return []

  return output.split('\n').map(line => {
    const [hash, subject, author, date] = line.split('|')
    return { hash: hash?.slice(0, 7), subject, author, date }
  })
}

function categorizeCommits(commits) {
  const categories = {
    breaking: { title: '🚨 BREAKING CHANGES', emoji: '🚨', commits: [] },
    features: { title: '✨ Features', emoji: '✨', commits: [] },
    fixes: { title: '🐛 Bug Fixes', emoji: '🐛', commits: [] },
    performance: {
      title: '⚡ Performance Improvements',
      emoji: '⚡',
      commits: [],
    },
    docs: { title: '📚 Documentation', emoji: '📚', commits: [] },
    styles: { title: '💄 Styles', emoji: '💄', commits: [] },
    refactor: { title: '♻️ Code Refactoring', emoji: '♻️', commits: [] },
    tests: { title: '🧪 Tests', emoji: '🧪', commits: [] },
    build: { title: '🔧 Build System', emoji: '🔧', commits: [] },
    ci: { title: '👷 CI/CD', emoji: '👷', commits: [] },
    chores: { title: '🏠 Chores', emoji: '🏠', commits: [] },
    reverts: { title: '⏪ Reverts', emoji: '⏪', commits: [] },
    other: { title: '📦 Other Changes', emoji: '📦', commits: [] },
  }

  commits.forEach(commit => {
    const subject = commit.subject.toLowerCase()
    const isBreaking =
      subject.includes('!') || subject.includes('breaking change')

    if (isBreaking) {
      categories.breaking.commits.push(commit)
    } else if (subject.match(/^(feat|feature)(\(.+\))?:/)) {
      categories.features.commits.push(commit)
    } else if (subject.match(/^fix(\(.+\))?:/)) {
      categories.fixes.commits.push(commit)
    } else if (subject.match(/^perf(\(.+\))?:/)) {
      categories.performance.commits.push(commit)
    } else if (subject.match(/^docs?(\(.+\))?:/)) {
      categories.docs.commits.push(commit)
    } else if (subject.match(/^style(\(.+\))?:/)) {
      categories.styles.commits.push(commit)
    } else if (subject.match(/^refactor(\(.+\))?:/)) {
      categories.refactor.commits.push(commit)
    } else if (subject.match(/^test(\(.+\))?:/)) {
      categories.tests.commits.push(commit)
    } else if (subject.match(/^build(\(.+\))?:/)) {
      categories.build.commits.push(commit)
    } else if (subject.match(/^ci(\(.+\))?:/)) {
      categories.ci.commits.push(commit)
    } else if (subject.match(/^chore(\(.+\))?:/)) {
      categories.chores.commits.push(commit)
    } else if (subject.match(/^revert(\(.+\))?:/)) {
      categories.reverts.commits.push(commit)
    } else {
      categories.other.commits.push(commit)
    }
  })

  return categories
}

function generateContributors(commits) {
  const contributorMap = new Map()

  commits.forEach(commit => {
    if (commit.author && !commit.author.includes('github-actions')) {
      if (contributorMap.has(commit.author)) {
        contributorMap.set(commit.author, contributorMap.get(commit.author) + 1)
      } else {
        contributorMap.set(commit.author, 1)
      }
    }
  })

  return Array.from(contributorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([author, count]) => ({ author, count }))
}

function formatCommitForRelease(commit) {
  // Clean up the commit subject
  let subject = commit.subject

  // Remove conventional commit prefix for cleaner display
  subject = subject.replace(
    /^(feat|feature|fix|docs?|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?:\s*/,
    ''
  )

  // Capitalize first letter
  subject = subject.charAt(0).toUpperCase() + subject.slice(1)

  return {
    ...commit,
    cleanSubject: subject,
  }
}

function generateMarkdownReleaseNotes(
  version,
  fromTag,
  toRef = 'HEAD',
  options = {}
) {
  const {
    includeCommitLinks = true,
    includeContributors = true,
    repositoryUrl = '',
  } = options

  log.info(`Generating release notes for ${version}...`)

  const commits = getCommitsSinceTag(fromTag, toRef)
  if (commits.length === 0) {
    log.warning('No commits found for release notes')
    return ''
  }

  log.info(`Found ${commits.length} commits`)

  const categorizedCommits = categorizeCommits(commits)
  const contributors = generateContributors(commits)

  const releaseNotes = []

  // Header
  const releaseTitle = version.startsWith('v') ? version : `v${version}`
  releaseNotes.push(`# 🚀 Release ${releaseTitle}`)
  releaseNotes.push('')

  // Summary
  const totalCommits = commits.length
  const totalContributors = contributors.length
  releaseNotes.push(`## 📊 Release Summary`)
  releaseNotes.push('')
  releaseNotes.push(`- **${totalCommits}** commits`)
  releaseNotes.push(
    `- **${totalContributors}** contributor${totalContributors !== 1 ? 's' : ''}`
  )
  releaseNotes.push('')

  // Changes by category
  releaseNotes.push("## 📋 What's Changed")
  releaseNotes.push('')

  Object.values(categorizedCommits).forEach(category => {
    if (category.commits.length > 0) {
      releaseNotes.push(`### ${category.title}`)
      releaseNotes.push('')

      category.commits.forEach(commit => {
        const formattedCommit = formatCommitForRelease(commit)
        let line = `- ${formattedCommit.cleanSubject}`

        if (includeCommitLinks && repositoryUrl && commit.hash) {
          line += ` ([${commit.hash}](${repositoryUrl}/commit/${commit.hash}))`
        }

        releaseNotes.push(line)
      })
      releaseNotes.push('')
    }
  })

  // Contributors section
  if (includeContributors && contributors.length > 0) {
    releaseNotes.push('## 👥 Contributors')
    releaseNotes.push('')
    releaseNotes.push(
      'We thank the following contributors for their work on this release:'
    )
    releaseNotes.push('')

    contributors.forEach(({ author, count }) => {
      const commitText = count === 1 ? 'commit' : 'commits'
      releaseNotes.push(`- **${author}** (${count} ${commitText})`)
    })
    releaseNotes.push('')
  }

  // Footer
  if (fromTag && repositoryUrl) {
    const compareUrl = `${repositoryUrl}/compare/${fromTag}...${releaseTitle}`
    releaseNotes.push('---')
    releaseNotes.push('')
    releaseNotes.push(`**Full Changelog**: ${compareUrl}`)
  }

  return releaseNotes.join('\n')
}

function saveReleaseNotes(content, version, outputDir = '.') {
  const filename = `release-notes-${version}.md`
  const filepath = path.join(outputDir, filename)

  fs.writeFileSync(filepath, content, 'utf8')
  log.success(`Release notes saved to ${filepath}`)

  return filepath
}

function showHelp() {
  console.log(`
${colors.cyan}${colors.bright}📝 Release Notes Generator${colors.reset}

Usage: node scripts/release-notes.js [version] [options]

Arguments:
  version         Version for the release notes (default: current package.json version)

Options:
  --from <tag>    Generate notes from this tag (default: last git tag)
  --to <ref>      Generate notes to this ref (default: HEAD)
  --output <dir>  Output directory (default: current directory)
  --repo <url>    Repository URL for commit links
  --format <fmt>  Output format: markdown (default), json
  --no-links      Don't include commit links
  --no-contributors Don't include contributors section
  --save          Save to file
  --help          Show this help message

Examples:
  node scripts/release-notes.js
  node scripts/release-notes.js v1.2.0 --save
  node scripts/release-notes.js --from v1.0.0 --to v1.1.0
  node scripts/release-notes.js --repo https://github.com/user/repo --save
`)
}

// Main execution
const args = process.argv.slice(2)
const version = args.find(arg => !arg.startsWith('--')) || getCurrentVersion()

const options = {
  from: args.includes('--from')
    ? args[args.indexOf('--from') + 1]
    : getLastTag(),
  to: args.includes('--to') ? args[args.indexOf('--to') + 1] : 'HEAD',
  output: args.includes('--output') ? args[args.indexOf('--output') + 1] : '.',
  repo: args.includes('--repo') ? args[args.indexOf('--repo') + 1] : '',
  format: args.includes('--format')
    ? args[args.indexOf('--format') + 1]
    : 'markdown',
  includeLinks: !args.includes('--no-links'),
  includeContributors: !args.includes('--no-contributors'),
  save: args.includes('--save'),
  help: args.includes('--help'),
}

if (options.help) {
  showHelp()
  process.exit(0)
}

try {
  log.title('Release Notes Generator')

  const releaseNotes = generateMarkdownReleaseNotes(
    version,
    options.from,
    options.to,
    {
      includeCommitLinks: options.includeLinks,
      includeContributors: options.includeContributors,
      repositoryUrl: options.repo,
    }
  )

  if (options.save) {
    saveReleaseNotes(releaseNotes, version, options.output)
  } else {
    console.log('\n' + releaseNotes)
  }

  log.success('Release notes generated successfully!')
} catch (error) {
  log.error(`Failed to generate release notes: ${error.message}`)
  process.exit(1)
}
