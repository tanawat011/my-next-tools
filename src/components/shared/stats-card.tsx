'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  isLoading?: boolean
  className?: string
  children?: ReactNode
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  isLoading,
  className,
  children,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1 text-xs">
              {trend.label}
            </span>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

export interface StatsGridProps {
  children: ReactNode
  className?: string
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className || ''}`}
    >
      {children}
    </div>
  )
}
