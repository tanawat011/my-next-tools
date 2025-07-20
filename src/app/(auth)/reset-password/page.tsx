import { Suspense } from 'react'

import { ResetPasswordView } from '@/components/views/auth/reset-password'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordView />
    </Suspense>
  )
}
