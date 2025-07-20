'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DocumentSnapshot } from 'firebase/firestore'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

import {
  getAllUsers,
  getUsersByRole,
  createUser as createUserDB,
  updateUser as updateUserDB,
  toggleUserStatus as toggleUserStatusDB,
} from '@/lib/database/user-db'
import { User, UserRole } from '@/types/user'

// Re-export User type for components
export type { User } from '@/types/user'

// Legacy interfaces for compatibility with existing components
export interface CreateUserPayload {
  email: string
  displayName: string
  role: string
  photoURL?: string
  firstName: string
  lastName: string
  password: string
}

export interface UpdateUserPayload {
  displayName?: string
  role?: string
  photoURL?: string
  isActive?: boolean
  firstName?: string
  lastName?: string
}

export interface UserFilters {
  roles?: string[]
  statuses?: string[]
  providers?: string[]
  search?: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  signedInToday: number
}

export interface UsersPaginationData {
  users: User[]
  hasMore: boolean
  lastDoc: DocumentSnapshot | null
}

const USERS_QUERY_KEY = ['users']

// Helper function to check if user can view all users
function canViewAllUsers(userRole?: UserRole): boolean {
  return userRole === 'superadmin' || userRole === 'admin'
}

// Helper function to get allowed roles for current user
function getAllowedRoles(currentUserRole?: UserRole): UserRole[] {
  if (currentUserRole === 'superadmin') {
    return ['user', 'admin'] // Superadmin sees admin and user roles, but not other superadmins
  }
  if (currentUserRole === 'admin') {
    return ['user'] // Admin sees only user role
  }
  return ['user'] // Default: regular users see only user role
}

// Helper function for case-insensitive multi-field search
function matchesSearch(user: User, searchTerm: string): boolean {
  if (!searchTerm) return true

  const search = searchTerm.toLowerCase()
  const fields = [
    user.email,
    user.firstName,
    user.lastName,
    user.displayName,
    user.role,
  ].filter(Boolean) // Remove null/undefined values

  return fields.some(field => field.toLowerCase().includes(search))
}

// Helper function to check if user signed in today
function isSignedInToday(lastSignInAt?: Date | null): boolean {
  if (!lastSignInAt) return false

  const today = new Date()
  const signInDate = new Date(lastSignInAt)

  return (
    today.getFullYear() === signInDate.getFullYear() &&
    today.getMonth() === signInDate.getMonth() &&
    today.getDate() === signInDate.getDate()
  )
}

