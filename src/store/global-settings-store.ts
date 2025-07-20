/* eslint-disable @typescript-eslint/no-unused-vars */
import { onAuthStateChanged, User } from 'firebase/auth'
import { Session } from 'next-auth'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { auth } from '@/lib/firebase/firebase'
import {
  saveSettingsToFirebase,
  loadSettingsFromFirebase,
  loadGlobalSettingsFromFirebase,
} from '@/lib/firebase/firebase-settings'
import type { AppSettings } from '@/types/settings'

interface GlobalSettingsState extends AppSettings {
  // Firebase sync state
  isLoading: boolean
  isSynced: boolean
  lastSyncTime: Date | null
  currentUser: { uid: string; email: string } | null

  // Actions
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>
  resetToDefaults: () => Promise<void>
  exportSettings: () => string
  importSettings: (settingsJson: string) => Promise<boolean>

  // Firebase sync actions
  syncWithFirebase: () => Promise<void>
  loadFromFirebase: () => Promise<void>
  saveToFirebase: () => Promise<void>

  // Internal state management
  setLoading: (loading: boolean) => void
  setCurrentUser: (user: { uid: string; email: string } | null) => void
  loadGlobalDefaults: () => Promise<void>
}

const DEFAULT_SETTINGS: AppSettings = {
  // App Configuration
  appName: 'My Next Tools',
  appTitle: 'My Next Tools - Professional Dashboard',
  appDescription:
    'A modern Next.js application with powerful tools and features',
  appKeywords: ['nextjs', 'dashboard', 'tools', 'typescript'],
  appAuthor: 'Your Company',
  appVersion: '1.0.0',
  appUrl: 'https://your-app.com',

  // Authentication Settings
  allowGoogleAuth: true,
  allowNewUserRegistration: true,
  requireEmailVerification: false,
  allowGuestMode: false,
  restrictGoogleToExistingUsers: false, // Allow Google users to create accounts by default

  // Feature Settings
  enableDarkMode: true,
  enableMultiLanguage: true,
  enableNotifications: true,
  enableAnalytics: false,

  // About Information
  aboutTitle: 'About My Next Tools',
  aboutDescription:
    'My Next Tools is a comprehensive platform built with Next.js 15, TypeScript, and modern web technologies. It provides a solid foundation for building scalable applications with authentication, user management, and customizable dashboards.',
  contactEmail: 'support@your-app.com',
  supportUrl: 'https://your-app.com/support',
  privacyPolicyUrl: 'https://your-app.com/privacy',
  termsOfServiceUrl: 'https://your-app.com/terms',

  // Advanced Settings
  sessionTimeout: 60, // 1 hour
  maxLoginAttempts: 5,
  enableMaintenanceMode: false,
  maintenanceMessage:
    'We are currently performing maintenance. Please check back later.',
}

