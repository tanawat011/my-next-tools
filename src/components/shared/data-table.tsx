'use client'

import { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface DataTableColumn<T> {
  key: keyof T | string
  label: string
  render?: (value: unknown, item: T) => ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  title?: string
  subtitle?: string
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  loadMoreText?: string
  emptyText?: string
  emptySubtext?: string
  skeletonRows?: number
  className?: string
  actions?: ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  isLoading,
  hasMore,
  onLoadMore,
  loadMoreText = 'Load More',
  emptyText = 'No data found',
  emptySubtext,
  skeletonRows = 8,
  className,
  actions,
}: DataTableProps<T>) {
  const renderCell = (column: DataTableColumn<T>, item: T) => {
    if (column.render) {
      return column.render(item[column.key as keyof T], item)
    }
    return item[column.key as keyof T]
  }

  if (isLoading && data.length === 0) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{title}</CardTitle>
                {subtitle && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions}
            </div>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                {columns.map((column, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className={`h-4 ${
                      colIndex === 0 ? 'w-[200px]' : 'w-[100px]'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {subtitle && (
                <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead
                    key={column.key as string}
                    className={column.headerClassName}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  {columns.map(column => (
                    <TableCell
                      key={column.key as string}
                      className={column.className}
                    >
                      {renderCell(column, item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.length === 0 && !isLoading && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-lg">{emptyText}</p>
            {emptySubtext && (
              <p className="text-muted-foreground mt-2 text-sm">
                {emptySubtext}
              </p>
            )}
          </div>
        )}

        {hasMore && onLoadMore && (
          <div className="border-t p-4">
            <Button
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? 'Loading...' : loadMoreText}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
