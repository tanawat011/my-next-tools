import { NextRequest, NextResponse } from 'next/server'

import { createUser } from '@/lib/database/user-db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, displayName } =
      await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Create user in document database with default role "user"
    const result = await createUser({
      email,
      password,
      firstName,
      lastName,
      displayName: displayName || `${firstName} ${lastName}`,
      role: 'user', // Default role as specified
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create user account' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: 'User account created successfully',
        user: {
          id: result.user!.id,
          email: result.user!.email,
          displayName: result.user!.displayName,
          role: result.user!.role,
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Signup error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
