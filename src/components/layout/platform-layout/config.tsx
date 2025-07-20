import {
  IconDashboard,
  IconFolder,
  IconHelp,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'

import { SidebarNavItem } from './types'

export const NAV_MAIN: SidebarNavItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: IconDashboard,
  },
  {
    title: 'Tools',
    url: '#',
    icon: IconFolder,
  },
]

export const NAV_SECONDARY: SidebarNavItem[] = [
  {
    title: 'Users',
    url: '/users',
    icon: IconUsers,
  },
  {
    title: 'Global Settings',
    url: '/global-settings',
    icon: IconSettings,
  },
  {
    title: 'About Us',
    url: '#',
    icon: IconHelp,
    type: 'modal',
  },
  {
    title: 'Search',
    url: '#',
    icon: IconSearch,
  },
]

export const NAV_DOCUMENTS: SidebarNavItem[] = [
  {
    title: 'Introduction',
    url: '#',
    icon: IconFolder,
  },
  {
    title: 'Getting Started',
    url: '#',
    icon: IconFolder,
  },
  {
    title: 'User Guide',
    url: '#',
    icon: IconFolder,
  },
  {
    title: 'API Reference',
    url: '#',
    icon: IconFolder,
  },
]
