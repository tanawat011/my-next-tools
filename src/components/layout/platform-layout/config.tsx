import {
  IconDashboard,
  IconFolder,
  IconHelp,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'

export const NAV_MAIN = [
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

export const NAV_SECONDARY = [
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

export const NAV_DOCUMENTS = [
  {
    name: 'Introduction',
    url: '#',
    icon: IconFolder,
  },
  {
    name: 'Getting Started',
    url: '#',
    icon: IconFolder,
  },
  {
    name: 'User Guide',
    url: '#',
    icon: IconFolder,
  },
  {
    name: 'API Reference',
    url: '#',
    icon: IconFolder,
  },
]
