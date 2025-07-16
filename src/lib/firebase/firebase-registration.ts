import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

import { auth, db } from './firebase'
import { addUserToFirebase } from './firebase-admin-utils'

export interface RegisterUserData {
  email: string
  password: string
  name: string
  role?: string
}

export interface RegistrationResult {
  success: boolean
  error?: string
  user?: {
    uid: string
    email: string
    displayName: string
  }
}

/**
 * Register a new user with Firebase Auth and add them to Firestore
 */
export async function registerUserWithFirebase(
  userData: RegisterUserData
): Promise<RegistrationResult> {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    )

    const firebaseUser = userCredential.user

    // Update the user's profile with display name
    await updateProfile(firebaseUser, {
      displayName: userData.name,
    })

    // Add user to Firestore database
    const userDoc = {
      uid: firebaseUser.uid,
      email: userData.email,
      displayName: userData.name,
      photoURL: firebaseUser.photoURL || '',
      role: userData.role || 'user',
      createdAt: new Date(),
      lastSignIn: new Date(),
      isActive: true,
      emailVerified: firebaseUser.emailVerified,
    }

    await setDoc(doc(db, 'users', userData.email), userDoc)

    return {
      success: true,
      user: {
        uid: firebaseUser.uid,
        email: userData.email,
        displayName: userData.name,
      },
    }
  } catch (error: unknown) {
    console.error('Firebase registration error:', error)

    let errorMessage = 'Registration failed. Please try again.'

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string }
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.'
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage =
          'Password is too weak. Please choose a stronger password.'
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        errorMessage =
          'Email/password accounts are not enabled. Contact support.'
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Check if a user exists in Firebase Auth
 */
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', email))
    return userDoc.exists()
  } catch (error) {
    console.error('Error checking user existence:', error)
    return false
  }
}

/**
 * Handle OAuth user registration/login
 * This function ensures OAuth users are added to both Firebase Auth and Firestore
 */
export async function handleOAuthUser(user: {
  email: string
  name?: string
  image?: string
  id?: string
}): Promise<boolean> {
  try {
    if (!user.email) return false

    // Check if user already exists in Firestore
    const userExists = await checkUserExists(user.email)

    if (!userExists) {
      // Create user in Firebase Authentication via API route
      try {
        const response = await fetch('/api/auth/create-oauth-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name || '',
            image: user.image || '',
          }),
        })

        if (!response.ok) {
          console.error('Failed to create OAuth user in Firebase Auth')
          // Continue to Firestore creation anyway for backward compatibility
        } else {
          const result = await response.json()
          console.info(
            'Successfully created OAuth user in Firebase Auth:',
            result.uid
          )
        }
      } catch (error) {
        console.error('Error calling OAuth user creation API:', error)
        // Continue to Firestore creation anyway
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

/**
 * Update user last sign-in time
 */
export async function updateUserLastSignIn(email: string): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', email),
      {
        lastSignIn: new Date(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error updating last sign-in:', error)
  }
}
