export interface AppSettings {
  // App Configuration
  appName: string
  appTitle: string
  appDescription: string
  appKeywords: string[]
  appAuthor: string
  appVersion: string
  appUrl: string

  // Authentication Settings
  allowGoogleAuth: boolean
  allowNewUserRegistration: boolean
  requireEmailVerification: boolean
  allowGuestMode: boolean
  restrictGoogleToExistingUsers: boolean // Only allow Google sign-in for users that already exist in Firebase

  // Feature Settings
  enableDarkMode: boolean
  enableMultiLanguage: boolean
  enableNotifications: boolean
  enableAnalytics: boolean

  // About Information
  aboutTitle: string
  aboutDescription: string
  contactEmail: string
  supportUrl: string
  privacyPolicyUrl: string
  termsOfServiceUrl: string

  // Advanced Settings
  sessionTimeout: number // in minutes
  maxLoginAttempts: number
  enableMaintenanceMode: boolean
  maintenanceMessage: string
}

export interface AboutInfo {
  title: string
  description: string
  version: string
  author: string
  contactEmail: string
  website: string
  license: string
  lastUpdated: string
}
