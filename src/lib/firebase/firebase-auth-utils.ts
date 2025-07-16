import { doc, getDoc } from 'firebase/firestore'

import { db } from './firebase'

export interface FirebaseUser {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  role?: string
  createdAt?: Date
  lastSignIn?: Date
}

/**
 * Check if a user exists in Firebase Firestore
 */
export async function isUserAuthorized(email: string): Promise<boolean> {
  try {
    if (!email) return false

    // Check if user exists in the 'users' collection
    const userDoc = await getDoc(doc(db, 'users', email))
    return userDoc.exists()
  } catch (error) {
    console.error('Error checking user authorization:', error)
    return false
  }
}

/**
 * Get user data from Firebase Firestore
 */
export async function getFirebaseUser(
  email: string
): Promise<FirebaseUser | null> {
  try {
    if (!email) return null

    const userDoc = await getDoc(doc(db, 'users', email))

    if (userDoc.exists()) {
      return {
        uid: userDoc.id,
        email: email,
        ...userDoc.data(),
      } as FirebaseUser
    }

    return null
  } catch (error) {
    console.error('Error getting Firebase user:', error)
    return null
  }
}

/**
 * Check if a user exists by any field (email, uid, etc.)
 */
export async function findUserByField(
  field: string,
  value: string
): Promise<FirebaseUser | null> {
  try {
    if (!value) return null

    // For now, we'll primarily check by email
    // You can extend this to search by other fields if needed
    if (field === 'email') {
      return await getFirebaseUser(value)
    }

    return null
  } catch (error) {
    console.error(`Error finding user by ${field}:`, error)
    return null
  }
}
