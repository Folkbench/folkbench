import { Outlet } from '@tanstack/react-router'

import { Toaster } from '@/components/ui/sonner'
import { useAppearance } from '@/components/appearance-provider'

export function RootLayout() {
  const { resolvedTheme } = useAppearance()
  return (
    <>
      <Outlet />
      <Toaster theme={resolvedTheme} />
    </>
  )
}
