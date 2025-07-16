import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: user =>
        set(() => ({
          user,
          isAuthenticated: !!user,
        })),
      setLoading: loading =>
        set(() => ({
          isLoading: loading,
        })),
      login: user =>
        set(() => ({
          user,
          isAuthenticated: true,
          isLoading: false,
        })),
      logout: () =>
        set(() => ({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
