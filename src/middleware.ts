import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (
      token &&
      ['/signin', '/register', '/forgot-password'].includes(pathname)
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If user is not authenticated and trying to access protected routes, redirect to signin
    if (!token && pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/signin', req.url))
    }

    // Handle language detection and cookie setting
    const response = NextResponse.next()

    // Get existing language cookie
    const languageCookie = req.cookies.get('i18next')?.value

    // If no language cookie exists, try to detect from Accept-Language header
    if (!languageCookie) {
      const acceptLanguage = req.headers.get('accept-language')
      let detectedLanguage = 'en' // default

      if (acceptLanguage) {
        // Simple language detection - prioritize Thai if found
        if (acceptLanguage.includes('th')) {
          detectedLanguage = 'th'
        } else if (acceptLanguage.includes('en')) {
          detectedLanguage = 'en'
        }
      }

      // Set the language cookie
      response.cookies.set('i18next', detectedLanguage, {
        path: '/',
        maxAge: 31536000, // 1 year
        sameSite: 'lax',
      })
    }

    return response
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the logic
    },
  }
)

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
