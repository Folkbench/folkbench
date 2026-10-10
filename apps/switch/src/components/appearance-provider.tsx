import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  preferencesQueryOptions,
  useSetPreferredTheme,
} from '@/features/preferences/queries'
import type { PreferredTheme } from '@/bridge'

const AppearanceContext = createContext<{
  theme: PreferredTheme
  resolvedTheme: 'light' | 'dark'
  pending: boolean
  setTheme: (theme: PreferredTheme) => void
  error: boolean
} | null>(null)

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const preferences = useQuery(preferencesQueryOptions)
  const mutation = useSetPreferredTheme()
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const theme = preferences.data?.theme ?? 'system'
  const resolvedTheme =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  return (
    <AppearanceContext
      value={{
        theme,
        resolvedTheme,
        pending: mutation.isPending,
        setTheme: (value) => mutation.mutate(value),
        error: mutation.isError,
      }}
    >
      {children}
    </AppearanceContext>
  )
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error('AppearanceProvider is required')
  return context
}
