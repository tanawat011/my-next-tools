import {
  doc,
  collection,
  getDocs,
  writeBatch,
  DocumentData,
} from 'firebase/firestore'
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

import { db } from './firebase'

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

      // Initialize with service account (you'll need to set this up)
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

export interface FirebaseAuthUser {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  emailVerified: boolean
  disabled: boolean
  metadata: {
    creationTime?: string
    lastSignInTime?: string
  }
  providerData: Array<{
    uid: string
    email?: string
    displayName?: string
    photoURL?: string
    providerId: string
  }>
}

export interface FirestoreUser {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  lastSignIn: Date | null
  syncedAt: Date
  providerData: Array<{
    uid: string
    email?: string
    displayName?: string
    photoURL?: string
    providerId: string
  }>
}

export interface SyncResult {
  success: boolean
  totalUsers: number
  syncedUsers: number
  skippedUsers: number
  errors: string[]
}

/**
 * Fetch all users from Firebase Authentication
 * Note: This requires Firebase Admin SDK and proper service account setup
 */
export async function fetchFirebaseAuthUsers(): Promise<FirebaseAuthUser[]> {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side')
    }

    const admin = getFirebaseAdmin()
    const auth = getAuth(admin)

    const listUsersResult = await auth.listUsers()

    return listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
      providerData: user.providerData.map(provider => ({
        uid: provider.uid,
        email: provider.email,
        displayName: provider.displayName,
        photoURL: provider.photoURL,
        providerId: provider.providerId,
      })),
    }))
  } catch (error) {
    console.error('Error fetching Firebase Auth users:', error)
    throw error
  }
}

/**
 * Sync Firebase Auth users to Firestore database
 */
export async function syncAuthUsersToFirestore(
  authUsers: FirebaseAuthUser[],
  defaultRole: string = 'user'
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    totalUsers: authUsers.length,
    syncedUsers: 0,
    skippedUsers: 0,
    errors: [],
  }

  try {
    const batch = writeBatch(db)
    let batchSize = 0
    const maxBatchSize = 500 // Firestore batch limit

    for (const authUser of authUsers) {
      if (!authUser.email) {
        result.skippedUsers++
        result.errors.push(`User ${authUser.uid} has no email, skipping`)
        continue
      }

      try {
        // Check if user already exists in Firestore
        const userDoc = doc(db, 'users', authUser.email)

        const userData: FirestoreUser = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName || '',
          photoURL: authUser.photoURL || '',
          role: defaultRole,
          isActive: !authUser.disabled,
          emailVerified: authUser.emailVerified,
          createdAt: authUser.metadata.creationTime
            ? new Date(authUser.metadata.creationTime)
            : new Date(),
          lastSignIn: authUser.metadata.lastSignInTime
            ? new Date(authUser.metadata.lastSignInTime)
            : null,
          syncedAt: new Date(),
          providerData: authUser.providerData,
        }

        batch.set(userDoc, userData, { merge: true })
        batchSize++
        result.syncedUsers++

        // Commit batch if we reach the limit
        if (batchSize >= maxBatchSize) {
          await batch.commit()
          batchSize = 0
        }
      } catch (userError: unknown) {
        const errorMessage =
          userError instanceof Error ? userError.message : 'Unknown error'
        result.errors.push(
          `Error processing user ${authUser.email}: ${errorMessage}`
        )
        result.skippedUsers++
      }
    }

    // Commit remaining batch
    if (batchSize > 0) {
      await batch.commit()
    }

    result.success = true
    return result
  } catch (error: unknown) {
    console.error('Error syncing users to Firestore:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Batch sync error: ${errorMessage}`)
    return result
  }
}

/**
 * Get existing users from Firestore for comparison
 */
export async function getExistingFirestoreUsers(): Promise<
  Record<string, DocumentData>
> {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)

    const users: Record<string, DocumentData> = {}
    snapshot.forEach(doc => {
      users[doc.id] = doc.data()
    })

    return users
  } catch (error) {
    console.error('Error fetching Firestore users:', error)
    throw error
  }
}

/**
 * Compare and sync users between Firebase Auth and Firestore
 */
export async function performFullSync(
  defaultRole: string = 'user'
): Promise<SyncResult> {
  try {
    console.info('🔄 Starting Firebase Auth to Firestore sync...')

    // Fetch users from Firebase Auth
    console.info('📥 Fetching users from Firebase Authentication...')
    const authUsers = await fetchFirebaseAuthUsers()
    console.info(`Found ${authUsers.length} users in Firebase Auth`)

    // Get existing Firestore users
    console.info('📊 Checking existing Firestore users...')
    const existingUsers = await getExistingFirestoreUsers()
    console.info(
      `Found ${Object.keys(existingUsers).length} users in Firestore`
    )

    // Sync users
    console.info('🔄 Syncing users to Firestore...')
    const syncResult = await syncAuthUsersToFirestore(authUsers, defaultRole)

    console.info('✅ Sync completed!')
    console.info(`Total users: ${syncResult.totalUsers}`)
    console.info(`Synced users: ${syncResult.syncedUsers}`)
    console.info(`Skipped users: ${syncResult.skippedUsers}`)

    if (syncResult.errors.length > 0) {
      console.error('⚠️ Errors encountered:')
      syncResult.errors.forEach(error => console.error(`  - ${error}`))
    }

    return syncResult
  } catch (error: unknown) {
    console.error('❌ Full sync failed:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      totalUsers: 0,
      syncedUsers: 0,
      skippedUsers: 0,
      errors: [errorMessage],
    }
  }
}

/**
 * Client-side function to check sync status
 */
export async function checkSyncStatus(): Promise<{
  firestoreUsers: number
  lastSync?: Date
}> {
  try {
    const existingUsers = await getExistingFirestoreUsers()
    const users = Object.values(existingUsers)

    // Find the most recent sync time
    let lastSync: Date | undefined
    for (const user of users) {
      if (user.syncedAt) {
        const syncDate = user.syncedAt.toDate
          ? user.syncedAt.toDate()
          : new Date(user.syncedAt)
        if (!lastSync || syncDate > lastSync) {
          lastSync = syncDate
        }
      }
    }

    return {
      firestoreUsers: users.length,
      lastSync,
    }
  } catch (error) {
    console.error('Error checking sync status:', error)
    throw error
  }
}
