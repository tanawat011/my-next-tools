import { sendPasswordResetEmail } from 'firebase/auth'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/firebase/firebase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Send password reset email
    await sendPasswordResetEmail(auth, email)

    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Forgot password error:', error)

    let errorMessage = 'Failed to send password reset email'

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string }
      if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address'
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
