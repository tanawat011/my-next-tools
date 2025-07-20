import { cookies } from 'next/headers'

export type Language = 'en' | 'th'
export type Theme = 'light' | 'dark' | 'system'

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get('i18next')?.value

  // Check if the language is one of our supported languages
  if (languageCookie && ['en', 'th'].includes(languageCookie)) {
    return languageCookie as Language
  }

  // Default to English if no valid cookie found
  return 'en'
}

export async function getServerTheme(): Promise<Theme> {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value

  // Check if the theme is one of our supported themes
  if (themeCookie && ['light', 'dark', 'system'].includes(themeCookie)) {
    return themeCookie as Theme
  }

  // Default to system theme if no valid cookie found
  return 'system'
}

export function setLanguageCookie(language: Language) {
  return `i18next=${language}; Path=/; Max-Age=31536000; SameSite=Lax`
}

export function setThemeCookie(theme: Theme) {
  return `theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`
}
