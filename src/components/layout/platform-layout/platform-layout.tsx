'use client'

import { SiteHeader } from '@/components/layout/platform-layout/site-header'
import { SidebarInset } from '@/components/ui/sidebar'
import { Language } from '@/lib/server-preferences'

import { AppSidebar } from './app-sidebar'
import { ContentContainer } from './content-container'

interface PlatformLayoutProps {
  children: React.ReactNode
  initialLanguage?: Language
}

export function PlatformLayout({
  children,
  initialLanguage,
}: PlatformLayoutProps) {
  return (
    <>
      <AppSidebar variant="floating" />
      <SidebarInset>
        <SiteHeader initialLanguage={initialLanguage} />
        <ContentContainer>{children}</ContentContainer>
      </SidebarInset>
    </>
  )
}
