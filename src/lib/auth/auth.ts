import NextAuth, { User, Session, Account } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z } from 'zod'

import {
  authenticateUser,
  createUser,
  getUserByEmail,
  updateUserLastSignIn,
  updateUserWithGoogleData,
} from '@/lib/database/user-db'

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

          // Authenticate user with document database
          const result = await authenticateUser({ email, password })

          if (!result.success || !result.user) {
            console.error('Authentication failed:', result.error)
            return null
          }

          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.displayName,
            role: result.user.role,
            photoURL: result.user.photoURL,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      try {
        // For Google OAuth provider, handle user creation in document database
        if (account?.provider === 'google') {
          if (!user.email) {
            console.error('No email provided by Google OAuth')
            return '/signin?error=google-invalid-signin'
          }

          // Load global settings to check Google user restrictions
          const { loadGlobalSettingsFromFirebase } = await import(
            '@/lib/firebase/firebase-settings'
          )
          const globalSettings = await loadGlobalSettingsFromFirebase()
          const restrictGoogleToExisting =
            globalSettings?.restrictGoogleToExistingUsers || false

          // Check if user already exists in document database
          const existingUser = await getUserByEmail(user.email)

          if (!existingUser) {
            // Check if Google users are restricted to existing users only
            if (restrictGoogleToExisting) {
              console.warn(
                'Google user blocked: restrictGoogleToExistingUsers is enabled and user does not exist:',
                user.email
              )
              return '/signin?error=google-user-not-allowed'
            }

            // Create new user in document database from Google OAuth data
            const names = user.name?.split(' ') || ['Unknown', 'User']
            const firstName = names[0] || 'Unknown'
            const lastName = names.slice(1).join(' ') || 'User'

            const result = await createUser({
              email: user.email,
              firstName,
              lastName,
              password: '', // No password for OAuth users
              displayName: user.name || `${firstName} ${lastName}`,
              photoURL: user.image || '',
              providers: ['google'],
              role: 'user', // Default role as requested
            })

            if (!result.success) {
              console.error('Failed to create Google OAuth user:', result.error)
              return '/signin?error=google-invalid-signin'
            }

            console.info('Created new Google OAuth user:', user.email)
          } else {
            // Update last sign-in time for existing user
            await updateUserLastSignIn(user.email)

            // Update user profile with Google data if they originally signed up with credentials
            // This handles the case where user signed up with credentials and later signs in with Google
            await updateUserWithGoogleData(user.email, {
              name: user.name,
              photoURL: user.image,
            })

            console.info('Google OAuth sign-in for existing user:', user.email)
          }

          return true
        }

        // For credentials provider, the user is already validated
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return '/signin?error=invalid-signin'
      }
    },
    async jwt({
      token,
      user,
      // account,
    }: {
      token: JWT
      user?: User
      account?: Account | null
    }) {
      if (user?.id) {
        token.sub = user.id
        // Add role to token if available
        if (user.role) {
          token.role = user.role
        }
      }

      // For Google OAuth, get user data from document database
      if (user?.email) {
        const dbUser = await getUserByEmail(user.email)
        if (dbUser) {
          token.role = dbUser.role
          token.sub = dbUser.id
          token.photoURL = dbUser.photoURL
        }
      }

      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub!
        // Add role to session if available
        if (token.role) {
          session.user.role = token.role
        }
        // Add photoURL to session if available
        if (token.photoURL) {
          session.user.image = token.photoURL
        }
      }
      return session
    },
  },
  events: {
    async signIn({ user, account }: { user: User; account: Account | null }) {
      console.info('Sign in event:', {
        user: user.email,
        provider: account?.provider,
      })
    },
    async signOut({ session, token }: { session?: Session; token?: JWT }) {
      console.info('Sign out event:', {
        user: session?.user?.email || token?.email,
      })
    },
    async createUser({ user }: { user: User }) {
      console.info('Create user event:', { user: user.email })
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/signin', // Redirect errors to signin page
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
