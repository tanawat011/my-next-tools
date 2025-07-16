import { doc, setDoc, getDoc } from 'firebase/firestore'
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, CreateRequest } from 'firebase-admin/auth'

import { db } from './firebase'
import { addUserToFirebase } from './firebase-admin-utils'

// Initialize Firebase Admin (server-side only)
let adminApp: App | null = null

function getFirebaseAdmin(): App {
  if (adminApp) return adminApp

  if (getApps().length === 0) {
    try {
      // Check that required environment variables are present
      if (
        !process.env.FIREBASE_ADMIN_PROJECT_ID ||
        !process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
        !process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ) {
        throw new Error('Missing required Firebase Admin environment variables')
      }

      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
            /\\n/g,
            '\n'
          ),
        }),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      })
    } catch (error) {
      console.error('Firebase Admin initialization error:', error)
      throw new Error('Firebase Admin not properly configured')
    }
  } else {
    adminApp = getApps()[0]
  }

  return adminApp
}

export interface OAuthUser {
  email: string
  name?: string
  image?: string
  id?: string
}

export interface AuthResult {
  success: boolean
  uid?: string
  error?: string
}

/**
 * Create OAuth user in Firebase Authentication using Admin SDK
 * This function should only be called on the server side
 */
export async function createOAuthUserInFirebaseAuth(user: {
  email: string
  name?: string
  image?: string
}): Promise<AuthResult> {
  try {
    // This function should only be called on the server side
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side')
    }

    const admin = getFirebaseAdmin()
    const adminAuth = getAuth(admin)

    // Check if user already exists in Firebase Auth
    try {
      const existingUser = await adminAuth.getUserByEmail(user.email)
      console.info(
        `User ${user.email} already exists in Firebase Auth with UID: ${existingUser.uid}`
      )
      return { success: true, uid: existingUser.uid }
    } catch (error: unknown) {
      // User doesn't exist, create them
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'auth/user-not-found'
      ) {
        const createUserPayload: CreateRequest = {
          email: user.email,
          emailVerified: true, // OAuth users typically have verified emails
        }

        if (user.name) {
          createUserPayload.displayName = user.name
        }

        if (user.image) {
          createUserPayload.photoURL = user.image
        }

        const userRecord = await adminAuth.createUser(createUserPayload)
        console.info(
          `Created Firebase Auth user: ${userRecord.uid} for email: ${user.email}`
        )

        return { success: true, uid: userRecord.uid }
      } else {
        throw error
      }
    }
  } catch (error: unknown) {
    console.error('Error creating OAuth user in Firebase Auth:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: errorMessage || 'Failed to create user in Firebase Authentication',
    }
  }
}

/**
 * Check if a user exists in Firebase Auth
 */
async function checkUserExists(email: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', email))
    return userDoc.exists()
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

/**
 * Server-side version of handleOAuthUser that can directly use Firebase Admin SDK
 * This function should only be called from server-side code like NextAuth callbacks
 */
export async function handleOAuthUserServer(user: OAuthUser): Promise<boolean> {
  try {
    if (!user.email) return false

    // Check if user already exists in Firestore
    const userExists = await checkUserExists(user.email)

    if (!userExists) {
      // Create user in Firebase Authentication using Admin SDK
      const authResult = await createOAuthUserInFirebaseAuth({
        email: user.email,
        name: user.name || '',
        image: user.image || '',
      })

      if (!authResult.success) {
        console.error(
          'Failed to create OAuth user in Firebase Auth:',
          authResult.error
        )
        // Continue to Firestore creation anyway for backward compatibility
      } else {
        console.info(
          'Successfully created OAuth user in Firebase Auth:',
          authResult.uid
        )
      }

      // Add new OAuth user to Firestore
      const success = await addUserToFirebase({
        email: user.email,
        displayName: user.name || '',
        photoURL: user.image || '',
        role: 'user',
      })

      if (!success) {
        console.error('Failed to add OAuth user to Firestore')
        return false
      }
    } else {
      // Update last sign-in time for existing user
      await setDoc(
        doc(db, 'users', user.email),
        {
          lastSignIn: new Date(),
        },
        { merge: true }
      )
    }

    return true
  } catch (error) {
    console.error('Error handling OAuth user:', error)
    return false
  }
}
