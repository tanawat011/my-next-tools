export type UserRole = 'admin' | 'user' | 'superadmin' | 'guest'

export interface User {
  id: string // UUID V7 - time-ordered unique identifier
  email: string // Unique email address (used for lookup but not primary key)
  firstName: string
  lastName: string
  displayName: string
  emailVerified: boolean
  isActive: boolean
  photoURL?: string
  providers: string[] // Array of auth providers used
  role: UserRole
  createdAt: Date
  updatedAt: Date
  lastSignInAt?: Date | null
  // For password-based authentication
  passwordHash?: string
}

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  password: string
  displayName?: string
  photoURL?: string
  providers?: string[]
  role?: UserRole
}

export interface SignInData {
  email: string
  password: string
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  displayName?: string
  emailVerified?: boolean
  isActive?: boolean
  photoURL?: string
  providers?: string[]
  role?: UserRole
  lastSignInAt?: Date
  updatedAt?: Date
}

export interface UserSession {
  id: string
  email: string
  displayName: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  photoURL?: string
}
