import { SiteHeader } from '@/components/site-header'
import { SidebarInset } from '@/components/ui/sidebar'

import { AppSidebar } from './app-sidebar'

export function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar variant="floating" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </>
  )
}
