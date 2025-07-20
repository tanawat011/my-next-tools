import bcrypt from 'bcryptjs'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

import { db } from '@/lib/firebase/firebase'
import { generateUserId } from '@/lib/utils/uuid'
import {
  User,
  CreateUserData,
  SignInData,
  UpdateUserData,
  UserSession,
} from '@/types/user'

const USERS_COLLECTION = 'users'

/**
 * Create a new user in the document database
 */
export async function createUser(
  userData: CreateUserData
): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
      displayName,
      photoURL,
      providers = ['credentials'],
      role = 'user',
    } = userData

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Hash the password (only if password is provided, OAuth users don't need passwords)
    let passwordHash: string | undefined
    if (password && password.length > 0) {
      passwordHash = await bcrypt.hash(password, 12)
    }

    // Generate UUID V7 for user ID
    const userId = generateUserId()

    // Create user document
    const userDoc: User = {
      id: userId, // Using UUID V7 as unique identifier
      email,
      firstName,
      lastName,
      displayName: displayName || `${firstName} ${lastName}`,
      emailVerified: false, // Email verification would be implemented separately
      isActive: true,
      photoURL: photoURL || '',
      providers,
      role,
      lastSignInAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(providers?.includes('credentials') && {
        passwordHash,
      }),
    }

    await setDoc(doc(db, USERS_COLLECTION, email), userDoc)

    // Return user session data (without password)
    const userSession: UserSession = {
      id: userDoc.id,
      email: userDoc.email,
      displayName: userDoc.displayName,
      role: userDoc.role,
      isActive: userDoc.isActive,
      emailVerified: userDoc.emailVerified,
      photoURL: userDoc.photoURL,
    }

    return { success: true, user: userSession }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user account' }
  }
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  signInData: SignInData
): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  try {
    const { email, password } = signInData

    // Get user from database
    const user = await getUserByEmail(email)
    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is disabled. Please contact support.',
      }
    }

    // Verify password
    if (!user.passwordHash) {
      return { success: false, error: 'Invalid authentication method' }
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Update last sign in time
    await updateUserLastSignIn(email)

    // Return user session data (without password)
    const userSession: UserSession = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
    }

    return { success: true, user: userSession }
  } catch (error) {
    console.error('Error authenticating user:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    // Return the first matching user (email should be unique)
    const userDoc = querySnapshot.docs[0]
    return userDoc.data() as User
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

/**
 * Get user by ID (UUID V7)
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, id))
    if (userDoc.exists()) {
      return userDoc.data() as User
    }
    return null
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
}

/**
 * Get user ID by email (helper function)
 */
async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const user = await getUserByEmail(email)
    return user?.id || null
  } catch (error) {
    console.error('Error getting user ID by email:', error)
    return null
  }
}

/**
 * Update user data
 */
export async function updateUser(
  email: string,
  updateData: UpdateUserData
): Promise<boolean> {
  try {
    const userId = await getUserIdByEmail(email)
    if (!userId) {
      console.error('User not found for email:', email)
      return false
    }

    const updateDocData = {
      ...updateData,
      updatedAt: new Date(),
    }

    await updateDoc(doc(db, USERS_COLLECTION, userId), updateDocData)
    return true
  } catch (error) {
    console.error('Error updating user:', error)
    return false
  }
}

/**
 * Update user's last sign-in time
 */
export async function updateUserLastSignIn(email: string): Promise<boolean> {
  try {
    const userId = await getUserIdByEmail(email)
    if (!userId) {
      console.error('User not found for email:', email)
      return false
    }

    await updateDoc(doc(db, USERS_COLLECTION, email), {
      lastSignInAt: new Date(),
      updatedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error('Error updating last sign-in:', error)
    return false
  }
}

/**
 * Get all users (for admin purposes)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersQuery = query(collection(db, USERS_COLLECTION))
    const querySnapshot = await getDocs(usersQuery)

    const users: User[] = []
    querySnapshot.forEach(doc => {
      users.push(doc.data() as User)
    })

    return users
  } catch (error) {
    console.error('Error getting all users:', error)
    return []
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: string): Promise<User[]> {
  try {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', role)
    )
    const querySnapshot = await getDocs(usersQuery)

    const users: User[] = []
    querySnapshot.forEach(doc => {
      users.push(doc.data() as User)
    })

    return users
  } catch (error) {
    console.error('Error getting users by role:', error)
    return []
  }
}

/**
 * Check if user exists
 */
export async function userExists(email: string): Promise<boolean> {
  try {
    const user = await getUserByEmail(email)
    return user !== null
  } catch (error) {
    console.error('Error checking if user exists:', error)
    return false
  }
}

/**
 * Update user role (admin function)
 */
export async function updateUserRole(
  email: string,
  newRole: string
): Promise<boolean> {
  try {
    const userId = await getUserIdByEmail(email)
    if (!userId) {
      console.error('User not found for email:', email)
      return false
    }

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      role: newRole,
      updatedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
}

/**
 * Update user profile with Google data when signing in with Google after credentials signup
 */
export async function updateUserWithGoogleData(
  email: string,
  googleData: {
    name?: string | null
    photoURL?: string | null
  }
): Promise<boolean> {
  try {
    const user = await getUserByEmail(email)
    if (!user) {
      return false
    }

    const updateData: UpdateUserData = {
      updatedAt: new Date(),
    }

    // Update photoURL if it's empty and Google provides one
    if (!user.photoURL && googleData.photoURL) {
      updateData.photoURL = googleData.photoURL
      console.info(`Updating photoURL for user ${email} with Google photo`)
    }

    // Update displayName if it's empty and Google provides one
    if (!user.displayName && googleData.name) {
      updateData.displayName = googleData.name
      console.info(
        `Updating displayName for user ${email} with Google name: ${googleData.name}`
      )
    }

    // Add 'google' to providers if not already present
    if (!user.providers.includes('google')) {
      updateData.providers = [...user.providers, 'google']
      console.info(
        `Adding 'google' provider to user ${email}. Providers: ${user.providers.join(', ')} → ${updateData.providers.join(', ')}`
      )
    }

    // Only update if there are changes to make
    const hasChanges =
      updateData.photoURL || updateData.displayName || updateData.providers
    if (hasChanges) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(doc(db, USERS_COLLECTION, user.email), updateData as any)
    }

    return true
  } catch (error) {
    console.error('Error updating user with Google data:', error)
    return false
  }
}

/**
 * Activate/Deactivate user (admin function)
 */
export async function toggleUserStatus(
  email: string,
  isActive: boolean
): Promise<boolean> {
  try {
    const userId = await getUserIdByEmail(email)
    if (!userId) {
      console.error('User not found for email:', email)
      return false
    }

    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      isActive,
      updatedAt: new Date(),
    })
    return true
  } catch (error) {
    console.error('Error toggling user status:', error)
    return false
  }
}