export const useGlobalSettingsStore = create<GlobalSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      // Firebase sync state
      isLoading: false,
      isSynced: false,
      lastSyncTime: null,
      currentUser: null,

      updateAppSettings: async (newSettings: Partial<AppSettings>) => {
        set(state => ({
          ...state,
          ...newSettings,
          isSynced: false, // Mark as not synced when local changes are made
        }))

        // Auto-sync with Firebase if user is authenticated
        const { currentUser, saveToFirebase } = get()
        if (currentUser) {
          try {
            await saveToFirebase()
          } catch (error) {
            console.error('Auto-sync to Firebase failed:', error)
            // Continue working with local storage even if Firebase sync fails
          }
        }
      },

      resetToDefaults: async () => {
        // Load global defaults first, then merge with local defaults
        const globalDefaults = await loadGlobalSettingsFromFirebase()
        const settingsToReset = { ...DEFAULT_SETTINGS, ...globalDefaults }

        set(state => ({
          ...state,
          ...settingsToReset,
          isSynced: false,
          lastSyncTime: null,
        }))

        // Sync with Firebase if user is authenticated
        const { currentUser, saveToFirebase } = get()
        if (currentUser) {
          try {
            await saveToFirebase()
          } catch (error) {
            console.error('Failed to sync reset settings to Firebase:', error)
          }
        }
      },

      exportSettings: () => {
        const state = get()
        const settings: AppSettings = {
          appName: state.appName,
          appTitle: state.appTitle,
          appDescription: state.appDescription,
          appKeywords: state.appKeywords,
          appAuthor: state.appAuthor,
          appVersion: state.appVersion,
          appUrl: state.appUrl,
          allowGoogleAuth: state.allowGoogleAuth,
          allowNewUserRegistration: state.allowNewUserRegistration,
          requireEmailVerification: state.requireEmailVerification,
          allowGuestMode: state.allowGuestMode,
          restrictGoogleToExistingUsers: state.restrictGoogleToExistingUsers,
          enableDarkMode: state.enableDarkMode,
          enableMultiLanguage: state.enableMultiLanguage,
          enableNotifications: state.enableNotifications,
          enableAnalytics: state.enableAnalytics,
          aboutTitle: state.aboutTitle,
          aboutDescription: state.aboutDescription,
          contactEmail: state.contactEmail,
          supportUrl: state.supportUrl,
          privacyPolicyUrl: state.privacyPolicyUrl,
          termsOfServiceUrl: state.termsOfServiceUrl,
          sessionTimeout: state.sessionTimeout,
          maxLoginAttempts: state.maxLoginAttempts,
          enableMaintenanceMode: state.enableMaintenanceMode,
          maintenanceMessage: state.maintenanceMessage,
        }
        return JSON.stringify(settings, null, 2)
      },

      importSettings: async (settingsJson: string) => {
        try {
          const settings = JSON.parse(settingsJson) as Partial<AppSettings>
          set(state => ({
            ...state,
            ...settings,
            isSynced: false,
          }))

          // Sync with Firebase if user is authenticated
          const { currentUser, saveToFirebase } = get()
          if (currentUser) {
            try {
              await saveToFirebase()
            } catch (error) {
              console.error(
                'Failed to sync imported settings to Firebase:',
                error
              )
            }
          }

          return true
        } catch (error) {
          console.error('Failed to import settings:', error)
          return false
        }
      },

      // Firebase sync methods
      syncWithFirebase: async () => {
        const { currentUser, loadFromFirebase } = get()
        if (!currentUser) {
          console.warn('Cannot sync with Firebase: No authenticated user')
          return
        }

        try {
          await loadFromFirebase()
        } catch (error) {
          console.error('Firebase sync failed:', error)
        }
      },

      loadFromFirebase: async () => {
        const { currentUser } = get()
        if (!currentUser) return

        set({ isLoading: true })

        try {
          const firebaseSettings = await loadSettingsFromFirebase(currentUser)

          if (firebaseSettings) {
            set(state => ({
              ...state,
              ...firebaseSettings,
              isLoading: false,
              isSynced: true,
              lastSyncTime: new Date(),
            }))
          } else {
            // No settings in Firebase, use current local settings
            set(state => ({
              ...state,
              isLoading: false,
              isSynced: true,
              lastSyncTime: new Date(),
            }))
          }
        } catch (error) {
          console.error('Failed to load settings from Firebase:', error)
          set(state => ({
            ...state,
            isLoading: false,
          }))
        }
      },

      saveToFirebase: async () => {
        const { currentUser } = get()
        if (!currentUser) return

        const state = get()
        const settingsToSave: AppSettings = {
          appName: state.appName,
          appTitle: state.appTitle,
          appDescription: state.appDescription,
          appKeywords: state.appKeywords,
          appAuthor: state.appAuthor,
          appVersion: state.appVersion,
          appUrl: state.appUrl,
          allowGoogleAuth: state.allowGoogleAuth,
          allowNewUserRegistration: state.allowNewUserRegistration,
          requireEmailVerification: state.requireEmailVerification,
          allowGuestMode: state.allowGuestMode,
          restrictGoogleToExistingUsers: state.restrictGoogleToExistingUsers,
          enableDarkMode: state.enableDarkMode,
          enableMultiLanguage: state.enableMultiLanguage,
          enableNotifications: state.enableNotifications,
          enableAnalytics: state.enableAnalytics,
          aboutTitle: state.aboutTitle,
          aboutDescription: state.aboutDescription,
          contactEmail: state.contactEmail,
          supportUrl: state.supportUrl,
          privacyPolicyUrl: state.privacyPolicyUrl,
          termsOfServiceUrl: state.termsOfServiceUrl,
          sessionTimeout: state.sessionTimeout,
          maxLoginAttempts: state.maxLoginAttempts,
          enableMaintenanceMode: state.enableMaintenanceMode,
          maintenanceMessage: state.maintenanceMessage,
        }

        try {
          await saveSettingsToFirebase(currentUser, settingsToSave)
          set(state => ({
            ...state,
            isSynced: true,
            lastSyncTime: new Date(),
          }))
        } catch (error) {
          console.error('Failed to save settings to Firebase:', error)
          throw error
        }
      },

      // Internal state management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setCurrentUser: (user: { uid: string; email: string } | null) => {
        set({ currentUser: user })
      },

      loadGlobalDefaults: async () => {
        try {
          const globalSettings = await loadGlobalSettingsFromFirebase()
          if (globalSettings) {
            // Only update defaults that are actually set globally
            set(state => ({
              ...state,
              ...globalSettings,
            }))
          }
        } catch (error) {
          console.error('Failed to load global defaults:', error)
        }
      },
    }),
    {
      name: 'app-settings-storage',
      // Exclude Firebase-specific state from persistence
      partialize: state => {
        const {
          isLoading,
          isSynced,
          lastSyncTime,
          currentUser,
          setLoading,
          setCurrentUser,
          syncWithFirebase,
          loadFromFirebase,
          saveToFirebase,
          loadGlobalDefaults,
          ...persistedState
        } = state
        return persistedState
      },
    }
  )
)

// Helper to initialize user from NextAuth session
export const initializeUserFromSession = async (session: Session | null) => {
  const store = useGlobalSettingsStore.getState()

  if (session?.user?.email) {
    const user = {
      uid: session.user.id || session.user.email, // Use id or email as uid
      email: session.user.email,
    }

    console.info('Setting user from session:', user)
    store.setCurrentUser(user)

    // Load settings from Firebase for this user
    try {
      await store.loadFromFirebase()
    } catch (error) {
      console.error('Failed to load settings from Firebase:', error)
    }
  } else {
    console.info('No session user found')
    store.setCurrentUser(null)
  }
}
