import { AuthProvider } from '@/components/providers/auth-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Language } from '@/lib/server-preferences'

export default function RootProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode
  initialLanguage?: Language
}) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="theme"
        enableColorScheme
      >
        <I18nProvider initialLanguage={initialLanguage}>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </>
  )
}
