import { uuidv7 } from 'uuidv7'

/**
 * Generate a new UUID V7
 * UUID V7 is time-ordered and sortable, making it ideal for database primary keys
 * @returns A new UUID V7 string
 */
export function generateUserId(): string {
  return uuidv7()
}

/**
 * Validate if a string is a valid UUID V7 format
 * @param id The string to validate
 * @returns True if the string is a valid UUID V7 format
 */
export function isValidUserId(id: string): boolean {
  // UUID V7 regex pattern: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx
  const uuidv7Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidv7Regex.test(id)
}

/**
 * Extract timestamp from UUID V7
 * @param id UUID V7 string
 * @returns Date object representing when the UUID was generated
 */
export function getUuidTimestamp(id: string): Date | null {
  if (!isValidUserId(id)) {
    return null
  }

  try {
    // Extract first 48 bits (12 hex chars) which contain the timestamp in milliseconds
    const timestampHex = id.slice(0, 8) + id.slice(9, 13)
    const timestamp = parseInt(timestampHex, 16)
    return new Date(timestamp)
  } catch {
    return null
  }
}

/**
 * Generate a UUID V7 for testing purposes
 * @returns UUID V7 string
 */
export function generateUserIdForTesting(): string {
  return uuidv7()
}
