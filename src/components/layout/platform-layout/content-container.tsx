import { ReactNode } from 'react'

export interface ContentContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function ContentContainer({
  children,
  className,
  maxWidth = 'full',
}: ContentContainerProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }[maxWidth]

  return (
    <div
      className={`container mx-auto px-4 py-6 sm:px-6 lg:px-8 ${maxWidthClass} ${className || ''}`}
    >
      {children}
    </div>
  )
}
