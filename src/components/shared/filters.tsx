'use client'

import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import { ReactNode, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export type FilterValue =
  | string
  | string[]
  | number
  | boolean
  | null
  | undefined

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'search' | 'daterange' | 'custom'
  options?: FilterOption[]
  placeholder?: string
  render?: (
    value: FilterValue,
    onChange: (value: FilterValue) => void
  ) => ReactNode
}

export interface FiltersProps {
  title?: string
  searchPlaceholder?: string
  filters: FilterConfig[]
  values: Record<string, FilterValue>
  onFilterChange: (filters: Record<string, FilterValue>) => void
  onClear?: () => void
  className?: string
  collapsible?: boolean
  showActiveCount?: boolean
}

export function Filters({
  title = 'Filters',
  searchPlaceholder = 'Search...',
  filters,
  values,
  onFilterChange,
  onClear,
  className,
  collapsible = false,
  showActiveCount = true,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(!collapsible)

  const handleFilterChange = (key: string, value: FilterValue) => {
    onFilterChange({
      ...values,
      [key]: value,
    })
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      const clearedFilters = Object.keys(values).reduce(
        (acc, key) => {
          acc[key] = ''
          return acc
        },
        {} as Record<string, FilterValue>
      )
      onFilterChange(clearedFilters)
    }
  }

  const getActiveFiltersCount = () => {
    return Object.values(values).filter(
      value => value && value !== '' && value !== 'all'
    ).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key]

    switch (filter.type) {
      case 'search':
        return (
          <div className="relative min-w-[250px] flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder={filter.placeholder || searchPlaceholder}
              value={String(value || '')}
              onChange={e => handleFilterChange(filter.key, e.target.value)}
              className="pl-10"
            />
          </div>
        )

      case 'select':
        return (
          <Select
            value={String(value || 'all')}
            onValueChange={val =>
              handleFilterChange(filter.key, val === 'all' ? '' : val)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex w-full items-center justify-between">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <Badge variant="secondary" className="ml-2">
                        {option.count}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'custom':
        return filter.render?.(value, val =>
          handleFilterChange(filter.key, val)
        )

      default:
        return null
    }
  }

  const FiltersContent = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {filters.map(filter => (
          <div key={filter.key} className="flex items-center gap-2">
            {filter.type !== 'search' && (
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {filter.label}:
              </span>
            )}
            {renderFilter(filter)}
          </div>
        ))}
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
          {showActiveCount && (
            <Badge variant="secondary">
              {activeFiltersCount} active filter
              {activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}
    </div>
  )

  if (collapsible) {
    return (
      <Card className={className}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {title}
                  {showActiveCount && activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </CardTitle>
                <SlidersHorizontal className="h-4 w-4" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <FiltersContent />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          {title}
          {showActiveCount && activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FiltersContent />
      </CardContent>
    </Card>
  )
}
