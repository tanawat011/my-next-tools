'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, Suspense } from 'react'

function PopupCallbackContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  useEffect(() => {
    if (status === 'loading') return

    // If this is a popup callback
    if (window.opener && window.opener !== window) {
      if (error) {
        // Send error message to parent window
        window.opener.postMessage(
          {
            type: 'auth-error',
            error: error || 'Authentication failed',
          },
          window.location.origin
        )
        window.close()
      } else if (session) {
        // Send success message to parent window
        window.opener.postMessage(
          {
            type: 'auth-success',
            session,
          },
          window.location.origin
        )
        window.close()
      } else {
        // No session yet, wait a bit more then send error
        const timeout = setTimeout(() => {
          window.opener.postMessage(
            {
              type: 'auth-error',
              error: 'No session established',
            },
            window.location.origin
          )
          window.close()
        }, 3000) // Wait 3 seconds for session to be established

        // Clean up timeout if component unmounts
        return () => clearTimeout(timeout)
      }
    } else {
      // Not a popup, redirect normally
      if (error) {
        router.push('/signin?error=' + encodeURIComponent(error))
      } else if (session) {
        router.push('/dashboard')
      } else {
        // Wait a bit for session to load
        const timeout = setTimeout(() => {
          router.push('/signin')
        }, 2000)

        return () => clearTimeout(timeout)
      }
    }
  }, [session, status, error, router])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
        <h2 className="text-lg font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground text-sm">
          {status === 'loading'
            ? 'Loading session...'
            : 'Finalizing sign in...'}
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error === 'OAuthAccountNotLinked'
              ? 'This email is already associated with another account. Please sign in with your original method.'
              : `Error: ${error}`}
          </p>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
        <h2 className="text-lg font-semibold">Loading...</h2>
        <p className="text-muted-foreground text-sm">
          Preparing authentication...
        </p>
      </div>
    </div>
  )
}

export default function PopupCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PopupCallbackContent />
    </Suspense>
  )
}
