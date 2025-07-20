import { Suspense } from 'react'

import { UsersPageContent } from '@/components/users/users-page-content'
import { UsersPageSkeleton } from '@/components/users/users-page-skeleton'

export const UserView = () => {
  return (
    <Suspense fallback={<UsersPageSkeleton />}>
      <UsersPageContent />
    </Suspense>
  )
}
