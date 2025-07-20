'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  backButton?: boolean
  backHref?: string
  className?: string
  children?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  actions,
  backButton = false,
  backHref,
  className,
  children,
}: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {backButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
