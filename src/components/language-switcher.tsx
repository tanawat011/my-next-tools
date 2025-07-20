'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LanguageSwitcherProps {
  initialLanguage?: string
}

export function LanguageSwitcher({ initialLanguage }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng)
    // Set cookie for server-side persistence
    document.cookie = `i18next=${lng}; path=/; max-age=31536000; samesite=lax`
  }

  const getCurrentLanguageFlag = () => {
    // Use server-detected language during SSR, then client language after hydration
    const currentLanguage = isClient ? i18n.language : initialLanguage || 'en'

    switch (currentLanguage) {
      case 'th':
        return '🇹🇭'
      case 'en':
      default:
        return '🇺🇸'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <span className="text-base" role="img" aria-label="Current language">
            {getCurrentLanguageFlag()}
          </span>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          <span className="mr-2 text-base" role="img" aria-label="English">
            🇺🇸
          </span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('th')}>
          <span className="mr-2 text-base" role="img" aria-label="Thai">
            🇹🇭
          </span>
          ไทย
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
