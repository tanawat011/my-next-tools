import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "@/components/site-header";

export function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </>
  )
}