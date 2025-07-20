'use client'

import { format } from 'date-fns'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type User } from '@/hooks/use-users'
import { convertTimestampToDate } from '@/lib/date/convert-timestamp'

import { UserActionsDialog } from './user-actions-dialog'

interface UsersDataTableProps {
  users: User[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

type SortField =
  | 'user'
  | 'role'
  | 'status'
  | 'lastSignIn'
  | 'updated'
  | 'providers'
type SortDirection = 'asc' | 'desc' | null

export function UsersDataTable({
  users,
  isLoading,
  hasMore,
  onLoadMore,
}: UsersDataTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null -> asc
      setSortDirection(
        sortDirection === 'asc'
          ? 'desc'
          : sortDirection === 'desc'
            ? null
            : 'asc'
      )
      if (sortDirection === 'desc') {
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortedUsers = () => {
    if (!sortField || !sortDirection) return users

    return [...users].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'user':
          aValue = (a.displayName || a.email).toLowerCase()
          bValue = (b.displayName || b.email).toLowerCase()
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'status':
          aValue = a.isActive ? 'active' : 'inactive'
          bValue = b.isActive ? 'active' : 'inactive'
          break
        case 'lastSignIn':
          aValue = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0
          bValue = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0
          break
        case 'updated':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case 'providers':
          aValue = a.providers.join(',')
          bValue = b.providers.join(',')
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="text-muted-foreground ml-1 h-4 w-4" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-1 h-4 w-4" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-1 h-4 w-4" />
    }
    return <ArrowUpDown className="text-muted-foreground ml-1 h-4 w-4" />
  }

  const getUserInitials = (name: string, email: string) => {
    const displayName = name || email
    return displayName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'admin':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'user':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🔵'
      case 'credentials':
        return '📧'
      default:
        return '🔒'
    }
  }

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google'
      case 'credentials':
        return 'Email'
      default:
        return provider
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setActionType('edit')
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setActionType('delete')
  }

  const handleCloseDialog = () => {
    setSelectedUser(null)
    setActionType(null)
  }

  const sortedUsers = getSortedUsers()

  if (isLoading && users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('user')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    User
                    {getSortIcon('user')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('role')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Role
                    {getSortIcon('role')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('status')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('providers')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Providers
                    {getSortIcon('providers')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('lastSignIn')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Last Sign In
                    {getSortIcon('lastSignIn')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('updated')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Updated
                    {getSortIcon('updated')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map(user => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.photoURL}
                          alt={user.displayName}
                        />
                        <AvatarFallback>
                          {getUserInitials(user.displayName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.displayName || user.email}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getRoleColor(user.role)}
                    >
                      {(user.role === 'admin' ||
                        user.role === 'superadmin') && (
                        <Shield className="mr-1 h-3 w-3" />
                      )}
                      {user.role === 'superadmin'
                        ? 'Super Admin'
                        : user.role.charAt(0).toUpperCase() +
                          user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? 'default' : 'secondary'}
                      className={
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {user.isActive ? (
                        <>
                          <UserCheck className="mr-1 h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className="mr-1 h-3 w-3" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.providers.map(provider => (
                        <Badge
                          key={provider}
                          variant="outline"
                          className="text-xs"
                        >
                          <span className="mr-1">
                            {getProviderIcon(provider)}
                          </span>
                          {getProviderLabel(provider)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastSignInAt ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {(() => {
                          const date = convertTimestampToDate(user.lastSignInAt)
                          return date
                            ? format(date, 'MMM dd, yyyy')
                            : 'Invalid date'
                        })()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {(() => {
                        const date = convertTimestampToDate(user.updatedAt)
                        return date
                          ? format(date, 'MMM dd, yyyy')
                          : 'Invalid date'
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCheck className="mr-2 h-4 w-4" />
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && !isLoading && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}

          {hasMore && (
            <div className="border-t p-4">
              <Button
                onClick={onLoadMore}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <UserActionsDialog
        user={selectedUser}
        actionType={actionType}
        onClose={handleCloseDialog}
      />
    </>
  )
}
