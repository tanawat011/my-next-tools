'use client'

import { Search, Filter, X, Shield, UserCheck, UserX } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select'
import { type UserFilters } from '@/hooks/use-users'

interface UsersFiltersProps {
  onFilterChange: (filters: UserFilters) => void
}

const roleOptions: MultiSelectOption[] = [
  { value: 'user', label: 'User', icon: UserCheck },
  { value: 'admin', label: 'Admin', icon: Shield },
  { value: 'superadmin', label: 'Super Admin', icon: Shield },
]

const statusOptions: MultiSelectOption[] = [
  { value: 'active', label: 'Active', icon: UserCheck },
  { value: 'inactive', label: 'Inactive', icon: UserX },
]

const providerOptions: MultiSelectOption[] = [
  { value: 'credentials', label: 'Email/Password' },
  { value: 'google', label: 'Google' },
]

export function UsersFilters({ onFilterChange }: UsersFiltersProps) {
  const [search, setSearch] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    updateFilters({ search: value })
  }

  const handleRolesChange = (roles: string[]) => {
    setSelectedRoles(roles)
    updateFilters({ roles })
  }

  const handleStatusesChange = (statuses: string[]) => {
    setSelectedStatuses(statuses)
    updateFilters({ statuses })
  }

  const handleProvidersChange = (providers: string[]) => {
    setSelectedProviders(providers)
    updateFilters({ providers })
  }

  const updateFilters = (newFilters: Partial<UserFilters>) => {
    onFilterChange({
      search: search,
      roles: selectedRoles,
      statuses: selectedStatuses,
      providers: selectedProviders,
      ...newFilters,
    })
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedRoles([])
    setSelectedStatuses([])
    setSelectedProviders([])
    onFilterChange({})
  }

  const hasActiveFilters =
    search ||
    selectedRoles.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedProviders.length > 0

  const activeFiltersCount =
    (search ? 1 : 0) +
    (selectedRoles.length > 0 ? 1 : 0) +
    (selectedStatuses.length > 0 ? 1 : 0) +
    (selectedProviders.length > 0 ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-64 pl-10"
          />
        </div>

        {/* Role Filter */}
        <MultiSelect
          options={roleOptions}
          selected={selectedRoles}
          onChange={handleRolesChange}
          placeholder="Select roles..."
          className="w-[180px]"
        />

        {/* Status Filter */}
        <MultiSelect
          options={statusOptions}
          selected={selectedStatuses}
          onChange={handleStatusesChange}
          placeholder="Select status..."
          className="w-[160px]"
        />

        {/* Provider Filter */}
        <MultiSelect
          options={providerOptions}
          selected={selectedProviders}
          onChange={handleProvidersChange}
          placeholder="Select providers..."
          className="w-[180px]"
        />

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Summary */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Filter className="h-4 w-4" />
        <span>
          {hasActiveFilters
            ? `${activeFiltersCount} active filter${activeFiltersCount !== 1 ? 's' : ''}`
            : 'No active filters'}
        </span>
      </div>
    </div>
  )
}
