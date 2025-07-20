'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadGlobalSettingsFromFirebase } from '@/lib/firebase/firebase-settings'
import { cn } from '@/lib/utils'
import type { AppSettings } from '@/types/settings'

const signinSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

type SigninFormData = z.infer<typeof signinSchema>

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [globalSettings, setGlobalSettings] =
    useState<Partial<AppSettings> | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  // Load global settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true)
        const settings = await loadGlobalSettingsFromFirebase()
        setGlobalSettings(settings)
      } catch (error) {
        console.error('Failed to load global settings:', error)
        // Continue with defaults if loading fails
        setGlobalSettings(null)
      } finally {
        setSettingsLoading(false)
      }
    }

    loadSettings()
  }, [])

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      let toastTitle = 'Sign In Failed'
      let toastDescription = 'Invalid email or password. Please try again.'

      setTimeout(() => {
        if (error === 'google-invalid-signin') {
          toastTitle = 'Failed to sign in with Google'
          toastDescription =
            'You are not authorized to sign in. Please contact support.'
        }

        if (error === 'google-user-not-allowed') {
          toastTitle = 'Google Sign-in Restricted'
          toastDescription =
            'Google sign-in is restricted to existing users only. Please contact support or use credentials to sign in.'
        }

        if (error === 'invalid-signin') {
          toastTitle = 'Failed to sign in'
          toastDescription = 'Invalid email or password. Please try again.'
        }

        toast.error(toastTitle, {
          duration: 5000,
          position: 'top-center',
          description: toastDescription,
        })
      }, 500)

      router.push('/signin', { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Sign In Failed', {
          description: 'Invalid email or password. Please try again.',
        })
      } else {
        toast.success('Success', {
          description: 'You have been successfully signed in.',
        })
        router.push('/dashboard')
      }
    } catch {
      toast.error('Error', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    await signIn('google')
  }

  // Default values with global settings override
  const appName = globalSettings?.appName || 'My Next Tools'
  const allowGoogleAuth = globalSettings?.allowGoogleAuth !== false // Default to true
  const allowNewUserRegistration =
    globalSettings?.allowNewUserRegistration !== false // Default to true

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {settingsLoading
              ? 'Sign in to your account'
              : `Sign in to ${appName}`}
          </CardTitle>
          <CardDescription>
            {allowGoogleAuth
              ? 'Choose your preferred sign in method below'
              : 'Enter your credentials to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {/* Google Sign-in - Only show if enabled in global settings */}
              {allowGoogleAuth && (
                <>
                  <div className="flex flex-col gap-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                      Or continue with
                    </span>
                  </div>
                </>
              )}
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={_checked => {
                      // Handle checkbox change
                    }}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sign up link - Only show if new user registration is enabled */}
      {allowNewUserRegistration && (
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </div>
      )}
    </div>
  )
}
