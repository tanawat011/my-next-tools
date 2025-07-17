import { AuthProvider } from '@/components/providers/auth-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export default function RootProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <I18nProvider>
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
