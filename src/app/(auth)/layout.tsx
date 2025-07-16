import { AuthLayout as AuthLayoutComponent } from '@/components/layout/auth-layout'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayoutComponent>{children}</AuthLayoutComponent>
}
