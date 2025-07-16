import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  DocumentData,
} from 'firebase/firestore'

import { db } from './firebase'

export interface CreateUserData {
  email: string
  displayName?: string
  photoURL?: string
  role?: string
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
    const userRef = doc(db, 'users', userData.email)

    const userDoc = {
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      role: userData.role || 'user',
      createdAt: new Date(),
      lastSignIn: null,
      isActive: true,
    }

    await setDoc(userRef, userDoc)
    console.info(`User ${userData.email} added successfully`)
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
    const userRef = doc(db, 'users', email)
    await deleteDoc(userRef)
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