export function useUsers(filters: UserFilters = {}, pageSize: number = 20) {
  const { data: session } = useSession()
  const currentUserEmail = session?.user?.email
  const currentUserRole = session?.user?.role as UserRole
  const queryClient = useQueryClient()

  // Fetch users with filters and access control
  const { data, isLoading, error, refetch } = useQuery<UsersPaginationData>({
    queryKey: [
      ...USERS_QUERY_KEY,
      filters,
      pageSize,
      currentUserEmail,
      currentUserRole,
    ],
    queryFn: async () => {
      try {
        let users = await getAllUsers()

        // Apply role-based access control
        if (currentUserEmail) {
          // Filter out current user
          users = users.filter(user => user.email !== currentUserEmail)

          // Apply role-based visibility rules
          if (!canViewAllUsers(currentUserRole)) {
            const allowedRoles = getAllowedRoles(currentUserRole)
            users = users.filter(user => allowedRoles.includes(user.role))
          }
        }

        // Apply search filter (case-insensitive, multi-field)
        if (filters.search) {
          users = users.filter(user => matchesSearch(user, filters.search!))
        }

        // Apply role filters
        if (filters.roles && filters.roles.length > 0) {
          users = users.filter(user => filters.roles!.includes(user.role))
        }

        // Apply status filters
        if (filters.statuses && filters.statuses.length > 0) {
          users = users.filter(user => {
            if (filters.statuses!.includes('active') && user.isActive)
              return true
            if (filters.statuses!.includes('inactive') && !user.isActive)
              return true
            return false
          })
        }

        // Apply provider filters
        if (filters.providers && filters.providers.length > 0) {
          users = users.filter(user =>
            filters.providers!.some(provider =>
              user.providers.includes(provider)
            )
          )
        }

        // Sort users by updatedAt (most recent first)
        users.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )

        // Simple pagination simulation
        const startIndex = 0 // For simplicity, not implementing real pagination yet
        const endIndex = Math.min(startIndex + pageSize, users.length)
        const paginatedUsers = users.slice(startIndex, endIndex)

        return {
          users: paginatedUsers,
          hasMore: endIndex < users.length,
          lastDoc: null,
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Load more users for pagination (simplified)
  const loadMore = async () => {
    // For now, just refetch. Real pagination would need more complex logic
    refetch()
  }

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserPayload) => {
      const result = await createUserDB({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        role: userData.role as UserRole,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create user')
      }

      return result.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      toast.success('User created successfully')
    },
    onError: error => {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string
      updates: UpdateUserPayload
    }) => {
      const success = await updateUserDB(userId, {
        firstName: updates.firstName,
        lastName: updates.lastName,
        displayName: updates.displayName,
        isActive: updates.isActive,
        role: updates.role as UserRole | undefined,
        photoURL: updates.photoURL,
      })

      if (!success) {
        throw new Error('Failed to update user')
      }

      return { userId, updates }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      toast.success('User updated successfully')
    },
    onError: error => {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    },
  })

  // Delete user mutation (disable user instead of actual delete for safety)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const success = await toggleUserStatusDB(userId, false)
      if (!success) {
        throw new Error('Failed to delete user')
      }
      return userId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      toast.success('User deleted successfully')
    },
    onError: error => {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    },
  })

  // Toggle user status
  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUserMutation.mutate({
      userId,
      updates: { isActive: !currentStatus },
    })
  }

  // Update user role
  const updateUserRole = (userId: string, newRole: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { role: newRole },
    })
  }

  return {
    // Data
    users: data?.users || [],
    hasMore: data?.hasMore || false,

    // Loading states
    isLoading,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,

    // Error states
    error,

    // Actions
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    toggleUserStatus,
    updateUserRole,
    loadMore,
    refetch,
  }
}

export function useUsersByRole(role: string) {
  return useQuery<User[]>({
    queryKey: ['users', 'role', role],
    queryFn: () => getUsersByRole(role),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!role,
  })
}

// Enhanced useUserStats function with "Signed in Today" support
export function useUserStats() {
  const { data: session } = useSession()
  const currentUserEmail = session?.user?.email
  const currentUserRole = session?.user?.role as UserRole

  return useQuery<UserStats>({
    queryKey: ['user-stats', currentUserEmail, currentUserRole],
    queryFn: async () => {
      try {
        let allUsers = await getAllUsers()

        // Apply same role-based access control as useUsers
        if (currentUserEmail) {
          // Filter out current user
          allUsers = allUsers.filter(user => user.email !== currentUserEmail)

          // Apply role-based visibility rules
          if (!canViewAllUsers(currentUserRole)) {
            const allowedRoles = getAllowedRoles(currentUserRole)
            allUsers = allUsers.filter(user => allowedRoles.includes(user.role))
          }
        }

        const stats: UserStats = {
          total: allUsers.length,
          active: allUsers.filter(user => user.isActive).length,
          inactive: allUsers.filter(user => !user.isActive).length,
          signedInToday: allUsers.filter(user =>
            isSignedInToday(user.lastSignInAt)
          ).length,
        }

        return stats
      } catch (error) {
        console.error('Error fetching user stats:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for getting a single user
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<User | null> => {
      try {
        const allUsers = await getAllUsers()
        return (
          allUsers.find(user => user.id === userId || user.email === userId) ||
          null
        )
      } catch (error) {
        console.error('Error fetching user:', error)
        throw error
      }
    },
    enabled: !!userId,
  })
}
