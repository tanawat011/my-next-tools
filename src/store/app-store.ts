import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'th'
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: Date
  }>
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: 'en' | 'th') => void
  addNotification: (notification: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      sidebarOpen: false,
      theme: 'system',
      language: 'en',
      notifications: [],
      setSidebarOpen: open =>
        set(() => ({
          sidebarOpen: open,
        })),
      setTheme: theme =>
        set(() => ({
          theme,
        })),
      setLanguage: language =>
        set(() => ({
          language,
        })),
      addNotification: notification =>
        set(state => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date(),
            },
          ],
        })),
      removeNotification: id =>
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        })),
      clearNotifications: () =>
        set(() => ({
          notifications: [],
        })),
    }),
    {
      name: 'app-storage',
      partialize: state => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
)
