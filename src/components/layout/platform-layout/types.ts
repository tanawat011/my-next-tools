import { type Icon } from '@tabler/icons-react'

export interface SidebarNavItem {
  title: string
  url: string
  icon: Icon
  type?: 'modal' | 'sidebar-item'
}
