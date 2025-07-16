import { SidebarProvider } from "@/components/ui/sidebar";


export default function PlatformProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        {children}
      </SidebarProvider>
    </>
  )
}
