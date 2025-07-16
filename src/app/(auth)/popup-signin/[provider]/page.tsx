'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect } from 'react'

export default function PopupSignInPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const provider = params.provider as string
  const callbackUrl = searchParams.get('callbackUrl') || '/popup-callback'

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        // Trigger NextAuth sign in with the provider
        await signIn(provider, {
          callbackUrl,
          redirect: true, // This will redirect to the callback URL
        })
      } catch (error) {
        console.error('Popup sign in error:', error)
        // Send error to parent window
        window.opener?.postMessage(
          {
            type: 'auth-error',
            error:
              error instanceof Error ? error.message : 'Authentication failed',
          },
          window.location.origin
        )
      }
    }

    handleSignIn()
  }, [provider, callbackUrl])

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
        <h2 className="text-lg font-semibold">Redirecting to {provider}...</h2>
        <p className="text-muted-foreground text-sm">
          Please wait while we redirect you to authenticate with {provider}.
        </p>
      </div>
    </div>
  )
}
