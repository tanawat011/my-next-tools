import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { useAuthStore } from '@/store/auth-store'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    setLoading(status === 'loading')

    if (status === 'authenticated' && session?.user) {
      setUser({
        id: (session.user as { id: string }).id || session.user.email!,
        email: session.user.email!,
        name: session.user.name || session.user.email!,
        avatar: session.user.image || undefined,
        role: 'user', // Default role, can be fetched from database
      })
    } else if (status === 'unauthenticated') {
      setUser(null)
    }
  }, [session, status, setUser, setLoading])

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      logout()
      router.push('/signin')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    signOut: handleSignOut,
  }
}
