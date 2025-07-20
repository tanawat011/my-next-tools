import { PlatformLayout as PlatformLayoutComponent } from '@/components/layout/platform-layout'
import { getServerLanguage } from '@/lib/server-preferences'

import PlatformProvider from './provider'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const language = await getServerLanguage()

  return (
    <PlatformProvider>
      <PlatformLayoutComponent initialLanguage={language}>
        {children}
      </PlatformLayoutComponent>
    </PlatformProvider>
  )
}
