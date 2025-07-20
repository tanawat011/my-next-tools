import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from 'firebase/firestore'

import { generateUserId } from '@/lib/utils/uuid'

import { db } from './firebase'

export interface CreateUserData {
  email: string
  displayName?: string
  photoURL?: string
  role?: string
  provider?: string
  emailVerified?: boolean
  lastSignIn?: Date
}

export interface FirestoreUserData extends DocumentData {
  id: string
  email: string
  displayName: string
  photoURL: string
  role: string
  createdAt: Date
  lastSignIn: Date | null
  isActive: boolean
}

/**
 * Add a new user to Firebase Firestore
 * (This should be called from an admin interface or script)
 */
export async function addUserToFirebase(
  userData: CreateUserData
): Promise<boolean> {
  try {
    // Generate UUID V7 for user ID
    const userId = generateUserId()
    const userRef = doc(db, 'users', userId)

    const userDoc = {
      id: userId,
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      role: userData.role || 'user',
      provider: userData.provider || '',
      emailVerified: userData.emailVerified ?? false,
      createdAt: new Date(),
      lastSignIn: userData.lastSignIn || new Date(),
      isActive: true,
    }

    await setDoc(userRef, userDoc)
    console.info(`User ${userData.email} added successfully with ID: ${userId}`)
    return true
  } catch (error) {
    console.error('Error adding user to Firebase:', error)
    return false
  }
}

/**
 * Remove a user from Firebase Firestore
 */
export async function removeUserFromFirebase(email: string): Promise<boolean> {
  try {
    // First, find the user by email to get their UUID
    const q = query(collection(db, 'users'), where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.error(`User with email ${email} not found`)
      return false
    }

    // Delete the user document using their UUID
    const userDoc = querySnapshot.docs[0]
    await deleteDoc(userDoc.ref)
    console.info(`User ${email} removed successfully`)
    return true
  } catch (error) {
    console.error('Error removing user from Firebase:', error)
    return false
  }
}

/**
 * Get all users from Firebase Firestore
 */
export async function getAllUsers(): Promise<FirestoreUserData[]> {
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)

    const users: FirestoreUserData[] = []
    querySnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data(),
      } as FirestoreUserData)
    })

    return users
  } catch (error) {
    console.error('Error getting users from Firebase:', error)
    return []
  }
}

/**
 * Helper function to quickly add multiple users
 */
export async function addMultipleUsers(users: CreateUserData[]): Promise<void> {
  console.info('Adding multiple users to Firebase...')

  for (const userData of users) {
    const success = await addUserToFirebase(userData)
    if (success) {
      console.info(`✅ Added: ${userData.email}`)
    } else {
      console.info(`❌ Failed: ${userData.email}`)
    }
  }
}
