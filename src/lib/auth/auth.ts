import NextAuth, { Account, User } from 'next-auth'
import { Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z } from 'zod'

import { handleOAuthUserServer } from '../firebase/firebase-admin-server'
import {
  isUserAuthorized,
  getFirebaseUser,
} from '../firebase/firebase-auth-utils'
import { updateUserLastSignIn } from '../firebase/firebase-registration'

// Extended types for our custom properties
interface ExtendedUser extends User {
  role?: string
}

interface ExtendedSession extends Session {
  user: ExtendedUser
}

interface ExtendedJWT extends JWT {
  role?: string
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authResult = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = signInSchema.parse(credentials)

          // Check if user is authorized in Firebase first
          const isAuthorized = await isUserAuthorized(email)
          if (!isAuthorized) {
            console.error(`User ${email} not authorized in Firebase`)
            return null
          }

          // Get user data from Firestore
          const firestoreUser = await getFirebaseUser(email)
          if (!firestoreUser) {
            console.error(`User ${email} not found in Firestore`)
            return null
          }

          // For now, we'll do a simple password check
          if (password.length < 6) {
            console.error('Password too short')
            return null
          }

          // Update last sign-in time
          await updateUserLastSignIn(email)

          return {
            id: firestoreUser.uid,
            email: firestoreUser.email,
            name: firestoreUser.displayName || email,
            role: firestoreUser.role || 'user',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
    }: {
      user: ExtendedUser
      account: Account | null
    }) {
      try {
        // For OAuth providers, handle user registration/login
        if (account?.provider === 'google') {
          console.info('Processing Google OAuth user:', user)
          if (!user.email) {
            console.error('No email provided by OAuth provider')
            return false
          }

          // Handle OAuth user (registers new users or updates existing ones)
          const oauthUserData = {
            email: user.email,
            name: user.name || '',
            image: user.image || '',
            id: user.id || '',
          }

          // Use server-side function that can directly use Firebase Admin SDK
          const success = await handleOAuthUserServer(oauthUserData)

          if (!success) {
            console.error(`Failed to handle OAuth user ${user.email}`)
            return false
          }

          // Get additional user data from Firebase
          const firebaseUser = await getFirebaseUser(user.email)
          if (firebaseUser && firebaseUser.role) {
            // Add role to user object
            user.role = firebaseUser.role
          }

          return true
        }

        // For credentials provider, the user is already validated
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession
      token: ExtendedJWT
    }) {
      if (session.user) {
        session.user.id = token.sub!
        // Add role to session if available
        if (token.role) {
          session.user.role = token.role
        }
      }
      return session
    },
    async jwt({ token, user }: { token: ExtendedJWT; user?: ExtendedUser }) {
      if (user?.id) {
        token.sub = user.id
        // Add role to token if available
        if (user.role) {
          token.role = user.role
        }
      }
      return token
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/unauthorized',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
})
