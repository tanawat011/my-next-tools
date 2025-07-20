'use client'

import * as React from 'react'

import { AboutDialog } from '@/components/shared/about-dialog'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { SidebarNavItem } from './types'

export interface NavSecondaryProps
  extends React.ComponentPropsWithoutRef<typeof SidebarGroup> {
  items: SidebarNavItem[]
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
  const [showAboutDialog, setShowAboutDialog] = React.useState(false)

  const handleItemClick = (item: { title: string; url: string }) => {
    if (item.title === 'About Us') {
      setShowAboutDialog(true)
    } else if (item.url !== '#') {
      // Handle normal navigation for other items
      window.location.href = item.url
    }
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a
                  href={item.url}
                  {...(item.type === 'modal' && {
                    onClick: () => handleItemClick(item),
                  })}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>

      <AboutDialog open={showAboutDialog} onOpenChange={setShowAboutDialog} />
    </SidebarGroup>
  )
}
