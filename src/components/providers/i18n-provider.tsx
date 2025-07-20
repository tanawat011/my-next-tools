'use client'

import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'

import i18n from '@/lib/i18n'
import { Language } from '@/lib/server-preferences'

export function I18nProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode
  initialLanguage?: Language
}) {
  useEffect(() => {
    // If we have an initial language from server, use it
    if (initialLanguage) {
      i18n.changeLanguage(initialLanguage)
    }
  }, [initialLanguage])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
