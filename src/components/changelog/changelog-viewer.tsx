'use client'

import {
  GitCommitHorizontal,
  Tag,
  Calendar,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Bug,
  Zap,
  FileText,
  Palette,
  RefreshCw,
  TestTube,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import { useState, useEffect } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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

interface ChangelogViewerProps {
  className?: string
  maxHeight?: string
}

const sectionIcons = {
  Features: Sparkles,
  'Bug Fixes': Bug,
  'Performance Improvements': Zap,
  Documentation: FileText,
  Styles: Palette,
  'Code Refactoring': RefreshCw,
  Tests: TestTube,
  'Build System': Settings,
  CI: Settings,
  Chores: Settings,
  Reverts: ArrowLeft,
}

const sectionColors = {
  Features: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Bug Fixes': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Performance Improvements':
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Documentation:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Styles:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Code Refactoring':
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  Tests: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Build System':
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  CI: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  Chores: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  Reverts:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

// Mock data - in a real app, this would come from parsing CHANGELOG.md or an API
const mockChangelog: ChangelogEntry[] = [
  {
    version: 'Unreleased',
    date: '',
    isUnreleased: true,
    changes: [
      {
        type: 'feat',
        section: 'Features',
        emoji: '✨',
        items: [
          {
            description: 'Add automatic changelog generation',
            commitHash: '32166bf',
            commitUrl:
              'https://github.com/tanawat011/my-next-tools/commit/32166bf0c45e77d41160856c6d8e73103591240a',
          },
        ],
      },
      {
        type: 'build',
        section: 'Build System',
        emoji: '🔧',
        items: [
          {
            description: 'Emoji support for commit messages via `cz-emoji`',
          },
          {
            description: 'Automated versioning with `standard-version`',
          },
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2025-07-16',
    changes: [
      {
        type: 'feat',
        section: 'Features',
        emoji: '✨',
        items: [
          {
            description: 'Authentication system',
            commitHash: '3796428',
            commitUrl:
              'https://github.com/tanawat011/my-next-tools/commit/3796428d716c6b45a0242d464f1c2247ae68c034',
          },
        ],
      },
      {
        type: 'build',
        section: 'Build System',
        emoji: '🔧',
        items: [
          {
            description:
              'Initial project setup with Next.js 15, TypeScript, and Tailwind CSS',
          },
          {
            description:
              'Configured ESLint, Prettier, and Husky for code quality',
          },
          {
            description: 'Added Commitizen for standardized commit messages',
          },
          {
            description: 'Set up testing with Vitest and React Testing Library',
          },
        ],
      },
    ],
  },
]

export function ChangelogViewer({
  className,
  maxHeight = '600px',
}: ChangelogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set(['Unreleased'])
  )
  const [filteredChangelog, setFilteredChangelog] =
    useState<ChangelogEntry[]>(mockChangelog)

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChangelog(mockChangelog)
      return
    }

    const filtered = mockChangelog
      .map(entry => ({
        ...entry,
        changes: entry.changes
          .map(category => ({
            ...category,
            items: category.items.filter(item =>
              item.description.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          }))
          .filter(category => category.items.length > 0),
      }))
      .filter(entry => entry.changes.length > 0)

    setFilteredChangelog(filtered)
  }, [searchTerm])

  const toggleVersionExpanded = (version: string) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(version)) {
      newExpanded.delete(version)
    } else {
      newExpanded.add(version)
    }
    setExpandedVersions(newExpanded)
  }

  const getSectionIcon = (sectionName: string) => {
    const cleanSection = sectionName.replace(/^[^\w\s]*\s*/, '') // Remove emoji prefix
    return sectionIcons[cleanSection as keyof typeof sectionIcons] || Settings
  }

  const getSectionColor = (sectionName: string) => {
    const cleanSection = sectionName.replace(/^[^\w\s]*\s*/, '') // Remove emoji prefix
    return (
      sectionColors[cleanSection as keyof typeof sectionColors] ||
      sectionColors['Chores']
    )
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <GitCommitHorizontal className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Changelog</h2>
            <p className="text-muted-foreground">
              All notable changes to this project are documented here
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search changelog entries..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Changelog entries */}
      <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight }}>
        {filteredChangelog.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="space-y-2 text-center">
                <Search className="text-muted-foreground mx-auto h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  No changelog entries found matching &quot;{searchTerm}&quot;
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredChangelog.map(entry => {
            const isExpanded = expandedVersions.has(entry.version)

            return (
              <Card key={entry.version} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVersionExpanded(entry.version)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Tag className="text-muted-foreground h-4 w-4" />
                        <CardTitle className="text-xl">
                          {entry.isUnreleased ? (
                            <Badge
                              variant="secondary"
                              className="font-semibold"
                            >
                              {entry.version}
                            </Badge>
                          ) : (
                            `v${entry.version}`
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    {entry.date && (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {entry.date}
                      </div>
                    )}
                  </div>
                  {!isExpanded && (
                    <CardDescription>
                      {entry.changes.reduce(
                        (total, category) => total + category.items.length,
                        0
                      )}{' '}
                      changes
                    </CardDescription>
                  )}
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {entry.changes.map(category => {
                        const IconComponent = getSectionIcon(category.section)
                        const colorClass = getSectionColor(category.section)

                        return (
                          <div key={category.type} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <Badge variant="outline" className={colorClass}>
                                {category.emoji} {category.section}
                              </Badge>
                              <span className="text-muted-foreground text-xs">
                                {category.items.length}{' '}
                                {category.items.length === 1
                                  ? 'change'
                                  : 'changes'}
                              </span>
                            </div>
                            <ul className="ml-6 space-y-2">
                              {category.items.map((item, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-3 text-sm"
                                >
                                  <div className="bg-muted-foreground/50 mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                                  <div className="flex-1">
                                    <p className="text-foreground">
                                      {item.description}
                                    </p>
                                    {item.commitHash && item.commitUrl && (
                                      <div className="mt-1 flex items-center gap-2">
                                        <Badge
                                          variant="secondary"
                                          className="px-1.5 py-0.5 text-xs"
                                        >
                                          <GitCommitHorizontal className="mr-1 h-3 w-3" />
                                          {item.commitHash}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-auto p-0 text-xs"
                                          asChild
                                        >
                                          <a
                                            href={item.commitUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1"
                                          >
                                            View commit
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                            {category !==
                              entry.changes[entry.changes.length - 1] && (
                              <Separator className="my-4" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
