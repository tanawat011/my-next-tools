// Utility function to convert Firestore timestamp to JavaScript Date
export const convertTimestampToDate = (
  timestamp:
    | null
    | undefined
    | Date
    | string
    | number
    | {
        seconds: number
        nanoseconds: number
      }
): Date | null => {
  if (!timestamp) return null

  // If it's already a Date object, return it
  if (timestamp instanceof Date) return timestamp

  // If it's a Firestore timestamp object
  if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
    return new Date(
      timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
    )
  }

  // If it's a timestamp string or number, try to parse it
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp)
    return isNaN(date.getTime()) ? null : date
  }

  return null
}
