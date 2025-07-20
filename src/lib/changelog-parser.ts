import fs from 'fs'
import path from 'path'

interface ChangelogEntry {
  version: string
  date: string
  changes: ChangeCategory[]
  isUnreleased?: boolean
}

interface ChangeCategory {
  type: string
  section: string
  emoji: string
  items: ChangeItem[]
}

interface ChangeItem {
  description: string
  commitHash?: string
  commitUrl?: string
}

/**
 * Parse CHANGELOG.md file and return structured data
 */
export function parseChangelog(): ChangelogEntry[] {
  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md')
    const content = fs.readFileSync(changelogPath, 'utf-8')

    return parseChangelogContent(content)
  } catch (error) {
    console.error('Error reading CHANGELOG.md:', error)
    return []
  }
}

/**
 * Parse changelog content string into structured data
 */
export function parseChangelogContent(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []
  const lines = content.split('\n')

  let currentEntry: ChangelogEntry | null = null
  let currentCategory: ChangeCategory | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and header
    if (!line || (line.startsWith('#') && !line.match(/^##\s+\[/))) {
      continue
    }

    // Version headers (## [1.0.0] - 2023-01-01)
    const versionMatch = line.match(/^##\s+\[([^\]]+)\](?:\s+-\s+(.+))?/)
    if (versionMatch) {
      // Save previous entry if exists
      if (currentEntry) {
        entries.push(currentEntry)
      }

      const version = versionMatch[1]
      const date = versionMatch[2] || ''

      currentEntry = {
        version,
        date,
        changes: [],
        isUnreleased: version.toLowerCase() === 'unreleased',
      }
      currentCategory = null
      continue
    }

    // Category headers (### ✨ Features)
    const categoryMatch = line.match(/^###\s+(.+)/)
    if (categoryMatch && currentEntry) {
      const fullSection = categoryMatch[1]
      const emoji = fullSection.match(/^([^\w\s]+)\s*/)?.[1] || ''
      const section = fullSection.replace(/^[^\w\s]*\s*/, '')

      currentCategory = {
        type: getCategoryType(section),
        section,
        emoji,
        items: [],
      }
      currentEntry.changes.push(currentCategory)
      continue
    }

    // Change items (- Description ([commit](url)))
    const itemMatch = line.match(/^-\s+(.+)/)
    if (itemMatch && currentCategory) {
      const description = itemMatch[1]

      // Extract commit hash and URL if present
      const commitMatch = description.match(/\[([a-f0-9]+)\]\(([^)]+)\)/)
      let cleanDescription = description
      let commitHash: string | undefined
      let commitUrl: string | undefined

      if (commitMatch) {
        commitHash = commitMatch[1]
        commitUrl = commitMatch[2]
        cleanDescription = description.replace(/\s*\([^)]*\)\s*$/, '').trim()
      }

      currentCategory.items.push({
        description: cleanDescription,
        commitHash,
        commitUrl,
      })
    }
  }

  // Don't forget the last entry
  if (currentEntry) {
    entries.push(currentEntry)
  }

  return entries
}

/**
 * Map section names to category types
 */
function getCategoryType(section: string): string {
  const sectionLower = section.toLowerCase()

  if (sectionLower.includes('feature')) return 'feat'
  if (sectionLower.includes('fix') || sectionLower.includes('bug')) return 'fix'
  if (sectionLower.includes('performance')) return 'perf'
  if (sectionLower.includes('documentation') || sectionLower.includes('docs'))
    return 'docs'
  if (sectionLower.includes('style')) return 'style'
  if (sectionLower.includes('refactor')) return 'refactor'
  if (sectionLower.includes('test')) return 'test'
  if (sectionLower.includes('build')) return 'build'
  if (sectionLower.includes('ci')) return 'ci'
  if (sectionLower.includes('chore')) return 'chore'
  if (sectionLower.includes('revert')) return 'revert'

  return 'chore'
}

/**
 * Get changelog data for client-side use (returns serializable data)
 */
export function getChangelogData(): ChangelogEntry[] {
  const entries = parseChangelog()

  // Ensure all data is serializable (no undefined values)
  return entries.map(entry => ({
    ...entry,
    changes: entry.changes.map(category => ({
      ...category,
      items: category.items.map(item => ({
        description: item.description,
        commitHash: item.commitHash || undefined,
        commitUrl: item.commitUrl || undefined,
      })),
    })),
  }))
}
