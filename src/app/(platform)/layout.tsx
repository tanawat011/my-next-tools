import { PlatformLayout as PlatformLayoutComponent } from "@/components/layout/platform-layout"
import PlatformProvider from "./provider"

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <PlatformProvider><PlatformLayoutComponent>{children}</PlatformLayoutComponent></PlatformProvider>
}
