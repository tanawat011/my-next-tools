'use client'

import { useRouter } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'

export function useGooglePopupAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const testPopupBlocking = (): boolean => {
    try {
      const testPopup = window.open('', 'test', 'width=1,height=1')
      if (!testPopup || testPopup.closed) {
        return false
      }
      testPopup.close()
      return true
    } catch {
      return false
    }
  }

  const signInWithGooglePopup = async (provider: string) => {
    setIsLoading(true)
    setError(null)

    // Test if popups are blocked
    if (!testPopupBlocking()) {
      const errorMessage =
        'Popups are blocked in your browser. Please allow popups for this site and try again.'
      setError(errorMessage)
      toast.error('Popup Blocked', {
        description: errorMessage,
      })
      setIsLoading(false)
      return false
    }

    try {
      // Calculate popup position (center of screen)
      const width = 500
      const height = 600
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      // Open the popup with Google authentication
      const popup = window.open(
        `/popup-signin/${provider}?callbackUrl=${encodeURIComponent('/popup-callback')}`,
        'google-auth-popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no,directories=no`
      )

      if (!popup) {
        throw new Error(
          'Popup was blocked by your browser. Please allow popups for this site and try again.'
        )
      }

      // Focus the popup window
      popup.focus()

      // Listen for popup messages
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return

        if (event.data.type === 'auth-success') {
          popup.close()
          window.removeEventListener('message', handleMessage)
          clearInterval(checkClosed)

          // Refresh session and redirect
          await new Promise(resolve => setTimeout(resolve, 1000))
          const session = await getSession()
          if (session) {
            toast.success('Success', {
              description: 'You have been successfully signed in with Google.',
            })
            router.push('/dashboard')
            setIsLoading(false)
          } else {
            const errorMessage =
              'Session could not be established. Please try again.'
            setError(errorMessage)
            toast.error('Authentication Error', {
              description: errorMessage,
            })
            setIsLoading(false)
          }
        } else if (event.data.type === 'auth-error') {
          popup.close()
          window.removeEventListener('message', handleMessage)
          clearInterval(checkClosed)

          const error = event.data.error || 'Unknown error'
          let errorMessage = `Authentication failed: ${error}`
          let toastTitle = 'Google Sign In Failed'

          // Handle specific error types
          if (error === 'OAuthAccountNotLinked') {
            errorMessage =
              'This email is already associated with another account. Please sign in with your original method (email/password) first.'
            toastTitle = 'Account Already Exists'
          }

          setError(errorMessage)
          toast.error(toastTitle, {
            description: errorMessage,
          })
          setIsLoading(false)
        }
      }

      window.addEventListener('message', handleMessage)

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          setIsLoading(false)
        }
      }, 1000)
    } catch (error) {
      console.error('Google popup auth error:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Authentication failed. Please try again.'
      setError(errorMessage)
      toast.error('Authentication Error', {
        description: errorMessage,
      })
      setIsLoading(false)
      return false
    }
  }

  return {
    signInWithGooglePopup,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
