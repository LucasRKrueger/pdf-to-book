import { useEffect } from 'react'
import { useUiStore } from '@/shared/model/uiStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-sepia', 'theme-light')
    root.classList.add(`theme-${theme}`)
  }, [theme])

  return <>{children}</>
}
