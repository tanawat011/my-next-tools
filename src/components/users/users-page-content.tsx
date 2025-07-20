'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { UserStats } from '@/components/users/user-stats'
import { UsersDataTable } from '@/components/users/users-data-table'
import { UsersFilters } from '@/components/users/users-filters'
import { useUsers, type UserFilters } from '@/hooks/use-users'

import { CreateUserDialog } from './create-user-dialog'

export function UsersPageContent() {
  const [filters, setFilters] = useState<UserFilters>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { users, hasMore, isLoading, error, loadMore, refetch } = useUsers(
    filters,
    20
  )

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters)
  }

  const handleCreateUser = () => {
    setShowCreateDialog(true)
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading users</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Users Management"
        subtitle="Manage users, roles, and permissions"
        actions={
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="space-y-6">
        <UserStats />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <UsersFilters onFilterChange={handleFilterChange} />
        </div>

        <UsersDataTable
          users={users}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />

        <CreateUserDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </>
  )
}
