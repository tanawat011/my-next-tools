import { Suspense } from 'react'

import { ResetPasswordView } from '@/views/auth/reset-password'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordView />
    </Suspense>
  )
}
