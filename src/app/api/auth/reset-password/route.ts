import { confirmPasswordReset } from 'firebase/auth'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/firebase/firebase'

export async function POST(request: NextRequest) {
  try {
    const { oobCode, newPassword } = await request.json()

    if (!oobCode || !newPassword) {
      return NextResponse.json(
        { error: 'Reset code and new password are required' },
        { status: 400 }
      )
    }

    // Confirm password reset
    await confirmPasswordReset(auth, oobCode, newPassword)

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Reset password error:', error)

    let errorMessage = 'Failed to reset password'

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string }
      if (firebaseError.code === 'auth/invalid-action-code') {
        errorMessage = 'Invalid or expired reset code'
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak'
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 400 })
  }
}
