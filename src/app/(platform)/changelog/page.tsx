import { Suspense } from 'react'

import { ChangelogViewer } from '@/components/changelog'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Changelog',
  description: 'All notable changes to this project are documented here',
}

function ChangelogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Mock changelog entries */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="ml-6 space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ChangelogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ChangelogSkeleton />}>
        <ChangelogViewer className="mx-auto max-w-4xl" />
      </Suspense>
    </div>
  )
}
