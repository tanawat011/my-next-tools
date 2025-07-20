// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth'

import { UserRole } from './user'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role?: UserRole // Make role optional to avoid conflicts
    photoURL?: string // Add photoURL to User interface
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: UserRole // Make role optional to avoid conflicts
      photoURL?: string | null // Add photoURL to Session user interface
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: UserRole // Make role optional to avoid conflicts
    photoURL?: string // Add photoURL to JWT interface
  }
}
