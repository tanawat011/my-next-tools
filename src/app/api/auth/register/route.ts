import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'

import { auth, db } from '@/lib/firebase/firebase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    const user = userCredential.user

    // Update user profile
    await updateProfile(user, {
      displayName: name,
    })

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user.uid,
          email: user.email,
          name: name,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Registration error:', error)

    let errorMessage = 'Registration failed'

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string }
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use'
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak'
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
