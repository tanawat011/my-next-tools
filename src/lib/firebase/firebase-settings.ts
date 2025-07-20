/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  FieldValue,
  Timestamp,
} from 'firebase/firestore'

import type { AppSettings } from '@/types/settings'

import { db } from './firebase'

export interface FirebaseAppSettings extends AppSettings {
  userId: string
  lastUpdated: Timestamp | FieldValue
  version: string
}

/**
 * Save app settings to Firestore for the authenticated user
 */
export async function saveSettingsToFirebase(
  user: { uid: string; email: string },
  settings: AppSettings
): Promise<void> {
  try {
    const settingsRef = doc(db, 'globalSettings', 'app')
    const firebaseSettings: Omit<FirebaseAppSettings, 'lastUpdated'> & {
      lastUpdated: FieldValue
    } = {
      ...settings,
      userId: user.uid,
      lastUpdated: serverTimestamp(),
      version: '1.0',
    }

    await setDoc(settingsRef, firebaseSettings)
    console.info('Settings saved to Firebase successfully')
  } catch (error) {
    console.error('Error saving settings to Firebase:', error)
    throw new Error('Failed to save settings to Firebase')
  }
}

/**
 * Load app settings from Firestore for the authenticated user
 */
export async function loadSettingsFromFirebase(user: {
  uid: string
  email: string
}): Promise<AppSettings | null> {
  try {
    const settingsRef = doc(db, 'globalSettings', 'app')
    const settingsSnap = await getDoc(settingsRef)

    if (settingsSnap.exists()) {
      const data = settingsSnap.data() as FirebaseAppSettings
      // Extract only the AppSettings fields, excluding Firebase metadata
      const {
        userId: _userId,
        lastUpdated: _lastUpdated,
        version: _version,
        ...appSettings
      } = data

      console.info('Settings loaded from Firebase successfully')
      return appSettings as AppSettings
    } else {
      console.info('No settings found in Firebase for user')
      return null
    }
  } catch (error) {
    console.error('Error loading settings from Firebase:', error)
    throw new Error('Failed to load settings from Firebase')
  }
}

/**
 * Delete app settings from Firestore for the authenticated user
 */
export async function deleteSettingsFromFirebase(user: {
  uid: string
  email: string
}): Promise<void> {
  try {
    const settingsRef = doc(db, 'globalSettings', 'app')
    await setDoc(settingsRef, { deleted: true, lastUpdated: serverTimestamp() })
    console.info('Settings deleted from Firebase successfully')
  } catch (error) {
    console.error('Error deleting settings from Firebase:', error)
    throw new Error('Failed to delete settings from Firebase')
  }
}

/**
 * Save global app settings (admin only) - these are system-wide settings
 */
export async function saveGlobalSettingsToFirebase(
  settings: Partial<AppSettings>
): Promise<void> {
  try {
    const globalSettingsRef = doc(db, 'globalSettings', 'app')
    const firebaseSettings = {
      ...settings,
      lastUpdated: serverTimestamp(),
      version: '1.0',
    }

    await setDoc(globalSettingsRef, firebaseSettings, { merge: true })
    console.info('Global settings saved to Firebase successfully')
  } catch (error) {
    console.error('Error saving global settings to Firebase:', error)
    throw new Error('Failed to save global settings to Firebase')
  }
}

/**
 * Load global app settings - these are system-wide defaults
 */
export async function loadGlobalSettingsFromFirebase(): Promise<Partial<AppSettings> | null> {
  try {
    const globalSettingsRef = doc(db, 'globalSettings', 'app')
    const settingsSnap = await getDoc(globalSettingsRef)
    if (settingsSnap.exists()) {
      const data = settingsSnap.data()
      // Remove Firebase metadata
      const { lastUpdated: _lastUpdated, version: _version, ...settings } = data

      console.info('Global settings loaded from Firebase successfully')
      return settings as Partial<AppSettings>
    } else {
      console.info('No global settings found in Firebase')
      return null
    }
  } catch (error) {
    console.error('Error loading global settings from Firebase:', error)
    return null // Don't throw error for global settings
  }
}
